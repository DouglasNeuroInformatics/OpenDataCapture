## Code Style

With very few exceptions, for example, config files, all code is written in TypeScript with strict mode enabled. The expected style is enforced using ESLint.

## Modules

Unfortunately, in JavaScript, for historical reasons there are multiple module systems. In modern times, and for the purposes of this documentation, the two that are relevant are CommonJS and ESModules. 

CommonJS is a module system that is primarily used in server-side JavaScript environments, such as Node.js. It uses a `require()` function to import modules, and a module.exports object to define what a module exports. It is very widely used in Node packages, similar to Python 2 during the transition to Python 3.

ESModules is a module system that is supported in modern JavaScript environments and is standardized in ECMAScript. It uses import and export statements to handle modules, and is designed to be more efficient and easy to use than CommonJS. It is increasingly being adopted in the JavaScript community as the recommended way to handle modules.

Although some people resist this transition, for the purposes of this repository, CommonJS is considered deprecated and should not be used if possible. Unfortunately, however, this is often not feasible in 2023. Therefore, any code that relies on CommonJS **must** be use the file extension `.cjs` to mark it as deprecated, and signal that it should be replaced with the official standard module system as soon as possible. 
