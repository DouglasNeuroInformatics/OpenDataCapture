# Quick Start

## Prerequisites

The easiest way to deploy the platform is with Docker. These instructions assume that you have already installed Docker on your server. For more information, please refer to the [official documentation](https://docs.docker.com/).

## Configuration

All intended configuration is handled via environment variables, which should be placed in `.env`. We have added some default values in `.env.template` to make it easy for you to get started. Create a `.env` file from this template with a secure secret key generated using the following command:

```
cat .env.template <(openssl rand -hex 16) > .env
```

The environment variable `VITE_API_HOST` is set to `http://localhost:5500` by default. For production, we have set this as a build argument in `docker-compose.yml`, rather than using this value. If you are not associated with the DNP, you will need to modify this to point to your own organization URL.

