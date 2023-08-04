FROM node:18-alpine AS base
RUN apk upgrade --no-cache

# PRUNE SOURCE CODE
FROM base AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY . .
RUN npx turbo prune --scope=@ddcp/api --docker

# INSTALL DEPENDENCIES
FROM base AS installer
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/package-lock.json ./package-lock.json
RUN npm ci

# BUILD THE PROJECT
COPY --from=builder /app/out/full/ .
COPY tsconfig.base.json tsconfig.base.json
COPY turbo.json turbo.json
RUN npx turbo run build --filter=@ddcp/api

# RUN PRODUCTION IMAGE
FROM base AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nestjs
RUN adduser --system --uid 1001 nestjs
USER nestjs
COPY --from=installer /app .

CMD ["node", "./api/dist/main.js"]
