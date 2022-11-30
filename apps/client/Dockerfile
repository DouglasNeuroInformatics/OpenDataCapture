FROM node:18 AS builder
WORKDIR /app
COPY . .
RUN npx turbo prune --scope=client --docker

# Add lockfile and package.json's of isolated subworkspace
FROM node:18 AS installer
WORKDIR /app

# First install dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/package-lock.json ./package-lock.json
RUN npm install

# Build the project and its dependencies
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
RUN npx turbo run build --filter=client

FROM node:18 AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 client
RUN adduser --system --uid 1001 client
USER client

COPY --from=installer /app/apps/client/next.config.js .
COPY --from=installer /app/apps/client/next-i18next.config.js .
COPY --from=installer /app/apps/client/package.json .
COPY --from=installer /app .

COPY --from=installer --chown=client:client /app/apps/client/.next/standalone ./
COPY --from=installer --chown=client:client /app/apps/client/.next/static ./apps/client/.next/static

CMD node ./apps/client/server.js