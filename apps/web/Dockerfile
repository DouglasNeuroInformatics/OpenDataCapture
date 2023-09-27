FROM ubuntu:latest
CMD [ "/bin/sh" ]

# FROM --platform=amd64 oven/bun:canary AS builder
# WORKDIR /root
# COPY . .
# RUN bun install --ignore-scripts
# RUN bunx turbo run build --filter=@open-data-capture/web

CMD [ "/bin/sh" ]
# FROM caddy:2.7-alpine as runner
# WORKDIR /app
# COPY --from=builder /root/apps/web/dist/ .
# CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]