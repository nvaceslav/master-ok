# Этап 1: Сборка фронтенда
FROM node:18-alpine as build-stage
WORKDIR /app
COPY app/frontend/package.json app/frontend/package-lock.json ./
RUN npm install
COPY app/frontend/ ./
RUN npm run build

# Этап 2: Используем Nginx вместо Apache (проще!)
FROM nginx:alpine

# Копируем собранный фронтенд
COPY --from=build-stage /app/build/ /usr/share/nginx/html

# Копируем Laravel бэкенд (будет на другом порту)
COPY app/backend/ /var/www/backend/

# Настройка Nginx для SPA
RUN echo 'server {\n\
    listen 80;\n\
    server_name localhost;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    \n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
    \n\
    location /api {\n\
        proxy_pass http://localhost:8000;\n\
        proxy_set_header Host $host;\n\
        proxy_set_header X-Real-IP $remote_addr;\n\
    }\n\
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]