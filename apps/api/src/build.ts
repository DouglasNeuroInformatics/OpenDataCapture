import fs from 'fs/promises';
import path from 'path';

import swcPlugin from 'bun-plugin-swc';

const entryFile = path.resolve(import.meta.dir, 'main.ts');
const buildDir = path.resolve(import.meta.dir, '..', 'dist');

await fs.rm(buildDir, {
  force: true,
  recursive: true
});

const result = await Bun.build({
  entrypoints: [entryFile],
  external: ['@nestjs/microservices', '@nestjs/websockets/socket-module', 'class-transformer/storage'],
  minify: true,
  outdir: buildDir,
  plugins: [swcPlugin()],
  target: 'bun'
});

if (result.success) {
  console.log('Done!');
} else {
  console.log(result);
}
