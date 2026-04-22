import path from 'path';

import libnest from '@douglasneuroinformatics/libnest/testing/plugin';
import { defineProject, mergeConfig } from 'vitest/config';

import baseConfig from '../../vitest.config';

export default mergeConfig(
  baseConfig,
  defineProject({
    plugins: [
      libnest({
        baseUrl: path.resolve(import.meta.dirname, 'src'),
        paths: {
          '@/*': ['*']
        }
      })
    ],
    root: import.meta.dirname,
    test: {
      globals: true,
      include: ['src/**/*.spec.ts', 'test/**/*.test.ts'],
      name: 'api'
    }
  })
);
