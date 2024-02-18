<!-- PROJECT LOGO -->
<div align="center">
  <a href="https://github.com/DouglasNeuroInformatics/OpenDataCapture">
    <img src=".github/assets/logo.png" alt="Logo" width="100" >
  </a>
  <h3 align="center">Open Data Capture</h3>
  <p align="center">
    A modern, user-friendly web application for standardized data capture in medical research
    <br />
    <a href="https://opendatacapture.org/docs">
      <strong>Explore the docs »
      </strong>
    </a>
    <br />
    <br />
    <a href="https://github.com/DouglasNeuroInformatics/OpenDataCapture/issues" rel="noreferrer" target="_blank">Report Bug</a>
    ·
    <a href="https://github.com/DouglasNeuroInformatics/OpenDataCapture/issues" rel="noreferrer" target="_blank">Request Feature</a>
    ·
    <a href="https://formplayground.opendatacapture.org" rel="noreferrer" target="_blank">Instrument Playground</a>
    ·
    <a href="https://demo.opendatacapture.org" rel="noreferrer" target="_blank">View Demo</a>
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

## Deployment

### Download Repository

```shell
git clone https://github.com/DouglasNeuroInformatics/OpenDataCapture
cd OpenDataCapture
```

### Launch Application

```shell
./scripts/generate-env.sh
docker compose up -d
docker compose exec mongo mongosh --eval "rs.initiate({_id: 'rs0', members: [{_id: 0, host: 'localhost:27017'}]});"
```

By default, the application will run on port 5500. So, navigate to `http://localhost:5500` in your browser and you should be greeted with the setup screen.

## Contribution

We welcome contributions! If you're interested in improving the platform or adding new features, please refer to our Contribution Guide.

## License

Copyright (C) 2022 Douglas Neuroinformatics Platform

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.
