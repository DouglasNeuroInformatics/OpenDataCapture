FROM node:lts-iron as base
RUN npm install -g bun@1.0.28
WORKDIR /app

# COMPILE SOURCE CODE
FROM base AS builder
COPY apps/playground/ ./apps/playground
COPY packages/ ./packages
COPY runtime/ ./runtime
COPY package.json jsconfig.json turbo.json bun.lockb ./
RUN bun install
RUN bunx turbo run build --filter=@open-data-capture/playground

# RUN SERVER
FROM base as runner
WORKDIR /app
RUN npm install -g http-server@14.1.1
COPY --from=builder /app/apps/playground/dist/ ./
CMD [ "sh", "-c", "http-server -s -p 80 -P http://localhost:80? ." ]
