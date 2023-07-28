# Quick Start

## Prerequisites

The easiest way to deploy the platform is with Docker. These instructions assume that you have already installed Docker on your server. For more information, please refer to the [official documentation](https://docs.docker.com/).

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