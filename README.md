<!-- PROJECT LOGO -->
<div align="center">
  <a href="https://github.com/DouglasNeuroInformatics/DouglasDataCapturePlatform">
    <img src=".github/assets/logo.png" alt="Logo" width="100" >
  </a>
  <h3 align="center">The Douglas Data Capture Platform</h3>
  <p align="center">
    A modern, user-friendly, web application for standardized data capture in medical research
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

<!-- PROJECT SHIELDS -->
<div align="center">

  ![license][license-shield]
  ![version][version-shield]
  ![vulnerabilities][vulnerabilities-shield]

</div>
<hr />

## About

The Douglas Data Capture Platform is a modern, easy-to-use web application designed to enable the continuous collection and storage of research data. It was developed to meet the specific needs of clinical researchers at the Douglas Research Centre, one of the world’s leading mental health research institutions. However, it is fully open-source and can be easily adapted for use by other research institutions and organizations. This repository is a monorepo containing all source code for the application. 

## Quick Start

```shell
cat .env.template <(python -c "import secrets; print(secrets.token_hex(32))") > .env
docker compose up
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
[vulnerabilities-shield]: https://img.shields.io/snyk/vulnerabilities/github/DouglasNeuroInformatics/DouglasDataCapturePlatform