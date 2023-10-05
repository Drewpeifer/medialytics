FROM nginx:alpine

ARG SERVER_TOKEN
ENV SERVER_TOKEN=$SERVER_TOKEN

ARG SERVER_IP
ENV SERVER_IP=$SERVER_IP

COPY app /usr/share/nginx/html

# Copy entrypoint script as /entrypoint.sh
COPY ./entrypoint.sh /docker-entrypoint.d/entrypoint.sh

# Grant Linux permissions and run entrypoint script
RUN chmod +x /docker-entrypoint.d/entrypoint.sh
