/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/consistent-type-definitions */
/* eslint-disable @typescript-eslint/no-namespace */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as url from 'node:url';

import { defineUserConfig } from '@douglasneuroinformatics/libnest/user-config';
import { getReleaseInfo } from '@opendatacapture/release-info';

import type { RuntimePrismaClient } from '@/core/prisma.js';
import type { $Env } from '@/core/schemas/env.schema.js';

declare module '@douglasneuroinformatics/libnest/user-config' {
  export namespace UserTypes {
    export interface Env extends $Env {}
    export interface PrismaClient extends RuntimePrismaClient {}
  }
}

const config = defineUserConfig({
  build: {
    onComplete: async () => {
      const runtimeV1Dir = path.dirname(
        url.fileURLToPath(import.meta.resolve('@opendatacapture/runtime-v1/package.json'))
      );
      await fs.cp(path.join(runtimeV1Dir, 'dist'), path.join(import.meta.dirname, 'dist/runtime/v1'), {
        recursive: true
      });
    },
    outfile: path.resolve(import.meta.dirname, 'dist/app.js')
  },
  entry: () => import('./src/main.js'),
  globals: {
    __RELEASE__: await getReleaseInfo()
  }
});

export default config;
