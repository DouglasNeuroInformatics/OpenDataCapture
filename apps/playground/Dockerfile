FROM node:lts-alpine as base
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_OPTIONS="--max-old-space-size=8192"
RUN corepack enable

# PRUNE WORKSPACE
FROM base AS builder
COPY . .
RUN apk add --no-cache libc6-compat
RUN apk update
RUN pnpm dlx turbo prune @opendatacapture/playground --docker

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
RUN pnpm dlx turbo build --filter=@opendatacapture/playground

# RUN SERVER
FROM base AS runner
COPY --from=installer /app/apps/playground/dist/ .
COPY --from=installer /app/apps/playground/public/ .
RUN npm install -g http-server@14.1.1
CMD [ "sh", "-c", "http-server -s -p 80 -P http://localhost:80? ." ]
