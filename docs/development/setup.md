# Setup

## Prerequisites

### Node

This application requires Node v18. It is possible, but not guaranteed, that this setup will work with other versions. For this reason, it is recommended to install Node using a version management system, such as [Node Version Manager](https://github.com/nvm-sh/nvm).

Once you have installed Node, verify that the correct version is in your path:

```shell
node --version
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
npm install
```

## Environment Variables

All environment variables are are set in a `.env` file, located in the root directory. For convenience, we provide a template with prefilled values that should work for most users. You can use this to create a fully functional `.env` file with the following command:

```shell
awk -v secret_key="$(openssl rand -hex 16)" '/^SECRET_KEY=/{print $0 secret_key;next}1' .env.template > .env
```

> **Note:** If you are running MongoDB on a remote server, or locally on a non-default port, you will need to adjust the connection URL accordingly. For more information on the various options available, please refer to the comments in `.env.template`.

Before continuing, ensure that you have sourced these newly defined environment variables:

```shell
source .env
```
## Run Dev Server

Now, you should be able to start the development server, which is configured with hot module replacement. 

```shell
npm run dev
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

If everything worked correctly, you should now be able to login with your username and password. For more information on the API, you can access the (incomplete) documentation on `locahost:5500` or `localhost:3000/api/`.

> **Note:** Although you may now perform additional administrative actions through the API, the `/v1/setup` will no longer work, as it requires an empty database. Therefore, you should always ensure you have at least one admin user. 