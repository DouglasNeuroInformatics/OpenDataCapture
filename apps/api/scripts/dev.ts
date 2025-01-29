#!/usr/bin/env tsx

import _nodemon, { type Nodemon, type NodemonSettings } from 'nodemon';

const nodemon = _nodemon as any as (settings: NodemonSettings) => Nodemon;

import { clean, outfile, watch } from './build.js';

await clean();
await watch();
nodemon({
  script: outfile
});
