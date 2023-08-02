# Overview

The application consists of a stack of several interrelated services:
- A static website
- A REST API
- A MongoDB database
- A Caddy web server

These services are communicate through internal networks and/or volumes defined in `docker-compose.yaml`. The entry point to the stack is the Caddy web server, which exposes the standard HTTP and HTTPS ports to the host machine (80 and 443). Requests to API endpoints (`/api/*`) are proxied to the `api` container, while for all other requests Caddy serves the static files mounted by the `web` container.