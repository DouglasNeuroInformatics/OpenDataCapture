# Quick Start


## Prerequisites

This guide pertains to deployment on a Linux-based server. Please ensure that you have SSH access to a server as root before continuing. If you do not have your own server, you can provision a free virtual machine with most of the large cloud providers (e.g., Amazon Web Services, Microsoft Azure, Google Cloud). Regardless of the platform you use, please ensure that port 80 and 443 are accessible. These instructions also assume that you have already installed Docker on your server. For more information, please refer to the [official documentation](https://docs.docker.com/).

## Basic Architecture

The application consists of a stack of several interrelated services:
- A static website
- A REST API
- A MongoDB database
- A Caddy web server

These services are communicate through internal networks and/or volumes defined in `docker-compose.yaml`. The entry point to the stack is the Caddy web server, which exposes the standard HTTP and HTTPS ports to the host machine (80 and 443). Requests to API endpoints (`/api/*`) are proxied to the `api` container, while for all other requests Caddy serves the static files mounted by the `web` container.

## Configuration

All intended configuration is handled via environment variables, which should be placed in `.env`. We have added some default values in `.env.template` to make it easy for you to get started. Create a `.env` file from this template with a secure secret key generated using the following command:

```
cat .env.template <(openssl rand -hex 16) > .env
```

The environment variable `VITE_API_HOST` is set to `http://localhost:5500` by default. If you are evaluating the platform on your local system, you can leave this unchanged. In a production environment, you will need to set this to your own domain in `.env`. For example, in our production setup this should be set to: https://datacapture.douglasneuroinformatics.ca/api.

## Setup

Now that the application is running, you need to send an HTTP request to a special setup endpoint. This will allow you to create the first admin user and optionally, to setup some initial dummy data. Please be advised that this action can only be performed if the database is completely empty. 

```shell
API_HOST=http://localhost:5500
curl --request POST \
  --url ${API_HOST}/v1/setup \
  --header 'Content-Type: application/json' \
  --data '{
    "admin": {
        "firstName": "Jane",
        "lastName": "Doe",
        "username": "admin",
        "password": "Password123"
    },
    "initDemo": true
}'
```