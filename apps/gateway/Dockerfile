FROM node:lts-jod AS base
WORKDIR /app
ARG RELEASE_VERSION
ENV GATEWAY_DATABASE_URL=file:/app/sqlite/gateway.db
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_OPTIONS="--max-old-space-size=8192"
RUN corepack enable
RUN pnpm install -g turbo@latest

# PRUNE WORKSPACE
# Note: Here we cannot use --docker, as is recommended, since the generated
# json directory does not allow linking package.json executable files
FROM base AS pruner
COPY . .
RUN turbo prune @opendatacapture/gateway

# INSTALL DEPENDENCIES AND BUILD
FROM base AS installer
COPY tsconfig.base.json vitest.config.ts vitest.workspace.ts ./
COPY --from=pruner /app/out/ .
RUN pnpm install --frozen-lockfile 
RUN turbo build --filter=@opendatacapture/gateway
RUN turbo run db:push --filter=@opendatacapture/gateway

# RUN SERVER
FROM base AS runner
COPY apps/gateway/scripts/run.sh run.sh
COPY --from=installer /app/sqlite/gateway.db /app/gateway.tmpl.db
COPY --from=installer /app/apps/gateway/dist/ /app/dist/
COPY --from=installer /app/apps/gateway/public/ /app/public/
COPY --from=installer /app/apps/gateway/dist/runtime/ /runtime/
COPY --from=installer /app/apps/gateway/dist/prisma/client/ /.prisma/client/

RUN echo '{ "type": "module" }' > package.json
RUN echo '{ "type": "module" }' > /runtime/package.json
CMD [ "./run.sh" ]
