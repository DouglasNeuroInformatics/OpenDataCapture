import path from 'path';
import url from 'url';

import instrument from '@opendatacapture/rollup-plugin-instrument';
import resolve from '@rollup/plugin-node-resolve';
import { defineConfig } from 'rollup';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export default defineConfig({
  input: path.resolve(__dirname, 'src', 'index.js'),
  output: {
    file: path.resolve(__dirname, 'dist', 'index.js'),
    format: 'es',
    generatedCode: 'es2015'
  },
  plugins: [
    instrument(),
    resolve({
      browser: true,
      extensions: ['.js', '.jsx', '.ts', '.tsx']
    })
  ]
});
