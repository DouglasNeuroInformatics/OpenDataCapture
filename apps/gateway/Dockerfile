FROM node:lts-alpine as base
WORKDIR /app
ENV GATEWAY_DATABASE_URL=file:/app/gateway.db
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_OPTIONS="--max-old-space-size=8192"
RUN corepack enable

# PRUNE WORKSPACE
FROM base AS builder
COPY . .
RUN apk add --no-cache libc6-compat
RUN apk update
RUN pnpm dlx turbo prune @opendatacapture/gateway --docker

# INSTALL DEPENDENCIES
FROM base AS installer
RUN apk add --no-cache libc6-compat
RUN apk update
COPY .gitignore jsconfig.json ./
COPY --from=builder /app/out/json/ .
RUN pnpm install --frozen-lockfile 

# BUILD THE APP
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
RUN pnpm dlx turbo build --filter=@opendatacapture/gateway
RUN pnpm dlx turbo run db:push --filter=@opendatacapture/prisma-client

# RUN SERVER
FROM base AS runner
COPY --from=installer /app/gateway.db /app/gateway.db
COPY --from=installer /app/apps/gateway/dist/ /app/dist/
COPY --from=installer /app/apps/gateway/public/ /app/public/
RUN echo '{ "type": "module" }' > package.json
CMD [ "node", "./dist/main.mjs" ]
