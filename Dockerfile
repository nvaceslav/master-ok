# Этап 1: Сборка фронтенда
FROM node:18-alpine as build-stage
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Этап 2: Бэкенд + фронтенд
FROM php:8.2-apache
WORKDIR /var/www/html

# Устанавливаем зависимости PHP
RUN apt-get update && apt-get install -y \
    libzip-dev \
    zip \
    unzip \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install zip pdo pdo_mysql gd

# Устанавливаем Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Копируем бэкенд
COPY backend/ .

# Копируем собранный фронтенд в public
COPY --from=build-stage /app/build/ public/

# Устанавливаем зависимости Laravel
RUN composer install --no-dev --optimize-autoloader \
    && php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache

# Настройка Apache для SPA
RUN echo '<VirtualHost *:80>\n\
    DocumentRoot /var/www/html/public\n\
    <Directory /var/www/html/public>\n\
        AllowOverride All\n\
        Require all granted\n\
        FallbackResource /index.php\n\
    </Directory>\n\
</VirtualHost>' > /etc/apache2/sites-available/000-default.conf

RUN a2enmod rewrite

# Настройка прав
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 775 /var/www/html/storage \
    && chmod -R 775 /var/www/html/bootstrap/cache

# Создаём .env если нет
RUN if [ ! -f .env ]; then cp .env.example .env; fi

EXPOSE 80
CMD ["apache2-foreground"]