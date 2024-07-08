<!-- PROJECT LOGO -->
<div align="center">
  <a href="https://github.com/DouglasNeuroInformatics/OpenDataCapture">
    <img src=".github/assets/logo.png" alt="Logo" width="100" >
  </a>
  <h3 align="center">Open Data Capture</h3>
  <p align="center">
    An electronic data capture platform designed for administering remote and in-person clinical instruments
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
    <a href="https://playground.opendatacapture.org" rel="noreferrer" target="_blank">Instrument Playground</a>
    ·
    <a href="https://demo.opendatacapture.org" rel="noreferrer" target="_blank">View Demo</a>
  </p>
</div>

<!-- PROJECT SHIELDS -->
<div align="center">

![license](https://img.shields.io/github/license/DouglasNeuroInformatics/OpenDataCapture)
![version](https://img.shields.io/github/package-json/v/DouglasNeuroInformatics/OpenDataCapture)
![build](https://github.com/DouglasNeuroInformatics/OpenDataCapture/actions/workflows/build.yaml/badge.svg)

</div>
<hr />

## About

Open Data Capture is a web-based platform designed for continuous clinical data collection. The platform is centered on the [concept of an instrument](https://opendatacapture.org/en/docs/concepts/instruments/). Broadly defined, an instrument refers to any tool that can be used to collect data (e.g., forms, interactive tasks).

## Features

- **Built with TypeScript and modern frameworks** for robustness and scalability 🚀
- **Natively multilingual** for global accessibility 🇬🇧🇫🇷
- **Intuitive interface** for clinicians to conduct in-person assessments 🏥
- **External gateway service** for patients to self-administer remote assignments 🏠
- **Flexible instrument build system** implemented [directly in the browser](https://playground.opendatacapture.org/) via WebAssembly ⚡
  - Declarative form creation with a JSON-like syntax for accessibility ✨
  - Custom instrument runtime with dynamic imports and native ES modules for experienced users 🔥
- **Secure by default** with JWT authentication and granular permission controls 🔐
- **Beautiful data visualization** 📈
- **On-demand data export** for research integration 🔬

## Quick Start

Assuming that Docker and Docker Compose are already installed on your system, you can deploy an instance of Open Data Capture using the following command:

```sh
./scripts/generate-env.sh && docker compose up -d
```

By default, the application will run on port 5500. So, navigate to `http://localhost:5500` in your browser and you should be greeted with the setup screen. After getting started, we highly recommend reading our [deployment guide](http://opendatacapture.org/en/docs/tutorials/deployment/) for additional information on how to configure Open Data Capture to best meet the needs of your organization.

## Contribution

We welcome contributions! If you're interested in improving the platform or adding new features, please refer to our Contribution Guide.

## License

Copyright (C) 2022 Douglas Neuroinformatics Platform

This program is free software: you can redistribute it and/or modify it under the terms of the Apache License, Version 2.0.
