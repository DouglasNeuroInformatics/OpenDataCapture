#!/usr/bin/env tsx

import fs from 'fs/promises';
import path from 'path';

import type { AnyInstrument, InstrumentKind } from '@opendatacapture/runtime-v1/@opendatacapture/runtime-core/index.js';

const distDir = path.resolve(import.meta.dirname, '../dist');

const results: { [K in InstrumentKind as Lowercase<K>]: { title: string }[] } = {
  form: [],
  interactive: [],
  series: []
};
for (const kindDir of await fs.readdir(distDir, 'utf-8')) {
  const targetDir = path.join(distDir, kindDir);
  const filepaths = await fs
    .readdir(targetDir, 'utf-8')
    .then((filenames) => filenames.filter((filename) => filename.endsWith('.js')))
    .then((filenames) => filenames.map((filename) => path.resolve(targetDir, filename)));
  for (const filepath of filepaths) {
    const { default: bundle } = (await import(filepath)) as { default: string };
    const instrument = (await (0, eval)(bundle)) as AnyInstrument;
    let title = instrument.details.title;
    if (typeof title !== 'string') {
      title = title.en ?? title.fr;
    }
    results[instrument.kind.toLowerCase() as Lowercase<typeof instrument.kind>].push({ title });
  }
}

console.log(JSON.stringify(results, null, 2));
