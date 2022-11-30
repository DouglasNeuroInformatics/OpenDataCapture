# The Douglas Data Capture Platform
![tests](https://github.com/joshunrau/DouglasDataCapturePlatform/actions/workflows/main.yml/badge.svg)


## About

The Douglas Data Capture Platform aims to provide a unified method of clinical research data collection across all clinics at the DRC. This will be achieved through a web interface that will include a number of different instruments, including cognitive assessments (e.g., MoCA) and symptom scales (e.g., SANS). This may include inputting the results of clinical instruments, or completing these instruments directly on the platform. These instruments may be completed by clinicians, researchers, or patients, at the discretion of individual clinics. Additional instruments will be implemented upon request.

## Local Development Setup

### Install Dependencies

```
$ npm install
```

### Set Environment Variables For Server

```
$ echo MONGO_URI=mongodb://localhost:27017 >> apps/server/.env
$ echo PORT=5000 >> apps/server/.env
```

### Run Tests

```
$ npm test
```

### Serve

```
$ npm run dev
```

## License

Copyright (C) 2022 Douglas Neuroinformatics Platform

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.