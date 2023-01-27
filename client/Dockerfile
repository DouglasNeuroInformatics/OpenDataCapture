# Generate build files for target workspace
FROM node:18 AS builder
WORKDIR /app
COPY . .
RUN yarn global add turbo
RUN turbo prune --scope=client --docker

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
RUN yarn turbo run build --filter=client

# Run as non-root user
FROM node:18 AS runner
WORKDIR /app
COPY --from=installer /app .

CMD ["yarn", "workspace", "client", "preview"]
