# Overview

The application consists of four interconnected services:
- A static website
- A REST API
- A MongoDB database
- A Caddy web server

These services communicate via internal networks defined in `docker-compose.yaml`. The Caddy web server acts as the entry point, exposing HTTP (port 80) and HTTPS (port 443) to the host machine. API requests (/api/*) are forwarded to the api container, while other requests are proxied to the web container. The web container serves built static files, if available, or the single-page app otherwise.