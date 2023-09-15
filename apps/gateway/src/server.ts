import { renderToReadableStream } from 'react-dom/server';

import { build } from './build.ts';
import { Root } from './Root.tsx';

await build();

async function renderClientSide() {
  return renderToReadableStream(Root(), {
    bootstrapScripts: ['/main.js']
  });
}



const server = Bun.serve({
  fetch: async (req) => {
    const url = new URL(req.url);
    // eslint-disable-next-line no-console
    console.log(`Recieved request: ${url.pathname}`);
    switch (url.pathname) {
      case '/':
        return new Response(await renderClientSide(), {
          headers: { 'Content-Type': 'text/html' }
        });
      case '/main.css':
        return new Response(Bun.file(bundleFileCss));
      case '/main.js':
        return new Response(Bun.file(bundleFile));
      default:
        return new Response('Error');
    }
  }
});

// eslint-disable-next-line no-console
console.log(`Listening on localhost:${server.port}`);
