import * as fs from 'fs';
import * as path from 'path';

import { defineConfig } from 'cypress';
import { config } from 'dotenv';

config({
  path: path.resolve(import.meta.dirname, '../../.env')
});

export default defineConfig({
  e2e: {
    baseUrl: `http://localhost:${process.env.WEB_DEV_SERVER_PORT}`,
    downloadsFolder: 'downloads',
    screenshotsFolder: 'screenshots',
    setupNodeEvents(on) {
      on('task', {
        async mkdir(dir: string) {
          if (!fs.existsSync(dir)) {
            await fs.promises.mkdir(dir);
          }
          return Promise.resolve(null);
        },
        async readdir(dir: string) {
          return fs.promises
            .readdir(dir, 'utf-8')
            .then((files) => files.map((filename) => path.resolve(dir, filename)));
        },
        async rmdir(dir: string) {
          if (fs.existsSync(dir)) {
            await fs.promises.rm(dir, { force: true, recursive: true });
          }
          return Promise.resolve(null);
        }
      });
    },
    specPattern: 'src/e2e/**/*.cy.{ts,tsx}',
    supportFile: 'src/support/e2e.ts'
  }
});
