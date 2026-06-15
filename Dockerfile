# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production

COPY --from=builder /usr/src/app/dist ./dist

# Đặt mặc định cổng chạy là 8000 để khớp với mapping trong docker-compose chung
ENV PORT=8000

EXPOSE 8000

CMD ["node", "dist/main"]
