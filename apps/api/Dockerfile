FROM oven/bun:1.0.10 as runtime

# COMPILE SOURCE CODE
FROM runtime AS builder
RUN apt update
RUN apt install -y ca-certificates curl gnupg
RUN mkdir -p /etc/apt/keyrings
RUN curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
RUN echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list
RUN apt update
RUN apt install nodejs -y

WORKDIR /root
COPY . .
RUN bun install --ignore-scripts
RUN bunx turbo run build --filter=@open-data-capture/api
RUN bunx pkg ./node_modules/@import-meta-env/cli/bin/import-meta-env.js --target node18-alpine --output import-meta-env-alpine

# RUN SERVER
FROM runtime as runner
WORKDIR /app
COPY --from=builder /root/apps/api/dist/ /app/dist/
COPY --from=builder /root/apps/api/public/ /app/public/
RUN addgroup --system --gid 1001 app
RUN adduser --system --uid 1001 app
USER app
CMD [ "bun", "./dist/main.js" ]
