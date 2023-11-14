# Overview

## Main Components

Open Data Capture comprises three main components:

1. A Single Page Application (SPA)
2. A Representational State Transfer (REST) API
3. A MongoDB database

Any of these components could be replaced with an alternatives providing equivalent interfaces without impacting the functioning of other components.

## Repository Structure

Our repository is a monorepo with three workspaces:

1. Client: A React SPA
2. Common: A library of common classes, functions, and types shared between the client and server
3. Server: A REST API built using NestJS

## Build System

These three workspaces are managed using Turborepo. In the file `turbo.json`, various tasks are defined which may be run from the command line using scripts defined in `package.json`.

## TypeScript

The entire codebase is written in Typescript, and each package has a `tsconfig.json` file that extends the `tsconfig.base.json` file located in the root of the monorepo. This allows for sharing of TypeScript configurations across all packages in the monorepo.

## ESLint

The `.eslintrc.json` file, located at the root of the monorepo, establishes the base linting configuration for all files. Within each workspace, the `.eslintrc.cjs` file extends this configuration by providing specific rules and/or overrides for that specific workspace.
