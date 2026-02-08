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

RUN npm run build

# Stage 3: Runner
FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Create cache directory and binary storage with correct permissions
RUN mkdir -p /app/.next/cache /app/.next/cache/images /app/.next-bins && \
    chown -R nextjs:nodejs /app/.next/cache /app/.next-bins && \
    chmod -R 755 /app/.next/cache

# Copy built assets
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy and set up entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Pre-extract SWC binaries at build time to prevent ETXTBSY race condition
# This starts a minimal HTTP server which triggers binary extraction, then makes them read-only
RUN node -e " \
  const http = require('http'); \
  const s = http.createServer((req,res) => res.end('ok')); \
  s.listen(0, () => { setTimeout(() => { s.close(); process.exit(0); }, 5000); }); \
" 2>/dev/null || true && \
chmod 555 /tmp/next-server /tmp/nextjs /tmp/grep 2>/dev/null || true && \
cp /tmp/next-server /tmp/nextjs /tmp/grep /app/.next-bins/ 2>/dev/null || true

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "server.js"]
