---
title: Applications
---

Open Data Capture includes three different applications:
- A Core API (`/apps/api`)
- A Gateway Service (`/apps/gateway`)
- A Single Page Web App (`/apps/web`)

### Core API

The Core API (also known as API) is a REST API built using [NestJS](https://nestjs.com/). It includes endpoints for performing a variety of different CRUD operations. The Core API communicates with a MongoDB database via [Prisma](https://www.prisma.io/).

Authentication is handled using [JSON Web Tokens](https://jwt.io/) (JWT) with authorization implementing [attribute-based access control](https://en.wikipedia.org/wiki/Attribute-based_access_control). In the source code, endpoints are assigned a given route access (either public or protected). If a route is protected, it is assigned an action (`create`, `delete`, `manage`, `read`, `update`) and subject, which corresponds to either a database model (e.g., `User`) or a special value `all`. For example, `POST /v1/users` may be associated with the action `create` and the subject `User`. If there is no route access explicitly defined for a given route, the default is `manage` and `all`.
