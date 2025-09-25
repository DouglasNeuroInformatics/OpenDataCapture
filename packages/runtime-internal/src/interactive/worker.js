/// <reference lib="webworker" />

/** @type {Map<string, string>} */
const staticAssets = new Map();

/**
 * Converts a data URL (base64 or plain) into a Fetch API Response object.
 *
 * @param {string} dataUrl - The data URL to convert. Example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..." or "data:text/plain,Hello%20World"
 * @returns {Response} A Response object representing the decoded data URL content.
 */
function dataUrlToResponse(dataUrl) {
  // Try base64 image format first
  const base64Match = /^data:(image\/[a-zA-Z+]+);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (base64Match) {
    const [, mimeType, base64Data] = /** @type {any[]} */ (base64Match);

    // Decode base64 to Uint8Array
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return new Response(bytes, {
      headers: { 'Content-Type': mimeType }
    });
  }

  // Try plain text format
  const textMatch = /^data:(text\/[a-zA-Z+]+),(.*)$/.exec(dataUrl);
  if (textMatch) {
    const [, mimeType, textData] = /** @type {any[]} */ (textMatch);
    const decodedText = decodeURIComponent(textData);
    return new Response(decodedText, {
      headers: { 'Content-Type': mimeType }
    });
  }

  throw new Error('Invalid or unsupported data URL: must be a base64-encoded image or plain text');
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
});

self.addEventListener('fetch', (_event) => {
  if (!staticAssets) {
    console.error('staticAssets is not defined');
    return;
  }

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
