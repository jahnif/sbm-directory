# Stage 1: Dependencies
FROM node:22-slim AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Builder
FROM node:22-slim AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Create temp directory for build process to prevent ETXTBSY
RUN mkdir -p /tmp/build-tmp && chmod 1777 /tmp/build-tmp
ENV TMPDIR=/tmp/build-tmp

RUN npm run build

# Stage 3: Runner
FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Create cache and temp directories with correct permissions
RUN mkdir -p /app/.next/cache /app/.next/cache/images /app/tmp && \
    chown -R nextjs:nodejs /app/.next/cache /app/tmp && \
    chmod -R 755 /app/.next/cache && \
    chmod -R 1777 /app/tmp

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

# Redirect temp directory to app-owned location to prevent ETXTBSY on /tmp
ENV TMPDIR=/app/tmp
ENV NEXT_SWC_TMPDIR=/app/tmp

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "server.js"]
