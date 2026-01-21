# Этап 1: Сборка фронтенда
FROM node:18-alpine as build-stage

# Создаем директорию и копируем package.json из правильного места
WORKDIR /app
COPY app/frontend/package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production

# Копируем исходники
COPY app/frontend/ ./

# Запускаем сборку
RUN npm run build

# Этап 2: Nginx
FROM nginx:alpine

# Копируем собранный фронтенд
# ПРОВЕРЬТЕ: какая папка создается при сборке? build/ или dist/?
COPY --from=build-stage /app/build /usr/share/nginx/html
# ИЛИ если создается dist:
# COPY --from=build-stage /app/dist /usr/share/nginx/html

# Простой конфиг nginx
RUN echo 'server { \
    listen 80; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]