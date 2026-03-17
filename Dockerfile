FROM nginx:alpine

# OAuth authentication handles all configuration automatically
# No environment variables needed

COPY app /usr/share/nginx/html

# Copy entrypoint script as /entrypoint.sh
COPY ./entrypoint.sh /docker-entrypoint.d/entrypoint.sh

# Grant Linux permissions and run entrypoint script
RUN chmod +x /docker-entrypoint.d/entrypoint.sh
