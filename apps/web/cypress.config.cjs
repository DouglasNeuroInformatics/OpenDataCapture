const { existsSync } = require('fs');
const { mkdir, rm } = require('fs/promises');
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: `http://localhost:${process.env.WEB_DEV_SERVER_PORT}`,
    setupNodeEvents(on) {
      on('task', {
        async createFolder(folderName) {
          if (!existsSync(folderName)) {
            await mkdir(folderName);
          }
          return Promise.resolve(null);
        },
        async deleteFolder(folderName) {
          if (existsSync(folderName)) {
            await rm(folderName, { force: true, recursive: true });
          }
          return Promise.resolve(null);
        }
      });
    }
  }
});
