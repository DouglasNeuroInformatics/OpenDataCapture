<!-- PROJECT LOGO -->
<div align="center">
  <a href="https://github.com/DouglasNeuroInformatics/OpenDataCapture">
    <img src=".github/assets/logo.png" alt="Logo" width="100" >
  </a>
  <h3 align="center">Open Data Capture</h3>
  <p align="center">
    An electronic data capture platform designed for administering remote and in-person clinical instruments, including both interactive tasks and forms 
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
![build](https://github.com/DouglasNeuroInformatics/OpenDataCapture/actions/workflows/build.yaml/badge.svg)

<!-- [![codecov](https://codecov.io/gh/DouglasNeuroInformatics/OpenDataCapture/branch/main/graph/badge.svg?token=XHC7BY6PJ1)](https://codecov.io/gh/DouglasNeuroInformatics/OpenDataCapture) -->

</div>
<hr />

## About

Open Data Capture is a web-based platform designed for continuous clinical data collection. Designed with clinician-researchers in mind, the platform enables both remote and in-person evaluations, encompassing a range of applications — from patient questionnaires completed at home to interactive memory tasks conducted in clinical settings. The platform is designed with a robust security framework, ensuring that all collected data is securely stored in a structured, standardized manner. It offers an intuitive, user-friendly interface to filter the stored data according to various criteria. Once filtered, the data can be used to generate dynamic graphs and tables, or exported for research purposes.

## Quick Start

Assuming that Docker and Docker Compose are already installed on your system, you can deploy an instance of Open Data Capture using the following command:

```sh
./scripts/generate-env.sh && docker compose up -d
```

By default, the application will run on port 5500. So, navigate to `http://localhost:5500` in your browser and you should be greeted with the setup screen. After getting started, we highly recommend reading our [deployment guide](http://opendatacapture.org/en/tutorials/deployment/) for additional information on how to configure Open Data Capture to best meet the needs of your organization.

## Contribution

We welcome contributions! If you're interested in improving the platform or adding new features, please refer to our Contribution Guide.

## License

Copyright (C) 2022 Douglas Neuroinformatics Platform

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.
