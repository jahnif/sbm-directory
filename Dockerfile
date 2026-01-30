# Stage 1: Dependencies
FROM node:22.13.1-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Builder
FROM node:22.13.1-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# Stage 3: Runner
FROM node:22.13.1-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Create app-specific temp directory to avoid conflicts
RUN mkdir -p /app/.next/cache /app/.next/cache/images /app/tmp && \
    chown -R nextjs:nodejs /app/.next/cache /app/tmp && \
    chown -R nextjs:nodejs /tmp && \
    chmod -R 1777 /tmp /app/tmp && \
    chmod -R 755 /app/.next/cache

# Copy built assets
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy and set up entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Set temp directory environment variables
ENV TMPDIR=/app/tmp
ENV TEMP=/app/tmp
ENV TMP=/app/tmp
# Use app-specific cache directory to avoid file locking issues
ENV NEXT_PRIVATE_STANDALONE_CACHE_DIR=/app/.next/cache

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "server.js"]
