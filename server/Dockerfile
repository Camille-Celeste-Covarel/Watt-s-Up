FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY server/package*.json ./server/

RUN npm install -g npm@latest
RUN npm ci

COPY . .

# ===== RUNNER =====
FROM node:24-alpine AS runner

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/server ./server

COPY --from=builder /app/server/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3310

ENTRYPOINT ["/entrypoint.sh"]
CMD ["npm", "run", "start", "--workspace=@js-monorepo/server"]