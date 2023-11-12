FROM oven/bun:1.0.10 as runtime
RUN apt update
RUN apt install -y ca-certificates curl gnupg
RUN mkdir -p /etc/apt/keyrings
RUN curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
RUN echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list
RUN apt update
RUN apt install nodejs -y

# COMPILE SOURCE CODE
FROM runtime as builder
WORKDIR /root
COPY . .
RUN bun install
RUN bunx turbo run build --filter=@open-data-capture/gateway

WORKDIR /root/apps/gateway
CMD [ "bun", "start" ]

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
