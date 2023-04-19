import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['lib/index.ts'],
  clean: true,
  dts: true,
  format: ['cjs', 'esm']
});
