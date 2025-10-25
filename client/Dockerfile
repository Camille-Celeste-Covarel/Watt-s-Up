FROM node:24-alpine AS builder

ARG VITE_API_URL

WORKDIR /app

COPY client/package*.json ./client/

COPY server/src/types/models ./server/src/types/models

WORKDIR /app/client
RUN npm install

COPY client/. ./

ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

FROM nginx:alpine AS runner

COPY --from=builder /app/client/dist /usr/share/nginx/html

COPY client/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]