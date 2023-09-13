FROM node:20.5-alpine AS runtime
FROM runtime as base
RUN apk upgrade --no-cache
RUN apk add --no-cache libc6-compat
RUN npm install -g turbo

# PRUNE SOURCE CODE
FROM base AS builder
WORKDIR /app
COPY . .
RUN turbo prune --scope=@open-data-capture/core-api --docker

# INSTALL DEPENDENCIES
FROM base AS installer
WORKDIR /app
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/package-lock.json ./package-lock.json
RUN npm ci

# BUILD THE PROJECT
COPY --from=builder /app/out/full/ .
COPY tsconfig.base.json tsconfig.base.json
COPY turbo.json turbo.json
RUN turbo run build --filter=@open-data-capture/core-api

# RUN PRODUCTION IMAGE
FROM runtime AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nestjs
RUN adduser --system --uid 1001 nestjs
USER nestjs
COPY --from=installer /app .

CMD ["node", "./apps/core-api/dist/main.js"]
