import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

export const { sayHello } = require('../dist/index.node');
