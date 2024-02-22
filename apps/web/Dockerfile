FROM node:lts-iron as base
RUN npm install -g bun@1.0.28
WORKDIR /app

# COMPILE SOURCE CODE
FROM base AS builder
ARG VITE_API_BASE_URL
COPY apps/web/ ./apps/web
COPY packages/ ./packages
COPY runtime/ ./runtime
COPY package.json jsconfig.json turbo.json ./
RUN bun install
RUN bunx turbo run build --filter=@open-data-capture/web

# RUN SERVER
FROM base as runner
WORKDIR /app
RUN npm install -g @import-meta-env/cli@0.6.8 http-server@14.1.1
COPY --from=builder /app/apps/web/.env.public /app/apps/web/dist/ ./
CMD [ "sh", "-c", "import-meta-env -x .env.public -p index.html && http-server -s -p 80 -P http://localhost:80? --gzip ." ]
