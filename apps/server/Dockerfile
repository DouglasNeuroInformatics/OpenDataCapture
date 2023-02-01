# Generate build files for target workspace
FROM node:18 AS builder
WORKDIR /app
COPY . .
RUN yarn global add turbo
RUN turbo prune --scope=server --docker

# Install dependencies
FROM node:18 AS installer
WORKDIR /app
COPY .gitignore .gitignore
COPY tsconfig.base.json tsconfig.base.json
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/yarn.lock ./yarn.lock
RUN yarn install --frozen-lockfile

# Compile the workspace
COPY --from=builder /app/out/full/ .
RUN yarn turbo run build --filter=server

# Run as non-root user
FROM node:18 AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 server
RUN adduser --system --uid 1001 server
USER server
COPY --from=installer /app .

CMD ["node", "./server/dist/main.js"]
