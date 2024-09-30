FROM node:lts-alpine AS base
WORKDIR /app
ENV GATEWAY_DATABASE_URL="file:/dev/null"
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_OPTIONS="--max-old-space-size=8192"
RUN corepack enable
RUN pnpm install -g turbo@latest

# PRUNE WORKSPACE
# Note: Here we cannot use --docker, as is recomended, since the generated
# json directory does not allow linking package.json executable files
FROM base AS pruner
COPY . .
RUN turbo prune @opendatacapture/api

# INSTALL DEPENDENCIES AND BUILD
FROM base AS installer
COPY tsconfig.base.json vitest.config.ts vitest.workspace.ts ./
COPY --from=pruner /app/out/ .
RUN pnpm install --frozen-lockfile 
RUN turbo build --filter=@opendatacapture/api

# RUN SERVER
FROM base AS runner
COPY --from=installer /app/apps/api/dist/ /app/dist/
COPY --from=installer /app/apps/api/public/ /app/public/
COPY --from=installer /app/apps/api/dist/runtime/ /runtime/
COPY --from=installer /app/apps/api/dist/prisma/client/ /.prisma/client/

RUN echo '{ "type": "module" }' > package.json
RUN echo '{ "type": "module" }' > /runtime/package.json
USER node
CMD [ "node", "./dist/app.js" ]
