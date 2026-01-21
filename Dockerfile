# Этап 1: Сборка фронтенда
FROM node:18-alpine as build-stage

WORKDIR /app

# Копируем package.json
COPY app/frontend/package*.json ./

# Устанавливаем ВСЕ зависимости (включая dev)
RUN npm ci

# Копируем исходники
COPY app/frontend/ ./

# Устанавливаем @types/jest для исправления ошибки
RUN npm install --save-dev @types/jest

# Запускаем сборку
RUN npm run build

# Этап 2: Nginx
FROM nginx:alpine

# Копируем собранный фронтенд (React создает папку build)
COPY --from=build-stage /app/build /usr/share/nginx/html

# Конфиг nginx
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