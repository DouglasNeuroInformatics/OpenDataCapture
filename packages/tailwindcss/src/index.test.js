import path from 'path';

import { describe, expect, it } from 'vitest';

import { createConfig } from './index.cjs';

describe('tailwindcss', () => {
  // this is only for testing purposes, and should not be used in this was in actual usage
  // this is necessary because of the way pnpm organizes modules to prevent phantom deps
  const reactCoreRoot = path.resolve(import.meta.dirname, '../../react-core');

  it('should return an object', () => {
    const config = createConfig();
    expect(config).not.toBeNull();
    expect(config).toBeTypeOf('object');
  });

  it('should include the libraries in the include array', () => {
    const config = createConfig({
      include: ['.'],
      root: reactCoreRoot
    });
    // @ts-ignore
    expect(config.content.find((val) => val === path.resolve(reactCoreRoot, './src/**/*.{js,ts,jsx,tsx}')));
  });

  it('should throw if no root is provided, and the module is not an explicit dependency', () => {
    expect(() =>
      createConfig({
        include: ['@opendatacapture/react-core']
      })
    ).toThrow();
  });
});
