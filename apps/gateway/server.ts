import { Server } from '@/server';

const server = new Server();

import { apiRouter } from '@/api/api.router';

server.addRoutes([{ path: '/api', router: apiRouter }]);

server.listen();
