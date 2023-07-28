# Setup

## Prerequisites

### Node

This application requires Node v18. It is possible, but not guaranteed, that this setup will work with other versions. For this reason, it is recommended to install Node using a version management system, such as [Node Version Manager](https://github.com/nvm-sh/nvm).

Once you have installed Node, verify that the correct version is in your path:

```shell
node --version
```

We use Yarn as our package manager, which is included in recent versions of Node, but not activated by default. To activate Yarn, run the following command in the shell:

```shell
corepack enable
```

Before proceeding, please verify that the correct version of Yarn (v1x) is in your path:

```shell
yarn --version
```

### MongoDB

Next, you will need to connect the application to a database. There are several ways you can do this, including:
- Connecting to a remote instance (e.g., MongoDB Atlas)
- Running directly on your OS
- Running a Docker container

We recommend running MongoDB in a Docker container. To install MongoDB natively on your system, please refer to the  [official documentation](https://www.mongodb.com/docs/manual/administration/install-community/).

To run the Docker image on the default port, you can use the following command:

```
docker run -d --name mongodb -p 27017:27017 mongo:6
```

## Installation

First, clone (download) the source code from our GitHub:

```shell
git clone https://github.com/DouglasNeuroInformatics/DouglasDataCapturePlatform
```

Then, install the required dependencies from the root of the repository:

```shell
cd DouglasDataCapturePlatform
yarn install
```

## Environment Variables

All environment variables are are set in a `.env` file, located in the root directory. For convenience, we provide a template with prefilled values that should work for most users. You can use this to create a fully functional `.env` file with the following command:

> **Note:** If you are running MongoDB on a remote server, or locally on a non-default port, you will need to adjust the connection URL accordingly.

### Quick Start

```shell
cat .env.template <(openssl rand -hex 16) > .env
```

### Legend

| Key                   `   | Description                                     |
| ------------------------- | ----------------------------------------------- |
| WEB_SERVER_PORT      			| The port to use for the Vite development server |
| VITE_API_HOST             | The domain name of the host that serves the API |
| VITE_DEV_USERNAME         | The username to use if VITE_DEV_BYPASS_AUTH is set to true |
| VITE_DEV_PASSWORD         | The password to use if VITE_DEV_BYPASS_AUTH is set to true |
| VITE_DEV_BYPASS_AUTH      | If true and NODE_ENV is development, then login is automated |
| MONGO_URI                 | MongoDB URI not including database name |
| API_SERVER_PORT           | The port to use for the Nest development server |
| SECRET_KEY                | The value to use for various security purposes. |

## Run Dev Server

Now, you should be able to start the development server, which is configured with hot module replacement. 

```shell
yarn dev
```

Next, open your browser and navigate to `localhost:3000`, where you should be greeted with a login prompt. 

## Create First User

Now that the application is running, the final step is to create the first user (who must be an admin). This is done through an HTTP request to the API. 

```shell
curl --request POST \
  --url http://localhost:5500/v1/setup \
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

If everything worked correctly, you should now be able to login with your username and password. For more information on the API, you can access the (incomplete) documentation on `locahost:5500`.

> **Note:** Although you may now perform additional administrative actions through the API, the `/v1/setup` will no longer work, as it requires an empty database. Therefore, you should always ensure you have at least one admin user. 