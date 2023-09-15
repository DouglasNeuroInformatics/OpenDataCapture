import path from 'path';

import { renderToReadableStream } from 'react-dom/server';

import esbuild from 'esbuild';

import { Root } from './Root.tsx';

const bundleFile = path.resolve(import.meta.dir, '..', 'dist', 'main.js');
const bundleFileCss = path.resolve(import.meta.dir, '..', 'dist', 'main.css');

const ctx = await esbuild.context({
  bundle: true,
  entryPoints: [path.resolve(import.meta.dir, 'client', 'main.tsx')],
  minify: true,
  outfile: bundleFile,
  platform: 'browser'
});

await ctx.watch();

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
