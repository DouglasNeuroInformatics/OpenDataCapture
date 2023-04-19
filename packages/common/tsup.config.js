import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/**/*.ts'],
  clean: true,
  dts: true,
  format: ['cjs', 'esm'],
  splitting: false
});
