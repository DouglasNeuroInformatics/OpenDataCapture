FROM node:18-alpine AS base
RUN apk upgrade --no-cache
RUN apk add --no-cache libc6-compat
RUN npm install -g turbo

# PRUNE SOURCE CODE
FROM base AS builder
WORKDIR /app
COPY . .
RUN turbo prune --scope=@ddcp/web --docker

# INSTALL DEPENDENCIES
FROM base AS installer
WORKDIR /app
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/package-lock.json ./package-lock.json
RUN npm ci

# BUILD THE PROJECT
ARG VITE_LICENSE_URL
ARG VITE_GITHUB_REPO_URL
ARG VITE_CONTACT_EMAIL
COPY --from=builder /app/out/full/ .
COPY tsconfig.base.json tsconfig.base.json
COPY turbo.json turbo.json
RUN turbo run build --filter=@ddcp/web

# MOUNT STATIC CODE
FROM caddy:2.7-alpine as runner
WORKDIR /app
COPY web/Caddyfile /etc/caddy/Caddyfile
COPY --from=installer /app/web/dist/ .
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]
