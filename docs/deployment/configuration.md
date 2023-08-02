# Configuration

## Environment Variables

All intended configuration is handled via environment variables, which should be placed in `.env`. The template file `.env.template` contains some default values as well as descriptions of each variable.

```shell
cp .env.template .env
```

Your configuration may vary depending on your exact setup. In general, you will want to set `SITE_ADDRESS` to your own domain name and generate a secure value for `SECRET_KEY`.

## Build

Once you have set all the environment variables correctly, you can deploy the stack with the following command:

```shell
docker compose up
```