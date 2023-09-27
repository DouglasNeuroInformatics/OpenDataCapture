FROM oven/bun:1.0 as runtime

FROM runtime AS builder
WORKDIR /root
COPY . .
RUN bun install --ignore-scripts
RUN bunx turbo run build --filter=@open-data-capture/api

FROM runtime as runner
WORKDIR /app
COPY --from=builder /root/apps/api/dist/ .

CMD [ "/bin/sh" ]

