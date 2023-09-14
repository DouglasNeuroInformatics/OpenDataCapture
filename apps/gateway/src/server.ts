import { renderToReadableStream } from 'react-dom/server';

import { App } from './App.tsx';

const server = Bun.serve({
  fetch: async () => {
    const stream = await renderToReadableStream(App());
    return new Response(stream, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
});

// eslint-disable-next-line no-console
console.log(`Listening on localhost:${server.port}`);
