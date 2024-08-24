import type { ReactNode } from 'react__18.x';

import type { ErrorInfo } from './client';

export interface RenderToPipeableStreamOptions {
  bootstrapModules?: string[];
  bootstrapScriptContent?: string;
  bootstrapScripts?: string[];
  identifierPrefix?: string;
  namespaceURI?: string;
  nonce?: string;
  onAllReady?: () => void;
  onError?: (error: unknown, errorInfo: ErrorInfo) => string | void;
  onShellError?: (error: unknown) => void;
  onShellReady?: () => void;
  progressiveChunkSize?: number;
}

export interface PipeableStream {
  abort: (reason?: unknown) => void;
  pipe: <Writable extends NodeJS.WritableStream>(destination: Writable) => Writable;
}

export interface ServerOptions {
  identifierPrefix?: string;
}

/**
 * Only available in the environments with [Node.js Streams](https://nodejs.dev/learn/nodejs-streams).
 *
 * @see [API](https://reactjs.org/docs/react-dom-server.html#rendertopipeablestream)
 *
 * @param children
 * @param options
 */
export function renderToPipeableStream(children: ReactNode, options?: RenderToPipeableStreamOptions): PipeableStream;

/**
 * Render a React element to its initial HTML. This should only be used on the server.
 * React will return an HTML string. You can use this method to generate HTML on the server
 * and send the markup down on the initial request for faster page loads and to allow search
 * engines to crawl your pages for SEO purposes.
 *
 * If you call `ReactDOMClient.hydrateRoot()` on a node that already has this server-rendered markup,
 * React will preserve it and only attach event handlers, allowing you
 * to have a very performant first-load experience.
 */
export function renderToString(element: ReactNode, options?: ServerOptions): string;

/**
 * Render a React element to its initial HTML. Returns a Readable stream that outputs
 * an HTML string. The HTML output by this stream is exactly equal to what
 * `ReactDOMServer.renderToString()` would return.
 *
 * @deprecated
 */
export function renderToNodeStream(element: ReactNode, options?: ServerOptions): NodeJS.ReadableStream;

/**
 * Similar to `renderToString`, except this doesn't create extra DOM attributes
 * such as `data-reactid`, that React uses internally. This is useful if you want
 * to use React as a simple static page generator, as stripping away the extra
 * attributes can save lots of bytes.
 */
export function renderToStaticMarkup(element: ReactNode, options?: ServerOptions): string;

/**
 * Similar to `renderToNodeStream`, except this doesn't create extra DOM attributes
 * such as `data-reactid`, that React uses internally. The HTML output by this stream
 * is exactly equal to what `ReactDOMServer.renderToStaticMarkup()` would return.
 *
 * @deprecated
 */
export function renderToStaticNodeStream(element: ReactNode, options?: ServerOptions): NodeJS.ReadableStream;

export interface RenderToReadableStreamOptions {
  bootstrapModules?: string[];
  bootstrapScriptContent?: string;
  bootstrapScripts?: string[];
  identifierPrefix?: string;
  namespaceURI?: string;
  nonce?: string;
  onError?: (error: unknown, errorInfo: ErrorInfo) => string | void;
  progressiveChunkSize?: number;
  signal?: AbortSignal;
}

export interface ReactDOMServerReadableStream extends ReadableStream {
  allReady: Promise<void>;
}

/**
 * Only available in the environments with [Web Streams](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API) (this includes browsers, Deno, and some modern edge runtimes).
 *
 * @see [API](https://reactjs.org/docs/react-dom-server.html#rendertoreadablestream)
 */
export function renderToReadableStream(
  children: ReactNode,
  options?: RenderToReadableStreamOptions
): Promise<ReactDOMServerReadableStream>;

export const version: string;
