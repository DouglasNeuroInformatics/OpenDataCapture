import path from 'path';
import url from 'url';

import { defineConfig } from 'vitest/config';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    alias: {
      '/runtime/v0.0.1': path.resolve(__dirname, '../../runtime/v0.0.1/dist')
    }
  }
});
