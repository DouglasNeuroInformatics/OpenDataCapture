import path from 'path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      exclude: [
        '**/.storybook/**',
        '**/coverage/**',
        '**/cypress/**',
        '**/dist/**',
        '**/public/**',
        '**/scripts/**',
        '**/*.d.?(c|m)ts',
        '**/*{.,-}{test,test-d,spec}.?(c|m)[jt]s?(x)',
        '**/*.config.?(c|m)[jt]s?(x)',
        '**/*.stories.?(c|m)[jt]s?(x)'
      ],
      include: ['apps/**/*', 'packages/**/*'],
      provider: 'v8',
      reportsDirectory: path.resolve(import.meta.dirname, 'coverage'),
      skipFull: true
    },
    include: ['**/*/test.?(c|m)[jt]s?(x)', '**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    watch: false
  }
});
