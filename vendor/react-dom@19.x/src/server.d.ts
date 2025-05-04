declare global {
  namespace NodeJS {
    interface ReadableStream {}
    interface WritableStream {}
  }
  interface AbortSignal {}
  interface ReadableStream {}
}

import { ReactNode } from 'react__19.x';

import type { ErrorInfo } from './client.d.ts';

export type BootstrapScriptDescriptor = {
  src: string;
  integrity?: string | undefined;
  crossOrigin?: string | undefined;
};

export interface RenderToPipeableStreamOptions {
  identifierPrefix?: string;
  namespaceURI?: string;
  nonce?: string;
  bootstrapScriptContent?: string;
  bootstrapScripts?: Array<string | BootstrapScriptDescriptor>;
  bootstrapModules?: Array<string | BootstrapScriptDescriptor>;
  progressiveChunkSize?: number;
  onShellReady?: () => void;
  onShellError?: (error: unknown) => void;
  onAllReady?: () => void;
  onError?: (error: unknown, errorInfo: ErrorInfo) => string | void;
}

export interface PipeableStream {
  abort: (reason?: unknown) => void;
  pipe: <Writable extends NodeJS.WritableStream>(destination: Writable) => Writable;
}

export interface ServerOptions {
  identifierPrefix?: string;
}

export function renderToPipeableStream(children: ReactNode, options?: RenderToPipeableStreamOptions): PipeableStream;

export function renderToString(element: ReactNode, options?: ServerOptions): string;

export function renderToStaticMarkup(element: ReactNode, options?: ServerOptions): string;

export interface RenderToReadableStreamOptions {
  identifierPrefix?: string;
  namespaceURI?: string;
  nonce?: string;
  bootstrapScriptContent?: string;
  bootstrapScripts?: Array<string | BootstrapScriptDescriptor>;
  bootstrapModules?: Array<string | BootstrapScriptDescriptor>;
  progressiveChunkSize?: number;
  signal?: AbortSignal;
  onError?: (error: unknown, errorInfo: ErrorInfo) => string | void;
}

export interface ReactDOMServerReadableStream extends ReadableStream {
  allReady: Promise<void>;
}

export function renderToReadableStream(
  children: ReactNode,
  options?: RenderToReadableStreamOptions
): Promise<ReactDOMServerReadableStream>;

export const version: string;
