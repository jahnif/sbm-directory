#!/bin/sh
set -e

# Remove any stale socket files that may cause ETXTBSY errors
rm -f /tmp/next-server /app/tmp/next-server

# Execute the CMD from Dockerfile
exec "$@"
