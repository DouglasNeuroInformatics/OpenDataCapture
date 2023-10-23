import { rest, setupWorker } from 'msw';

const worker = setupWorker(
  rest.get('auth/login', (res, req, ctx) => {
    return res();
  })
);

worker.start();
