# COMPILE SOURCE CODE
FROM oven/bun:1.0.10 AS builder

RUN apt update
RUN apt install -y ca-certificates curl gnupg
RUN mkdir -p /etc/apt/keyrings
RUN curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
RUN echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_18.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list
RUN apt update
RUN apt install nodejs -y

ARG VITE_API_BASE_URL
WORKDIR /root
COPY . .
RUN bun install --ignore-scripts
RUN bunx turbo run build --filter=@open-data-capture/web
RUN bunx pkg ./node_modules/@import-meta-env/cli/bin/import-meta-env.js --target node18-alpine --output import-meta-env-alpine

# RUN SERVER
FROM caddy:2.7-alpine as runner
WORKDIR /app
COPY --from=builder /root/import-meta-env-alpine .
COPY --from=builder /root/apps/web/.env.public /root/apps/web/start.sh /app/
COPY --from=builder /root/apps/web/Caddyfile /etc/caddy/Caddyfile
COPY --from=builder /root/apps/web/dist/ /app/dist/
CMD [ "sh", "start.sh"]
