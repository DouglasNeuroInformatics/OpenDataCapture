# Configuration

## Environment Variables

All intended configuration is handled via environment variables, which should be placed in `.env`. You can create an `.env` file from our template with the following command:

```shell
awk -v secret_key="$(openssl rand -hex 16)" '/^SECRET_KEY=/{print $0 secret_key;next}1' .env.template > .env
```

For the rest of the variables, please refer to the descriptions in the newly created `.env` file.

## Build

Once you have set all the environment variables correctly, you can deploy the stack with the following command:

```shell
docker compose up
```
