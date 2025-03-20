FROM node:iron AS base
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_OPTIONS="--max-old-space-size=8192"
RUN npm i -g corepack@latest
RUN corepack enable
RUN pnpm install -g turbo@latest

# PRUNE WORKSPACE
# Note: Here we cannot use --docker, as is recommended, since the generated
# json directory does not allow linking package.json executable files
FROM base AS pruner
COPY . .
RUN turbo prune @opendatacapture/playground

# INSTALL DEPENDENCIES AND BUILD
FROM base AS builder
COPY tsconfig.base.json vitest.config.ts vitest.workspace.ts ./
COPY --from=pruner /app/out/ .
RUN pnpm install --frozen-lockfile 
RUN turbo build --filter=@opendatacapture/playground

# SERVE PLAYGROUND
FROM base AS runner
RUN pnpm install -g http-server@14.1.1
COPY --from=builder /app/apps/playground/dist ./
CMD [ "http-server", "-s", "-p", "80", "-P", "http://localhost:80?", "--gzip", "." ]
