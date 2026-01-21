# Этап 1: Сборка фронтенда
FROM node:18-alpine as build-stage
WORKDIR /app
COPY app/frontend/package.json app/frontend/package-lock.json ./
RUN npm install
COPY app/frontend/ ./
RUN npm run build

# Этап 2: Nginx
FROM nginx:alpine

# Копируем собранный фронтенд
COPY --from=build-stage /app/build/ /usr/share/nginx/html

# Создаём nginx конфиг
RUN echo 'server { \
    listen 80; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    location / { \
        try_files \$uri \$uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]