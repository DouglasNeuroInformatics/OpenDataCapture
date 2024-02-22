FROM node:lts-iron as base
RUN npm install -g bun@1.0.28
ARG GATEWAY_DATABASE_FILEPATH
ENV GATEWAY_DATABASE_URL=file:${GATEWAY_DATABASE_FILEPATH}
WORKDIR /app

# COMPILE SOURCE CODE
FROM base AS builder
COPY apps/gateway/ ./apps/gateway
COPY packages/ ./packages
COPY runtime/ ./runtime
COPY package.json jsconfig.json turbo.json bun.lockb ./
RUN bun install
RUN bunx turbo run build --filter=@open-data-capture/gateway
RUN bunx turbo run db:push --filter=@open-data-capture/database

# RUN SERVER
FROM base as runner
COPY --from=builder ${GATEWAY_DATABASE_FILEPATH} ${GATEWAY_DATABASE_FILEPATH}
COPY --from=builder /app/apps/gateway/dist/ /app/dist/
COPY --from=builder /app/apps/gateway/public/ /app/public/
RUN addgroup --system --gid 1001 app
RUN adduser --system --uid 1001 app
RUN chown -R app:app /app
USER app
RUN echo '{ "type": "module" }' > package.json
CMD [ "node", "./dist/main.mjs" ]
