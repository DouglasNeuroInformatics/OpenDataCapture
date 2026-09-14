FROM node:lts-krypton AS base
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PNPM_HOME/bin:$PATH"
ENV NODE_OPTIONS="--max-old-space-size=8192"
RUN corepack enable
RUN pnpm install -g turbo@2.9.16

# PRUNE WORKSPACE
# Note: Here we cannot use --docker, as is recommended, since the generated
# json directory does not allow linking package.json executable files
FROM base AS pruner
COPY . .
RUN turbo prune @opendatacapture/playground

# INSTALL DEPENDENCIES AND BUILD
FROM base AS builder
COPY tsconfig.json vitest.config.ts ./
COPY --from=pruner /app/out/ .
RUN pnpm install --frozen-lockfile
RUN turbo build --filter=@opendatacapture/playground

# SERVE PLAYGROUND
FROM caddy:2.7-alpine AS runner
COPY apps/playground/Caddyfile /etc/caddy/Caddyfile
COPY --from=builder /app/apps/playground/dist/ /srv/
