// cypress/support/setup.js

import { rest, setupWorker } from 'msw';

const worker = setupWorker(
  rest.get('http://localhost:3000/auth/login', (req, res, ctx) => {
    return res(ctx.json({ title: 'overview' }));
  })
);

// Start the worker
worker.start();
