FROM oven/bun:latest AS builder
WORKDIR /root
COPY . .
RUN bun install --ignore-scripts
RUN bunx turbo run build --filter=@open-data-capture/web

FROM caddy:2.7-alpine as runner
WORKDIR /app
COPY --from=builder /root/apps/web/Caddyfile /etc/caddy/Caddyfile
COPY --from=builder /root/apps/web/dist/ .
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]