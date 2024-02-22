# COMPILE SOURCE CODE
FROM oven/bun:1.0.28 AS builder
WORKDIR /app
COPY apps/api/ ./apps/api
COPY packages/ ./packages
COPY runtime/ ./runtime
COPY package.json jsconfig.json turbo.json bun.lockb ./
RUN bun install
RUN bunx turbo run build --filter=@open-data-capture/api

# RUN SERVER
FROM node:lts-iron as runner
WORKDIR /app
COPY --from=builder /app/apps/api/dist/ /app/dist/
COPY --from=builder /app/apps/api/public/ /app/public/
RUN addgroup --system --gid 1001 app
RUN adduser --system --uid 1001 app
RUN chown -R app:app /app
USER app
RUN echo '{ "type": "module" }' > package.json
CMD [ "node", "./dist/app.mjs" ]
