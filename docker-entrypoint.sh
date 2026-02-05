#!/bin/sh
set -e

# Ensure cache and temp directories exist with correct permissions
mkdir -p /app/.next/cache/images /app/tmp

# Clean any stale files from previous runs that might cause ETXTBSY
rm -f /app/tmp/* 2>/dev/null || true

# Execute the CMD
exec "$@"
