import path from 'path';
import url from 'url';

import { dts } from 'rollup-plugin-dts';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const config = [
  {
    input: path.resolve(__dirname, 'src', 'env.d.ts'),
    output: [{ file: path.resolve(__dirname, 'dist', 'lib.d.ts'), format: 'es' }],
    plugins: [
      dts({
        respectExternal: true
      })
    ]
  }
];

export default config;
