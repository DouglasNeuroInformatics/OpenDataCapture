FROM node:lts-iron as base
WORKDIR /app
RUN corepack enable

# PRUNE WORKSPACE
FROM base AS builder
COPY . .
RUN pnpm dlx turbo prune @open-data-capture/playground --docker

# INSTALL DEPENDENCIES
FROM base AS installer
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
RUN pnpm install --frozen-lockfile 

# BUILD THE APP
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
RUN pnpm dlx turbo build --filter=@open-data-capture/playground

# RUN SERVER
FROM base AS runner
COPY --from=builder /app/apps/playground/dist/ .
COPY --from=builder /app/apps/playground/public/ .
RUN npm install -g http-server@14.1.1
CMD [ "sh", "-c", "http-server -s -p 80 -P http://localhost:80? ." ]
