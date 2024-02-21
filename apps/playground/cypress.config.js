import { defineConfig } from 'cypress';

export default defineConfig({
  defaultCommandTimeout: 20000,
  e2e: {
    baseUrl: `http://localhost:${process.env.PLAYGROUND_DEV_SERVER_PORT}`,
    setupNodeEvents() {
      // implement node event listeners here
      return;
    }
  },
  screenshotOnRunFailure: false,
  viewportHeight: 1080,
  viewportWidth: 1920
});
