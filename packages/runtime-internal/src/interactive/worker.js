/// <reference lib="webworker" />

const worker = /** @type {ServiceWorkerGlobalScope} */ (/** @type {unknown} */ (self));

/** @type {Map<string, string>} */
const staticAssets = new Map();

worker.addEventListener('install', () => {
  worker.skipWaiting();
});

worker.addEventListener('activate', (event) => {
  event.waitUntil(worker.clients.claim());
});

/**
 * Converts a data URL into a Fetch API Response object.
 *
 * Any `data:<mime>[;base64],<payload>` URL is accepted, so every form the instrument bundler emits
 * (`data:image/png;base64,…`, esbuild's percent-encoded `data:image/svg+xml,<svg …>`,
 * `data:audio/mpeg;base64,…`, `data:application/octet-stream;base64,…`) is served. Decoding is
 * delegated to `fetch`, whose `data:` URL processor follows the Fetch spec: it percent-decodes
 * leniently (a bare `%` is kept), handles `;base64` and MIME parameters, and gives the resulting
 * blob its MIME type, which `new Response(blob)` uses as the `Content-Type`.
 *
 * @param {string} dataUrl - The data URL to convert. Example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..." or "data:text/plain,Hello%20World"
 * @returns {Promise<Response>} A Response object representing the decoded data URL content.
 */
async function dataUrlToResponse(dataUrl) {
  if (!dataUrl.startsWith('data:')) {
    throw new Error(`Static asset is not a data URL: '${dataUrl.slice(0, 64)}'`);
  }
  const blob = await (await fetch(dataUrl)).blob();
  return new Response(blob);
}

addEventListener('message', (event) => {
  /** @type {{ type?: 'STATIC_ASSETS', staticAssets: { [key: string]: string } }} */
  const data = event.data;
  if (data.type !== 'STATIC_ASSETS') {
    return;
  }
  Object.entries(data.staticAssets).forEach(([key, value]) => {
    staticAssets.set(key, value);
  });
  event.ports[0]?.postMessage({ type: 'STATIC_ASSETS_READY' });
});

worker.addEventListener('fetch', (_event) => {
  const event = /** @type {FetchEvent} */ (_event);
  const url = new URL(event.request.url);
  let pathname = url.pathname;
  // if the path is something like images/foo.png, instead of /images/foo.png
  if (pathname.startsWith('/runtime/v1/@opendatacapture/runtime-internal/interactive')) {
    pathname = pathname.replace('/runtime/v1/@opendatacapture/runtime-internal/interactive', '');
  }
  if (staticAssets.has(pathname)) {
    const dataUrl = /** @type {string} */ (staticAssets.get(pathname));
    event.respondWith(dataUrlToResponse(dataUrl));
  }
});
