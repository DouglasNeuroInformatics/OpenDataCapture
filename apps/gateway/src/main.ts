import { App } from './App.tsx';
import { renderToReadableStream } from 'react-dom/server';

const server = Bun.serve({
  async fetch() {
    const stream = await renderToReadableStream(App());
    return new Response(stream, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
});

console.log(`Listening on localhost:${server.port}`);
