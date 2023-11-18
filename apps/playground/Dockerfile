FROM node:lts-slim AS base

# COMPILE SOURCE CODE
FROM base AS builder
WORKDIR /src
COPY apps/playground/ ./apps/playground
COPY packages/ ./packages
COPY package.json tsconfig.base.json turbo.json ./
RUN npm install -g bun@1.0.11
RUN bun install
RUN bunx turbo run build --filter=@open-data-capture/playground

# RUN SERVER
FROM base as runner
WORKDIR /app
RUN npm install -g http-server@14.1.1
COPY --from=builder /src/apps/playground/dist/ ./
CMD [ "sh", "-c", "http-server -s -p 80 -P http://localhost:80? ." ]
