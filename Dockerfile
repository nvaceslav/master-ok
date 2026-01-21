# Этап 1: Сборка фронтенда
FROM node:18-alpine as build-stage
WORKDIR /app
COPY app/frontend/package.json app/frontend/package-lock.json ./
RUN npm install
COPY app/frontend/ ./
RUN npm run build

# Этап 2: Бэкенд + фронтенд
FROM php:8.2-apache
WORKDIR /var/www/html

RUN apt-get update && apt-get install -y \
    libzip-dev zip unzip \
    && docker-php-ext-install zip pdo pdo_mysql

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
COPY app/backend/ .
COPY --from=build-stage /app/build/ public/

# УДАЛЯЕМ ВСЕ PUSHER НАСТРОЙКИ!
RUN if [ -f .env ]; then \
    sed -i '/PUSHER_/d' .env; \
    sed -i '/BROADCAST_DRIVER=/d' .env; \
    fi
RUN echo "BROADCAST_DRIVER=log" >> .env

RUN composer install --no-dev --optimize-autoloader

# ФИКС APACHE MPM
RUN a2dismod mpm_event mpm_worker
RUN a2enmod mpm_prefork
RUN a2enmod rewrite

RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 775 /var/www/html/storage \
    && chmod -R 775 /var/www/html/bootstrap/cache

EXPOSE 80
CMD ["apache2-foreground"]