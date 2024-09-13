import type { AppServer } from './server.base';

let Server: AppServer;
if (import.meta.env.DEV) {
  Server = (await import('./server.development')).DevelopmentServer;
} else {
  Server = (await import('./server.production')).ProductionServer;
}

export { Server };
