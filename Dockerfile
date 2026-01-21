# Этап 1: Сборка фронтенда
FROM node:18-alpine as frontend-builder

WORKDIR /app
COPY ./frontend/package*.json ./
RUN npm install --silent
COPY ./frontend/ ./
RUN npm run build

# Этап 2: Бэкенд + фронтенд
FROM php:8.2-apache

WORKDIR /var/www/html

# Зависимости PHP
RUN apt-get update && apt-get install -y \
    libzip-dev \
    zip \
    unzip \
    && docker-php-ext-install zip pdo pdo_mysql

# Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Копируем бэкенд
COPY ./backend/ .

# Копируем собранный фронтенд
COPY --from=frontend-builder /app/build/ ./public/

# Устанавливаем зависимости Laravel
RUN composer install --no-dev --optimize-autoloader

# Настройки Apache
RUN a2enmod rewrite

# Настраиваем права
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 775 /var/www/html/storage \
    && chmod -R 775 /var/www/html/bootstrap/cache

EXPOSE 80
CMD ["apache2-foreground"]