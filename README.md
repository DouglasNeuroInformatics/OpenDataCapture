<!-- PROJECT LOGO -->
<div align="center">
  <a href="https://github.com/DouglasNeuroInformatics/OpenDataCapture">
    <img src=".github/assets/logo.png" alt="Logo" width="100" >
  </a>
  <h3 align="center">Open Data Capture</h3>
  <p align="center">
    A modern, user-friendly web application for standardized data capture in medical research
    <br />
    <a href="https://docs.opendatacapture.org">
      <strong>Explore the docs »
      </strong>
    </a>
    <br />
    <br />
    <a href="https://demo.opendatacapture.org">View Demo</a>
    ·
    <a href="https://github.com/DouglasNeuroInformatics/OpenDataCapture/issues">Report Bug</a>
    ·
    <a href="https://github.com/DouglasNeuroInformatics/OpenDataCapture/issues">Request Feature</a>
  </p>
</div>

<!-- PROJECT SHIELDS -->
<div align="center">

![license](https://img.shields.io/github/license/DouglasNeuroInformatics/OpenDataCapture)
![version](https://img.shields.io/github/package-json/v/DouglasNeuroInformatics/OpenDataCapture)

<!-- ![build](https://github.com/DouglasNeuroInformatics/OpenDataCapture/actions/workflows/build.yaml/badge.svg) -->
<!-- [![codecov](https://codecov.io/gh/DouglasNeuroInformatics/OpenDataCapture/branch/main/graph/badge.svg?token=XHC7BY6PJ1)](https://codecov.io/gh/DouglasNeuroInformatics/OpenDataCapture) -->

</div>
<hr />

## About

Open Data Capture is an integrated suite of applications tailored for the continuous and longitudinal collection of both clinical and research data. This platform is anchored on a few foundational principles:

- Versatility in Instruments: Whether it's surveys, clinical questionnaires, interactive tasks, or neuroimaging data, our platform can handle it all under the umbrella of a generic instrument.
- User-Friendly Design: Designed with the user in mind, its intuitive interface ensures that even those without specialized knowledge can navigate and utilize the platform with ease.
- Streamlined Deployment: With our one-liner deployment solution, leverage Docker Compose for a hassle-free, automated setup.

## Development

### Prerequisites

In order to run the platform locally, you will need to install [Bun](https://bun.sh/) and [MongoDB](https://www.mongodb.com/). Please follow the appropriate documentation to install both for your platform before continuing (for MongoDB, we recommend running it in Docker). Also, if you are running your database on any port other than 27017, please adjust the value for `MONGO_URI` in your `.env` file (discussed later).

### Install Dependencies

```shell
bun install
```

### Setup Config

```shell
awk -v secret_key="$(openssl rand -hex 16)" '/^SECRET_KEY=/{print $0 secret_key;next}1' .env.template > .env
```

### Launch Dev Server

```shell
bun dev
```

## Deployment

### Download Repository

```shell
git clone https://github.com/DouglasNeuroInformatics/OpenDataCapture
cd OpenDataCapture
```

### Launch Application

```
awk -v secret_key="$(openssl rand -hex 16)" '/^SECRET_KEY=/{print $0 secret_key;next}1' .env.template > .env
docker compose up
```

By default, the application will run on port 80. So, navigate to `localhost` in your browser and you should be greeted with the setup screen.

## Contribution

We welcome contributions! If you're interested in improving the Data Bank platform or adding new features, please refer to our Contribution Guide.

## License

Copyright (C) 2022 Douglas Neuroinformatics Platform

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.
