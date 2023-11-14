FROM node:lts-slim AS base

# COMPILE SOURCE CODE
FROM base AS builder
ARG VITE_API_BASE_URL
WORKDIR /src
COPY apps/web/ ./apps/web
COPY packages/ ./packages
COPY package.json tsconfig.base.json turbo.json ./
RUN npm install -g bun@1.0.11
RUN bun install --ignore-scripts
RUN bunx turbo run build --filter=@open-data-capture/web

# RUN SERVER
FROM base as runner
WORKDIR /app
RUN npm install -g @import-meta-env/cli@0.6.8 http-server@14.1.1
COPY --from=builder /src/apps/web/.env.public /src/apps/web/dist/ ./
CMD [ "sh", "-c", "import-meta-env -x .env.public -p index.html && http-server -s -p 80 -P http://localhost:80? --gzip ." ]
