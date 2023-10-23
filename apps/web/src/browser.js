import { rest, setupWorker } from 'msw';

/* eslint-disable */
const worker = setupWorker(
  rest.get('auth/login', (res, req, ctx) => {
    return res();
  })
);
/* eslint-enable */
worker.start();
