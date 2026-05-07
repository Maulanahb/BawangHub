#!/bin/sh
# Ganti port nginx pakai port dari env variable $PORT
sed -i "s/listen 8080;/listen ${PORT:-8080};/g" /etc/nginx/nginx.conf

# Start php-fpm di background
php-fpm -D

# Start Nginx
nginx -g "daemon off;"
