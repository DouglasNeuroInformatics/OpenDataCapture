# Generate build files for target workspace
FROM node:18 AS builder
WORKDIR /app
COPY . .
RUN npx turbo prune --scope=@douglasneuroinformatics/client --docker

# Install dependencies
FROM node:18 AS installer
WORKDIR /app
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/yarn.lock ./yarn.lock
RUN yarn install --frozen-lockfile

# Compile the workspace
ARG NODE_ENV
ARG VITE_API_HOST
ENV NODE_ENV=${NODE_ENV}
ENV VITE_API_HOST=${VITE_API_HOST}

COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
RUN yarn turbo run build --filter=@douglasneuroinformatics/client

# Serve the frontend using nginx
FROM nginx:1.24-alpine AS production
COPY --from=installer /app/apps/client/dist/ /usr/share/nginx/html/
# @warning path/docker context specified from git project root
COPY ./apps/client/nginx.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
