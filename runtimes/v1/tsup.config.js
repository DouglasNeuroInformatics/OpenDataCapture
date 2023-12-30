import path from 'path';
import url from 'url';

import { defineConfig } from 'tsup';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const OUT_DIR = path.resolve(__dirname, 'dist');
const SRC_DIR = path.resolve(__dirname, 'src');

export default defineConfig([
  {
    bundle: true,
    clean: true,
    dts: {
      resolve: true
    },
    entry: {
      core: path.resolve(SRC_DIR, 'core.ts'),
      react: path.resolve(SRC_DIR, 'react.ts'),
      zod: path.resolve(SRC_DIR, 'zod.ts')
    },
    // experimentalDts: {
    //   entry: {
    //     core: path.resolve(SRC_DIR, 'core.ts'),
    //     react: path.resolve(SRC_DIR, 'react.ts'),
    //     zod: path.resolve(SRC_DIR, 'zod.ts')
    //   }
    // },
    format: 'esm',
    outDir: OUT_DIR,
    platform: 'browser',
    replaceNodeEnv: true,
    target: 'es2022'
  }
]);
