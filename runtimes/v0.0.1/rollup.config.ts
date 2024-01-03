import path from 'path';

import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import { defineConfig } from 'rollup';
import dts from 'rollup-plugin-dts';

const OUT_DIR = path.resolve(import.meta.dir, 'dist');
const ROOT_DIR = path.resolve(import.meta.dir, '..', '..');

import { resolveModule } from '@open-data-capture/runtime-bundler';

const modules = {
  react: resolveModule('react'),
  zod: resolveModule('zod')
};

export default defineConfig([
  {
    input: {
      core: path.resolve(import.meta.dir, 'src', 'core.ts'),
      ...modules.react.main,
      ...modules.zod.main
    },
    output: {
      dir: OUT_DIR,
      format: 'es',
      generatedCode: 'es2015',
      plugins: [terser()]
    },
    plugins: [
      commonjs(),
      resolve({
        browser: true,
        extensions: ['.js', '.ts'],
        rootDir: ROOT_DIR
      }),
      replace({
        preventAssignment: false,
        'process.env.NODE_ENV': '"production"'
      }),
      typescript()
    ]
  },
  {
    input: {
      core: path.resolve(import.meta.dir, 'src', 'core.ts'),
      ...modules.react.types,
      ...modules.zod.types
    },
    output: [
      {
        dir: OUT_DIR,
        format: 'es'
      }
    ],
    plugins: [
      dts({
        compilerOptions: {
          paths: {
            '@open-data-capture/common/*': [path.resolve(ROOT_DIR, 'packages/common/src/*')]
          }
        },
        respectExternal: true
      })
    ]
  }
]);
