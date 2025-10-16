FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf
COPY dist /usr/share/nginx/html

# Create necessary directories and set permissions
RUN mkdir -p /tmp /var/cache/nginx /var/log/nginx && \
    chmod 755 /tmp && \
    chown -R nginx:nginx /var/cache/nginx /var/log/nginx /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
