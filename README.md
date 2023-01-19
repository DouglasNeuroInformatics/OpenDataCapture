![license][license-shield]
![version][version-shield]

<br />
<div align="center">
  <a href="https://github.com/DouglasNeuroInformatics/DouglasDataCapturePlatform">
    <img src=".github/assets/logo.png" alt="Logo" width="100" >
  </a>
  <h3 align="center">The Douglas Data Capture Platform</h3>
  <p align="center">
    A modern, user-friendly, web application for standardized data capture in medical research.
    <br />
    <a href="https://github.com/DouglasNeuroInformatics/DouglasDataCapturePlatform">
      <strong>Explore the docs »
      </strong>
    </a>
    <br />
    <br />
    <a href="https://github.com/DouglasNeuroInformatics/DouglasDataCapturePlatform">View Demo</a>
    ·
    <a href="https://github.com/DouglasNeuroInformatics/DouglasDataCapturePlatform/issues">Report Bug</a>
    ·
    <a href="https://github.com/DouglasNeuroInformatics/DouglasDataCapturePlatform/issues">Request Feature</a>
  </p>
</div>

## About

The Douglas Data Capture Platform was created to standardize the collection of clinical research data across all clinics at the Douglas Research Centre. This repository includes the source code for the REST API and single page application that make up the platform.

## Setup

### Prerequisites

To follow this procedure, you should have Node installed on your machine. Recent versions of Node include the Yarn package manager, but it is disabled by default. To enable it, run the following command:

```shell
$ corepack enable
```

### Steps

1. Clone this repository

```shell
$ git clone https://github.com/DouglasNeuroInformatics/DouglasDataCapturePlatform.git
```

2. Install Dependencies

```shell
$ yarn install
```

3. Set Private Environment Variables

```shell
$ echo SECRET_KEY=foo > .env.local
```

## License

Copyright (C) 2022 Douglas Neuroinformatics Platform

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

<!-- MARKDOWN LINKS & IMAGES -->
[license-shield]: https://img.shields.io/github/license/DouglasNeuroInformatics/DouglasDataCapturePlatform
[version-shield]: https://img.shields.io/github/package-json/v/DouglasNeuroInformatics/DouglasDataCapturePlatform
