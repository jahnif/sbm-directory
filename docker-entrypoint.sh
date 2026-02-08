#!/bin/sh
set -e

# Ensure cache directory exists
mkdir -p /app/.next/cache/images

# Copy pre-extracted SWC binaries from build-time to /tmp
# Make them read-only to prevent ETXTBSY race condition
cp /app/.next-bins/* /tmp/ 2>/dev/null || true
chmod 555 /tmp/next-server /tmp/nextjs /tmp/grep 2>/dev/null || true

# Execute the CMD
exec "$@"
