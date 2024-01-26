import type { RequestHandler } from 'express';

export const notFound: RequestHandler = (_, res) => {
  res
    .status(404)
    .set({ 'Content-Type': 'text/html' })
    .end(
      `<div style="display: flex; justify-content: center; align-items: center; height: 90vh;">
        <h1>404 - Not Found</h1>
      </div>`
    );
};
