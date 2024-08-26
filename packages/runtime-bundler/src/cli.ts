#!/usr/bin/env tsx

import * as path from 'path';

import { Bundler } from './bundler.js';
import { $UserConfigs } from './schemas.js';

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

const parseResult = await $UserConfigs.safeParseAsync(exports.default);
if (!parseResult.success) {
  console.warn(parseResult.error.issues);
  console.error(`Invalid structure of default export from config file '${configFilepath}'`);
  process.exit(1);
}

const configs = Array.isArray(parseResult.data) ? parseResult.data : [parseResult.data];
for (const config of configs) {
  const bundler = new Bundler({ configFilepath, ...config });
  try {
    await bundler.bundle({ mode: config.mode });
    console.log('Success!');
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
    } else {
      console.error(err);
    }
  }
}
