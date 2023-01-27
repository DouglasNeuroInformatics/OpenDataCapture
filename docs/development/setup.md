# Setup

## Prerequisites

This application requires Node v18. It is possible, but not guaranteed, that this setup will work with other versions. It is recommended to install Node using a version management system, such as [Node Version Manager](https://github.com/nvm-sh/nvm).

We use Yarn as our package manager, which is included in recent versions of Node, but not activated by default. To activate Yarn, run the following command in the shell:

```shell
corepack enable
```

## Installation

```shell
yarn install
```

## Environment Variables

All environment variables are are set in a `.env` file, located in the root directory. For convenience, we provide a template with prefilled values that should work for most users. You can use this to create a fully functional `.env` file with the following command:

### Quick Start

```shell
cat .env.template <(python -c "import secrets; print(secrets.token_hex(32))") > .env
```

### Legend

| Key                   `   | Description                                     |
| ------------------------- | ----------------------------------------------- |
| VITE_API_HOST             | The domain name of the host that serves the API |
| VITE_DEV_SERVER_PORT      | The port to use for the Vite development server |
| VITE_DEV_USERNAME         | The username to use if VITE_DEV_BYPASS_AUTH is set to true |
| VITE_DEV_PASSWORD         | The password to use if VITE_DEV_BYPASS_AUTH is set to true |
| VITE_DEV_BYPASS_AUTH      | If true and NODE_ENV is development, then login is automated |
| MONGO_DEV_CONNECTION_URI  | MongoDB URI for the development database |
| MONGO_PROD_CONNECTION_URI  | MongoDB URI for the production database |
| MONGO_TEST_CONNECTION_URI | MongoDB URI for the testing database |
| SERVER_PORT               | The port to use for the Nest development server |
| SECRET_KEY                | The value to use for various security purposes. |
| INIT_DEMO_DB              | If true and NODE_ENV is development, then drop the database and setup dummy data |
## Run Dev Server

### Initial Run
```shell
yarn ws common build && INIT_DEMO_DB=true yarn dev
```

### Subsequent Runs

```
yarn dev
```