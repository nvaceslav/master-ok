# Этап 1: Сборка фронтенда
FROM node:18-alpine as build-stage

WORKDIR /app

# Копируем package.json и package-lock.json
COPY frontend/package.json frontend/package-lock.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем остальные файлы фронтенда
COPY app/frontend/ ./

# Собираем проект
RUN npm run build

# Этап 2: Бэкенд + фронтенд
FROM php:8.2-apache

WORKDIR /var/www/html

# Устанавливаем минимальные зависимости PHP
RUN apt-get update && apt-get install -y \
    libzip-dev \
    zip \
    unzip \
    && docker-php-ext-install zip pdo pdo_mysql

# Устанавливаем Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Копируем бэкенд Laravel
COPY backend/ .

# Копируем собранный фронтенд в папку public
COPY --from=build-stage /app/build/ public/

# Устанавливаем зависимости Laravel
RUN composer install --no-dev --optimize-autoloader

# Настраиваем Apache
RUN a2enmod rewrite

# Настраиваем права
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 775 /var/www/html/storage \
    && chmod -R 775 /var/www/html/bootstrap/cache

EXPOSE 80
CMD ["apache2-foreground"]