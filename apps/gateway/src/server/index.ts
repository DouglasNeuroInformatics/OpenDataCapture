import { CONFIG } from '@/config';

import type { AppServer } from './server.base';

let Server: AppServer;
if (CONFIG.mode === 'development') {
  Server = (await import('./server.development')).DevelopmentServer;
} else {
  Server = (await import('./server.production')).ProductionServer;
}

export { Server };
