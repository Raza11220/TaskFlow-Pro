FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

FROM node:20-alpine AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=5000

# Security: non-root user
USER node

COPY --chown=node:node --from=builder /usr/src/app /usr/src/app

EXPOSE 5000

CMD ["node", "src/server.js"]
