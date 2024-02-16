---
title: Concepts
description: A dive deep into how OpenDataCapture works.
---


## Introduction

## Architecture

Open Data Capture is written in TypeScript, with all source code located in a monorepo managed by [Turborepo](https://turbo.build/). In the repository, there are three primary folders of interest:
1. `/apps`
2. `/packages`
3. `/runtime`

### Applications

Open Data Capture includes three different applications:
- A Core API (`/apps/api`)
- A Gateway Service (`/apps/gateway`)
- A Single Page Web App (`/apps/web`)

All administrative configuration (e.g., whether or not the gateway should be enabled) is handled via environment variables.

#### Core API

The Core API is a REST API built using [NestJS](https://nestjs.com/). It includes endpoints for performing a variety of different CRUD operations. The Core API communicates with a MongoDB database via [Prisma](https://www.prisma.io/).

Authentication is handled using [JSON Web Tokens](https://jwt.io/) (JWT) with authorization implementing [attribute-based access control](https://en.wikipedia.org/wiki/Attribute-based_access_control). In the source code, endpoints are assigned a given route access (either public or protected). If a route is protected, it is assigned an action (`create`, `delete`, `manage`, `read`, `update`) and subject, which corresponds to either a database model (e.g., `User`) or a special value `all`. For example, `POST /v1/users` may be associated with the action `create` and the subject `User`. If there is no route access explicitly defined for a given route, the default is `manage` and `all`.


#### Packages

Within the `/packages` directory, where are a variety of different internal packages. A given package may depend on one or more other internal packages. 

#### Runtime

### Instruments

Central to Open Data Capture is the concept of an instrument. An instrument is a tool that may be used to collect data. Instrument have a number of properties in common, such as tags and version. However, different types of instruments (e.g., form, interactive) have different structures of content. This content is what determines what the user sees when completing the instrument. For example, the content of a form instrument will contain the fields in that form, whereas an interactive task will contain the code required to render that task to the user.

When an instrument is completed, the result is stored in a record. Since records may be of any data structure, instruments may optionally define measures, which accept the record as an argument and return a fixed data structure that is used to power visualizations, such as tables and graphs.

## Gateway

