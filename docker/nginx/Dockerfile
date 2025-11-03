FROM nginx:stable-alpine

# Copy custom nginx configuration
COPY default.conf /etc/nginx/conf.d/default.conf

# Create directory for ACME webroot
RUN mkdir -p /var/www/letsencrypt && chown -R nginx:nginx /var/www/letsencrypt

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
