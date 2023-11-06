FROM oven/bun:latest as runtime

# COMPILE SOURCE CODE
FROM runtime AS builder
WORKDIR /root
COPY . .
RUN bun install --ignore-scripts
RUN bunx turbo run build --filter=@open-data-capture/api

FROM runtime as runner
WORKDIR /app
COPY --from=builder /root/apps/api/dist/ /app/dist/
COPY --from=builder /root/apps/api/public/ /app/public/
RUN addgroup --system --gid 1001 app
RUN adduser --system --uid 1001 app
USER app
CMD [ "bun", "./dist/main.js" ]
