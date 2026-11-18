FROM node:lts-krypton AS base
WORKDIR /app
ARG RELEASE_VERSION
ENV GATEWAY_DATABASE_URL=file:/app/sqlite/gateway.db
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PNPM_HOME/bin:$PATH"
ENV NODE_OPTIONS="--max-old-space-size=8192"
RUN corepack enable
RUN pnpm install -g turbo@2.11.5

# PRUNE WORKSPACE
# Note: Here we cannot use --docker, as is recommended, since the generated
# json directory does not allow linking package.json executable files
FROM base AS pruner
COPY . .
RUN turbo prune @opendatacapture/gateway

# INSTALL DEPENDENCIES AND BUILD
FROM base AS installer
COPY tsconfig.json vitest.config.ts ./
COPY --from=pruner /app/out/ .
RUN pnpm install --frozen-lockfile 
RUN turbo build --filter=@opendatacapture/gateway
RUN node -p "require('./apps/gateway/node_modules/prisma/package.json').version" > prisma-version

# RUN SERVER
FROM node:24-slim AS runner
WORKDIR /app
ENV CHECKPOINT_DISABLE=1
ENV GATEWAY_DATABASE_URL=file:/app/sqlite/gateway.db
ENV NODE_OPTIONS="--max-old-space-size=8192"
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates openssl && rm -rf /var/lib/apt/lists/*
# run.sh applies the schema on every start, so the runner needs the Prisma CLI the lockfile resolved.
# npm gives it a flat node_modules, which copying pnpm's symlinked one out of the installer would not.
COPY --from=installer /app/prisma-version prisma-version
RUN npm install --prefix /app/prisma-cli --no-audit --no-fund "prisma@$(cat prisma-version)" && rm -rf /root/.npm
COPY apps/gateway/prisma/schema.prisma /app/prisma/schema.prisma
COPY apps/gateway/scripts/run.sh run.sh
COPY --from=installer /app/apps/gateway/dist/ /app/dist/
COPY --from=installer /app/apps/gateway/public/ /app/public/
COPY --from=installer /app/apps/gateway/dist/runtime/ /runtime/
COPY --from=installer /app/apps/gateway/dist/prisma/client/ /.prisma/client/

RUN echo '{ "type": "module" }' > package.json
RUN echo '{ "type": "module" }' > /runtime/package.json
CMD [ "./run.sh" ]
