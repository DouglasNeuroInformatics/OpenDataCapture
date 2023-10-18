// src/mocks.js
import { rest, setupWorker } from 'msw';

const worker = setupWorker(
  rest.get('/book/:bookId', (req, res, ctx) => {
    return res(ctx.json({ title: 'overview' }));
  })
);

// Make the `worker` and `rest` references available globally,
// so they can be accessed in both runtime and test suites.
window.msw = {
  rest,
  worker
};
