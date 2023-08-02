# Setup

Now that the application is running, you need to send an HTTP request to a special setup endpoint. This will allow you to create the first admin user and optionally, to setup some initial dummy data. Please be advised that this action can only be performed if the database is completely empty. 

```shell
SITE_ADDRESS=localhost:80
curl --request POST \
  --url $SITE_ADDRESS/api/v1/setup \
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