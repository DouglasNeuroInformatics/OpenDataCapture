import path from 'node:path';
import url from 'node:url';

import esbuild from 'esbuild';
import esbuildPluginTsc from 'esbuild-plugin-tsc';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

await esbuild.build({
  entryPoints: ['src/main.ts'],
  bundle: true,
  outfile: 'dist/app.js',
  platform: 'node',
  format: 'esm',
  external: [
    '@nestjs/microservices',
    '@nestjs/websockets/socket-module',
    '@nestjs/microservices/microservices-module',
    'class-transformer/storage',
    'aws-sdk',
    'nock',
    'mock-aws-s3'
  ],
  tsconfig: path.resolve(__dirname, 'tsconfig.json'),
  target: ['node18', 'es2022'],
  banner: {
    js: `
        import { fileURLToPath } from 'url';
        import { createRequire as topLevelCreateRequire } from 'module';
        const require = topLevelCreateRequire(import.meta.url);
        `
  },
  plugins: [
    esbuildPluginTsc({
      tsconfigPath: path.resolve(__dirname, 'tsconfig.json')
    })
  ]
});
