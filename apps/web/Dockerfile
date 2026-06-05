FROM node:lts-krypton AS base
ARG RELEASE_VERSION
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PNPM_HOME/bin:$PATH"
ENV NODE_OPTIONS="--max-old-space-size=8192"
RUN corepack enable
RUN pnpm install -g turbo@latest

# PRUNE WORKSPACE
# Note: Here we cannot use --docker, as is recommended, since the generated
# json directory does not allow linking package.json executable files
FROM base AS builder
COPY . .
RUN turbo prune @opendatacapture/web

# INSTALL DEPENDENCIES AND BUILD
FROM base AS installer
COPY tsconfig.base.json vitest.config.ts ./
COPY --from=builder /app/out/ .
RUN pnpm install --frozen-lockfile 
RUN turbo build --filter=@opendatacapture/web

# RUN SERVER
FROM caddy:2.7-alpine AS runner
RUN apk add --no-cache nodejs npm
RUN npm install -g @import-meta-env/cli@0.6.8
COPY apps/web/Caddyfile /etc/caddy/Caddyfile
COPY --from=installer /app/apps/web/.env.public /app/apps/web/dist/ /srv/
CMD [ "sh", "-c", "import-meta-env -x .env.public -p index.html && caddy run --config /etc/caddy/Caddyfile --adapter caddyfile" ]
