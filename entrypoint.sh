#!/bin/sh

ROOT_DIR=/usr/share/nginx/html

echo "Medialytics - OAuth Authentication Enabled"
echo "No configuration needed - authentication and server discovery handled automatically"

# Let container execution proceed
exec "$@"
