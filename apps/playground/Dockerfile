#The following Dockerfile uses a two stage build which first builds the playground and then copies it into the another caddy image to serve it

#use the apline contianer to build odc
FROM alpine:3.19 AS builder

#install nodejs and required dependencies
#RUN apk add --no-cache curl git build-base python3 nodejs-current npm bash openssl
RUN apk add --no-cache nodejs-current npm bash openssl
RUN npm install -g pnpm

#set the working dir and copy the current odc instance into the new container
WORKDIR /src
COPY . /src

#install dependencies, generate the environment, and build the playground
RUN pnpm install
RUN ./scripts/generate-env.sh
RUN pnpm build --filter=@opendatacapture/playground

#use the caddy image to serve the playground
FROM caddy:2.7-alpine

#overwrite the default caddy files with odc's
RUN rm -rf /usr/share/caddy/*
COPY --from=builder /src/apps/playground/dist /usr/share/caddy

#make caddy listen on port 3000 and serve odc
RUN echo -e ":3000 {\n  root * /usr/share/caddy\n  file_server\n}\n" > /etc/caddy/Caddyfile
EXPOSE 3000

#serve odc
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]
