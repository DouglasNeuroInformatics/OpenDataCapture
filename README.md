<!-- PROJECT LOGO -->
<div align="center">
  <a href="https://github.com/DouglasNeuroInformatics/DouglasDataCapturePlatform">
    <img src=".github/assets/logo.png" alt="Logo" width="100" >
  </a>
  <h3 align="center">The Douglas Data Capture Platform</h3>
  <p align="center">
    A modern, user-friendly web application for standardized data capture in medical research
    <br />
    <a href="https://douglasneuroinformatics.github.io/DouglasDataCapturePlatform">
      <strong>Explore the docs »
      </strong>
    </a>
    <br />
    <br />
    <a href="https://datacapture.douglasneuroinformatics.ca">View Demo</a>
    ·
    <a href="https://github.com/DouglasNeuroInformatics/DouglasDataCapturePlatform/issues">Report Bug</a>
    ·
    <a href="https://github.com/DouglasNeuroInformatics/DouglasDataCapturePlatform/issues">Request Feature</a>
  </p>
</div>

<!-- PROJECT SHIELDS -->
<div align="center">

  ![license](https://img.shields.io/github/license/DouglasNeuroInformatics/DouglasDataCapturePlatform)
  ![version](https://img.shields.io/github/package-json/v/DouglasNeuroInformatics/DouglasDataCapturePlatform)
  ![build](https://github.com/DouglasNeuroInformatics/DouglasDataCapturePlatform/actions/workflows/build.yaml/badge.svg)
  [![codecov](https://codecov.io/gh/DouglasNeuroInformatics/DouglasDataCapturePlatform/branch/main/graph/badge.svg?token=XHC7BY6PJ1)](https://codecov.io/gh/DouglasNeuroInformatics/DouglasDataCapturePlatform)
</div>
<hr />

## About

The Douglas Data Capture Platform is a modern, easy-to-use web application designed to enable the continuous collection and storage of research data. It was developed to meet the specific needs of clinical researchers at the Douglas Research Centre, one of the world’s leading mental health research institutions. However, it is fully open-source and can be easily adapted for use by other research institutions and organizations. This repository is a monorepo containing all source code for the application. 

## Key Features

- Interactive form creation tool with seamless registration and database retrieval
- Overview page to summarize available data
- Active subject concept for easy input of multiple instruments for a single client during a session
- Fully bilingual with support for additional languages 🇬🇧🇫🇷
- Interface for easy graphing of measures from multiple instruments for a subject
- Data export capability
- Subject search in the database based on identifying information (e.g., full name, age, sex)
- Printable/copyable summary at the end of each instrument
- Fine-grained user permissions for enhanced security
- Well-documented REST API

## Quick Start (Development)

### Setup Environment, Install Dependencies, and Launch Dev Server
```shell
awk -v secret_key="$(openssl rand -hex 16)" '/^SECRET_KEY=/{print $0 secret_key;next}1' .env.template > .env
npm install
npm run dev
```

### Create Admin User
```shell
curl --request POST \
  --url "${SITE_ADDRESS}/api/v1/setup" \
  --header "Content-Type: application/json" \
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

## License

Copyright (C) 2022 Douglas Neuroinformatics Platform

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.
