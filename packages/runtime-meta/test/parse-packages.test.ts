import { describe, expect, it } from 'vitest';

import { parsePackages } from '../src/index.js';

describe('parsePackages', () => {
  it('groups files under the package parsed from their path', () => {
    const packages = parsePackages('v1', {
      html: [],
      sources: ['react@19.x/index.js', 'react@19.x/jsx-runtime.js'],
      styles: ['normalize.css@8.x/normalize.css']
    });
    expect(packages).toStrictEqual([
      {
        exports: {
          css: [],
          html: [],
          js: ['/runtime/v1/react@19.x/index.js', '/runtime/v1/react@19.x/jsx-runtime.js']
        },
        name: 'react',
        version: '19.x'
      },
      {
        exports: { css: ['/runtime/v1/normalize.css@8.x/normalize.css'], html: [], js: [] },
        name: 'normalize.css',
        version: '8.x'
      }
    ]);
  });

  it('omits underscore-prefixed bundler output from all packages', () => {
    const packages = parsePackages('v1', {
      html: [],
      sources: ['_chunks/ABCD1234.js', 'react@19.x/index.js'],
      styles: []
    });
    expect(packages.map((pkg) => pkg.name)).toStrictEqual(['react']);
  });
});
