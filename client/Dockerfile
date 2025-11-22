FROM node:24-alpine AS builder
ARG VITE_API_URL
WORKDIR /app
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/
RUN npm ci
COPY client/ ./client/
COPY server/ ./server/
WORKDIR /app/client
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build
FROM nginx:alpine AS runner
COPY --from=builder /app/client/dist /usr/share/nginx/html
COPY client/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
