import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: `http://localhost:${process.env.WEB_DEV_SERVER_PORT}`,
    setupNodeEvents() {
      // implement node event listeners here
      return;
    }
  }
});
