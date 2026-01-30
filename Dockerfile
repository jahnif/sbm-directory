# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Create app-specific temp directory to avoid conflicts
RUN mkdir -p /app/.next/cache && \
    chown -R nextjs:nodejs /app/.next/cache && \
    chown -R nextjs:nodejs /tmp && \
    chmod -R 1777 /tmp

# Copy built assets
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Set temp directory environment variables
ENV TMPDIR=/tmp
ENV TEMP=/tmp
ENV TMP=/tmp
# Use app-specific cache directory to avoid file locking issues
ENV NEXT_PRIVATE_STANDALONE_CACHE_DIR=/app/.next/cache

CMD ["node", "server.js"]
