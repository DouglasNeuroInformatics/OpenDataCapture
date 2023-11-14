FROM node:lts-slim as base
# RUN apt-get update && apt-get install -y openssl libssl-dev
RUN npm install -g bun@1.0.11

# COMPILE SOURCE CODE
FROM base as builder
WORKDIR /src
COPY apps/gateway/ ./apps/gateway
COPY packages/ ./packages
COPY package.json tsconfig.base.json turbo.json ./
RUN bun install
RUN bunx turbo run build --filter=@open-data-capture/gateway

# # RUN SERVER
FROM base as runner
WORKDIR /app
COPY --from=builder /src/apps/gateway/public ./public
COPY --from=builder /src/apps/gateway/.next/standalone ./
COPY --from=builder /src/.next/gateway/static ./.next/static

CMD [ "/bin/bash"]

# RUN SERVER
# FROM runtime as runner
# WORKDIR /app
# RUN addgroup --system --gid 1001 app
# RUN adduser --system --uid 1001 app
# USER app

# COPY --from=builder --chown=app:app /root/apps/gateway/.next/standalone .
# COPY --from=builder --chown=app:app /root/apps/gateway/.next/static .next/static
# COPY --from=builder --chown=app:app /root/apps/gateway/public public

# CMD [ "bun", "./dist/main.js" ]
