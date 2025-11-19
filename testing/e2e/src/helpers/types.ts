/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/consistent-type-definitions */

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ADMIN_ACCESS_TOKEN: string;
      ADMIN_PASSWORD: string;
      ADMIN_USERNAME: string;
    }
  }
}

export type BrowserTarget = 'Desktop Chrome' | 'Desktop Firefox' | 'Desktop Safari';

export type ProjectMetadata = {
  browserTarget: BrowserTarget;
};
