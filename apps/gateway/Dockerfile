FROM node:lts-iron as base
RUN npm install -g bun@1.0.18
WORKDIR /app

# COMPILE SOURCE CODE
FROM base AS builder
COPY apps/gateway/ ./apps/gateway
COPY packages/ ./packages
COPY runtime/ ./runtime
COPY package.json jsconfig.json turbo.json bun.lockb ./
RUN bun install
RUN bunx turbo run build --filter=@open-data-capture/gateway

# RUN SERVER
FROM base as runner
COPY --from=builder /app/apps/gateway/dist/ /app/dist/
COPY --from=builder /app/apps/gateway/public/ /app/public/
RUN addgroup --system --gid 1001 app
RUN adduser --system --uid 1001 app
RUN chown -R app:app /app
USER app
CMD [ "node", "./dist/main.mjs" ]
