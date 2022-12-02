# Running Locally

## Install Dependencies

```
$ yarn install
```

## Set Environment Variables For Client

echo NEXT_PUBLIC_API_HOST=http://localhost:5500 > apps/client/.env

## Set Environment Variables For Server

```
$ echo MONGO_URI=mongodb://localhost:27017 > apps/server/.env
$ echo PORT=5500 >> apps/server/.env
```

## Run Tests

```
$ npm test
```

## Serve

```
$ npm run dev
```