#!/bin/sh
set -e

# Remove any stale socket and cache files that may cause ETXTBSY errors
rm -f /tmp/next-server /app/tmp/next-server
rm -f /var/tmp/* 2>/dev/null || true
rm -rf /app/.next/cache/images/* 2>/dev/null || true

# Ensure temp directories exist with correct permissions
mkdir -p /app/tmp /app/.next/cache/images

# Execute the CMD from Dockerfile
exec "$@"
