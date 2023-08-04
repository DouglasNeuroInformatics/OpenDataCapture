FROM node:18-alpine AS base

RUN apk upgrade --no-cache

# PRUNE SOURCE CODE
FROM base AS builder

RUN apk add --no-cache libc6-compat

WORKDIR /app
COPY . .
RUN npx turbo prune --scope=@ddcp/web --docker

# INSTALL DEPENDENCIES
FROM base AS installer

RUN apk add --no-cache libc6-compat

WORKDIR /app
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/yarn.lock ./yarn.lock
RUN yarn install --frozen-lockfile

# BUILD THE PROJECT
ARG VITE_DOCS_URL
ARG VITE_LICENSE_URL
ARG VITE_GITHUB_REPO_URL
ARG VITE_CONTACT_EMAIL
COPY --from=builder /app/out/full/ .
COPY tsconfig.base.json tsconfig.base.json
COPY turbo.json turbo.json
RUN npx turbo run build --filter=@ddcp/web

# MOUNT STATIC CODE
FROM caddy:2.7-alpine as runner
WORKDIR /app
COPY web/Caddyfile /etc/caddy/Caddyfile
COPY --from=installer /app/web/dist/ .
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]
