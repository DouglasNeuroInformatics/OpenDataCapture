FROM node:lts-slim AS base
RUN npm install -g bun@1.0.11
WORKDIR /app

# COMPILE SOURCE CODE
FROM base AS builder
COPY apps/api/ ./apps/api
COPY packages/ ./packages
COPY package.json jsconfig.json turbo.json ./
RUN bun install
RUN bunx turbo run build --filter=@open-data-capture/api

# RUN SERVER
FROM base as runner
COPY --from=builder /app/apps/api/dist/ /app/dist/
COPY --from=builder /app/apps/api/public/ /app/public/
RUN addgroup --system --gid 1001 app
RUN adduser --system --uid 1001 app
RUN chown -R app:app /app
USER app
CMD [ "bun", "./dist/main.js" ]
