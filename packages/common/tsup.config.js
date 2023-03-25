import path from 'path';

import { defineConfig } from 'tsup';

const indexFiles = [path.resolve('.', 'src', 'index.ts')];
for (const dirname of ['auth', 'core', 'groups', 'users']) {
  indexFiles.push(path.resolve('.', 'src', dirname, 'index.ts'));
}

export default defineConfig({
  clean: true,
  dts: true,
  format: ['cjs', 'esm'],
  entry: indexFiles,
  sourcemap: true
});
