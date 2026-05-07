# Gunakan image resmi PHP dengan fpm
FROM php:8.2-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    nginx

# Bersihkan apt cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install ext PHP yang dibutuhkan Laravel
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Mengambil Composer terbaru
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy konfigurasi Nginx dari folder docker/nginx.conf
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Setel port ke 8080 untuk Cloud Run
ENV PORT=8080

# Salin script bash unuk entrypoint
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Salin codebase aplikasi Laravel (Diasumsikan Laravel dicopy ke /var/www)
# COPY . /var/www
# RUN composer install --no-dev --optimize-autoloader
# RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

# Buka port (nanti dibaca oleh Cloud Run)
EXPOSE 8080

ENTRYPOINT ["entrypoint.sh"]
