FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY src ./src

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY .env.example ./.env.example
RUN addgroup -S taskflow && adduser -S taskflow -G taskflow \
  && mkdir -p /app/data \
  && chown -R taskflow:taskflow /app
USER taskflow
EXPOSE 4001
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 CMD node -e "fetch('http://127.0.0.1:4001/health').then((res)=>process.exit(res.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "src/index.js"]
