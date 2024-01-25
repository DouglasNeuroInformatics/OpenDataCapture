import { Server } from '@/server';

const app = express();
const server = new Server(app);

import express from 'express';

import { apiRouter } from '@/api/api.router';

server.addRoutes([{ path: '/api', router: apiRouter }]);

server.listen();
