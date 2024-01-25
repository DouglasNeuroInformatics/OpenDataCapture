import { SERVER_CONFIG } from './server.config';

import type { AppServer } from './server.base';

let Server: AppServer;
if (SERVER_CONFIG.mode === 'development') {
  Server = (await import('./server.development')).DevelopmentServer;
} else {
  Server = (await import('./server.production')).ProductionServer;
}

export { Server };
