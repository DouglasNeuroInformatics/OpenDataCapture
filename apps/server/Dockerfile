# Generate build files for target workspace
FROM node:18 AS builder
WORKDIR /app
COPY . .
RUN npx turbo prune --scope=@douglasneuroinformatics/server --docker

# Install dependencies
FROM node:18 AS installer
WORKDIR /app
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/yarn.lock ./yarn.lock
RUN yarn install --frozen-lockfile

# Compile the workspace
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
RUN yarn turbo run build --filter=@douglasneuroinformatics/server

# Run as non-root user
FROM node:18 AS runner
WORKDIR /app

ARG SECRET_KEY
ENV SECRET_KEY=${SECRET_KEY}
ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV}
ARG MONGO_URI
ENV MONGO_URI=${MONGO_URI}
ARG SERVER_PORT
ENV SERVER_PORT=${SERVER_PORT}

RUN addgroup --system --gid 1001 server
RUN adduser --system --uid 1001 server
USER server
COPY --from=installer /app .

CMD ["node", "./apps/server/dist/main.js"]
