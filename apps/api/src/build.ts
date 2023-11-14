import fs from 'fs/promises';
import path from 'path';

const entryFile = path.resolve(import.meta.dir, 'main.ts');
const buildDir = path.resolve(import.meta.dir, '..', 'dist');

await fs.rm(buildDir, {
  force: true,
  recursive: true
});

const result = await Bun.build({
  entrypoints: [entryFile],
  external: ['@nestjs/microservices', '@nestjs/websockets/socket-module', 'class-transformer', 'class-validator'],
  minify: true,
  outdir: buildDir,
  target: 'bun'
});

if (result.success) {
  console.log('Done!');
} else {
  console.log(result);
}
