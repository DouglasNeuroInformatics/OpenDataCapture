import * as fs from 'fs';
import * as path from 'path';

import esbuild from 'esbuild';

const outdir = path.resolve(import.meta.dirname, '../dist');

await fs.promises.rm(outdir, { force: true, recursive: true });

await esbuild.build({
  entryPoints: [path.resolve(import.meta.dirname, '../src/cli.ts')],
  minify: true,
  outdir
});
