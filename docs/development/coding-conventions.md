# Coding Conventions

## Programming Language

Unless there is a compelling reason to use another language, all code should be written in TypeScript. JavaScript is permitted for relatively trivial files, such as a short script, or config file. All code is compiled with strict mode enabled. The use of the `any` type is highly discouraged. It is permitted if specified explicitly, but this should only be used for a very good reason.

## Coding Style

The code style is set using [Prettier](https://prettier.io/) and [ESLint](https://eslint.org/). When you make a commit, your code should automatically be reformatted according to the project guidelines. 

## Module Systems

Unfortunately, in JavaScript, for historical reasons there are multiple module systems. For this project, there are two module systems used: CommonJS and ES Modules. 

ES modules are the the official ECMAScript standard and the default module system for our project at the root level. For the purposes of this repository, CommonJS is considered deprecated and should not be used if possible. 

However, as this is often not feasible in 2023, CommonJS is also permitted. All non-compiled JavaScript code that relies on CommonJS should use the file extension `.cjs`. Hopefully, within a few years, we can fully transition to ES modules. 
