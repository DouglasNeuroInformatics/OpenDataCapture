import * as fs from 'node:fs';
import * as path from 'node:path';

import type { BundlerInput } from './types.js';

export async function loadDirectory(dirname: string) {
  if (!fs.existsSync(dirname)) {
    throw new Error(`Directory does not exist: '${dirname}'`);
  } else if (!fs.lstatSync(dirname).isDirectory()) {
    throw new Error(`Not a directory: '${dirname}'`);
  }
  const files = await fs.promises.readdir(dirname, 'utf-8');
  const inputs: BundlerInput[] = [];
  for (const filename of files) {
    const filepath = path.resolve(dirname, filename);
    if (fs.lstatSync(filepath).isFile()) {
      inputs.push({
        content: await fs.promises.readFile(filepath, 'utf-8'),
        name: filename
      });
    }
  }
  return inputs;
}
