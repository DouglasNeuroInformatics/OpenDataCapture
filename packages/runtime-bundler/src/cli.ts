#!/usr/bin/env tsx

import path from 'path';

import { Bundler } from './bundler.js';
import { $Config } from './schemas.js';

const cwd = process.cwd();
const configFilename = 'runtime.config.js';
const configFilepath = path.resolve(cwd, configFilename);

let exports: { [key: string]: unknown };
try {
  exports = (await import(configFilepath)) as { [key: string]: unknown };
} catch {
  console.warn(`Failed to resolve file '${configFilename}' from working directory '${cwd}'`);
  console.error(`ERROR: Failed to import config file '${configFilepath}'`);
  process.exit(1);
}

if (!exports.default) {
  console.error(`ERROR: Missing required default export in file '${configFilepath}'`);
  process.exit(1);
}

const parsedConfig = await $Config.safeParseAsync(exports.default);
if (!parsedConfig.success) {
  console.warn(parsedConfig.error.issues);
  console.error(`Invalid structure of default export from config file '${configFilepath}'`);
  process.exit(1);
}

const bundler = new Bundler({ configFilepath, ...parsedConfig.data });
try {
  await bundler.bundle();
  console.log('Success!');
} catch (err) {
  if (err instanceof Error) {
    console.error(err.message);
  } else {
    console.error(err);
  }
}
