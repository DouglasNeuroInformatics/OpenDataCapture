FROM node:lts-iron as base
WORKDIR /app
RUN corepack enable

# PRUNE WORKSPACE
FROM base AS builder
COPY . .
RUN pnpm dlx turbo prune @open-data-capture/api --docker

# INSTALL DEPENDENCIES
FROM base AS installer
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
RUN pnpm install --frozen-lockfile 

# BUILD THE APP
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
RUN pnpm dlx turbo build --filter=@open-data-capture/api

# RUN SERVER
FROM base AS runner
COPY --from=builder /app/apps/api/dist/ /app/dist/
COPY --from=builder /app/apps/api/public/ /app/public/
RUN addgroup --system --gid 1001 app
RUN adduser --system --uid 1001 app
RUN chown -R app:app /app
USER app
RUN echo '{ "type": "module" }' > package.json
CMD [ "node", "./dist/app.mjs" ]
