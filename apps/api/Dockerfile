FROM node:lts-iron as base
RUN npm install -g bun@1.0.28
WORKDIR /app

# COMPILE SOURCE CODE
FROM base AS builder
COPY apps/api/ ./apps/api
COPY packages/ ./packages
COPY runtime/ ./runtime
COPY package.json jsconfig.json turbo.json ./
RUN bun install
RUN bunx turbo run build --filter=@open-data-capture/api

# RUN SERVER
FROM base as runner
COPY --from=builder /app/apps/api/dist/ /app/dist/
COPY --from=builder /app/apps/api/public/ /app/public/
RUN addgroup --system --gid 1001 app
RUN adduser --system --uid 1001 app
RUN chown -R app:app /app
USER app
RUN echo '{ "type": "module" }' > package.json
CMD [ "node", "./dist/app.mjs" ]