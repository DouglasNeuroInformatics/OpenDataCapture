import { rmdir } from 'fs';

import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: `http://localhost:${process.env.WEB_DEV_SERVER_PORT}`,
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on('task', {
        deleteFolder(folderName) {
          return new Promise((resolve, reject) => {
            rmdir(folderName, { maxRetries: 10, recursive: true }, (err) => {
              if (err) {
                console.error(err);
                return reject(err);
              }
              resolve(null);
            });
          });
        }
      });
    }
  }
});
