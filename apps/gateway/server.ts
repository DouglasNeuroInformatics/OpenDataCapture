import { Server } from '@/server';

const app = express();
const server = new Server(app);

import express from 'express';

import { apiRouter } from '@/routers/api.router';
import { appRouter } from '@/routers/app.router';

server.addRoutes([
  { path: '/api', router: apiRouter },
  { path: '/app', router: appRouter }
]);

server.listen();
