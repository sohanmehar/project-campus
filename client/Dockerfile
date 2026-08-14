# Multi-stage Dockerfile for CampusGPT Frontend
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json tsconfig*.json vite.config.ts ./
RUN npm install

COPY index.html ./
COPY src/ ./src/
COPY public/ ./public/

RUN npm run build

# Nginx Stage for Static Hosting
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
