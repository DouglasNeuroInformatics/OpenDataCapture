FROM node:lts-iron as base
WORKDIR /app
RUN corepack enable

# PRUNE WORKSPACE
FROM base AS builder
COPY . .
RUN pnpm dlx turbo prune @open-data-capture/web --docker

# INSTALL DEPENDENCIES
FROM base AS installer
ARG VITE_API_BASE_URL
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
RUN pnpm install --frozen-lockfile 

# BUILD THE APP
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
RUN pnpm dlx turbo build --filter=@open-data-capture/web

# RUN SERVER
FROM base AS runner
RUN pnpm add -g @import-meta-env/cli@0.6.8 http-server@14.1.1
COPY --from=builder /app/apps/web/.env.public /app/apps/web/dist/ ./
CMD [ "sh", "-c", "import-meta-env -x .env.public -p index.html && http-server -s -p 80 -P http://localhost:80? --gzip ." ]
