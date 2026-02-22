# Stage 1: Build React/Vite Asset Bundle
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies rapidly via Alpine
COPY package*.json ./
RUN npm install

# Copy source and generate strict production artifacts
COPY . .
RUN npm run build

# Stage 2: Serve compiled DOM via Nginx
FROM nginx:alpine

# Copy dist compilation
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy the strict Nginx Routing configuration bridging frontend and backend
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
