#!/bin/sh
set -e

# Ensure cache directory exists
mkdir -p /app/.next/cache/images

# Execute the CMD
exec "$@"
