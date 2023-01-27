FROM node:18 AS builder

# Set working directory
WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN turbo prune --scope=server --docker

# Add lockfile and package.json's of isolated subworkspace
FROM node:18 AS installer
WORKDIR /app

# First install dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/yarn.lock ./yarn.lock
RUN yarn install

# Build the project and its dependencies
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
RUN yarn turbo run build --filter=server

FROM node:18 AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 server
RUN adduser --system --uid 1001 server
USER server
COPY --from=installer /app .

CMD node ./apps/server/dist/main.js
# CMD ["/bin/bash"]