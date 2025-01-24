FROM node:lts-jod AS base
ARG RELEASE_VERSION
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_OPTIONS="--max-old-space-size=8192"
RUN corepack enable
RUN pnpm install -g turbo@latest

# PRUNE WORKSPACE
# Note: Here we cannot use --docker, as is recomended, since the generated
# json directory does not allow linking package.json executable files
FROM base AS builder
COPY . .
RUN turbo prune @opendatacapture/web

# INSTALL DEPENDENCIES AND BUILD
FROM base AS installer
COPY tsconfig.base.json vitest.config.ts vitest.workspace.ts ./
COPY --from=builder /app/out/ .
RUN pnpm install --frozen-lockfile 
RUN turbo build --filter=@opendatacapture/web

# RUN SERVER
FROM base AS runner
RUN pnpm install -g @import-meta-env/cli@0.6.8 http-server@14.1.1
COPY --from=installer /app/apps/web/.env.public /app/apps/web/dist/ ./
CMD [ "sh", "-c", "import-meta-env -x .env.public -p index.html && http-server -s -p 80 -P http://localhost:80? --gzip ." ]
