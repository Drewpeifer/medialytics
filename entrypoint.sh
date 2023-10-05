#!/bin/sh

ROOT_DIR=/usr/share/nginx/html

echo "Replacing env constants in JS"
for file in $ROOT_DIR/js/*.js;
do
  echo "Processing $file ...";

  sed -i 's|SERVER_TOKEN|'${SERVER_TOKEN}'|g' $file
  sed -i 's|SERVER_IP|'${SERVER_IP}'|g' $file

done

# Let container execution proceed
exec "$@"