/**
 * In some cases, for example, with instrument stubs, a downstream package may be used both on the server
 * and in the browser. By importing through this entry point, the appropriate package will be used. For the
 * browser version, the application must initialize the transformer (or the esbuild wasm directly).
 */

const isBrowser = Object.hasOwn(globalThis, 'window');
if (isBrowser) {
  var { InstrumentTransformer } = await import('./browser.js');
} else {
  var { InstrumentTransformer } = await import('./server.js');
}

export { InstrumentTransformer };
