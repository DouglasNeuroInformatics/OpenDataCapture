FROM oven/bun:canary as runtime

# COMPILE SOURCE CODE
FROM runtime AS builder
WORKDIR /root
COPY . .
RUN bun install --ignore-scripts
RUN bunx turbo run build --filter=@open-data-capture/api

FROM runtime as runner
WORKDIR /app
COPY --from=builder /root/apps/api/dist/ .
RUN addgroup --system --gid 1001 app
RUN adduser --system --uid 1001 app
USER app
CMD [ "bun", "main.js" ]
