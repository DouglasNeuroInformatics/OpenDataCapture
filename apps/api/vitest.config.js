import path from 'path';
import url from 'url';

import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    swc.vite({
      jsc: {
        baseUrl: path.resolve(__dirname, 'src'),
        externalHelpers: true,
        keepClassNames: true,
        parser: {
          decorators: true,
          dynamicImport: true,
          syntax: 'typescript'
        },
        paths: {
          '@/*': ['*']
        },
        target: 'es2022',
        transform: {
          decoratorMetadata: true,
          legacyDecorator: true
        }
      },
      minify: false,
      module: {
        type: 'es6'
      },
      sourceMaps: true
    })
  ],
  test: {
    globals: true,
    root: './'
  }
});
