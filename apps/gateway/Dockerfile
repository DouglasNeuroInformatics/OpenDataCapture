FROM node:lts-iron as base
WORKDIR /app
RUN corepack enable
ARG GATEWAY_DATABASE_FILEPATH
ENV GATEWAY_DATABASE_URL=file:${GATEWAY_DATABASE_FILEPATH}

# PRUNE WORKSPACE
FROM base AS builder
COPY . .
RUN pnpm dlx turbo prune @open-data-capture/gateway --docker

# INSTALL DEPENDENCIES
FROM base AS installer
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
RUN pnpm install --frozen-lockfile 

# BUILD THE APP
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
RUN pnpm dlx turbo build --filter=@open-data-capture/gateway
RUN pnpm dlx turbo run db:push --filter=@open-data-capture/database

# RUN SERVER
FROM base AS runner
COPY --from=builder ${GATEWAY_DATABASE_FILEPATH} ${GATEWAY_DATABASE_FILEPATH}
COPY --from=builder /app/apps/gateway/dist/ /app/dist/
COPY --from=builder /app/apps/gateway/public/ /app/public/
RUN addgroup --system --gid 1001 app
RUN adduser --system --uid 1001 app
RUN chown -R app:app /app
USER app
RUN echo '{ "type": "module" }' > package.json
CMD [ "node", "./dist/main.mjs" ]
