import type { ReactNode } from 'react__18.x';

export interface HydrationOptions {
  /**
   * Prefix for `useId`.
   */
  identifierPrefix?: string;
  onRecoverableError?: (error: unknown, errorInfo: ErrorInfo) => void;
}

export interface RootOptions {
  /**
   * Prefix for `useId`.
   */
  identifierPrefix?: string;
  onRecoverableError?: (error: unknown, errorInfo: ErrorInfo) => void;
}

export interface ErrorInfo {
  componentStack?: string;
  digest?: string;
}

export interface Root {
  render(children: ReactNode): void;
  unmount(): void;
}

export type Container = DocumentFragment | Element;

/**
 * createRoot lets you create a root to display React components inside a browser DOM node.
 *
 * @see {@link https://react.dev/reference/react-dom/client/createRoot API Reference for `createRoot`}
 */
export function createRoot(container: Container, options?: RootOptions): Root;

/**
 * Same as `createRoot()`, but is used to hydrate a container whose HTML contents were rendered by ReactDOMServer.
 *
 * React will attempt to attach event listeners to the existing markup.
 *
 * **Example Usage**
 *
 * ```jsx
 * hydrateRoot(document.querySelector('#root'), <App />)
 * ```
 *
 * @see https://reactjs.org/docs/react-dom-client.html#hydrateroot
 */
export function hydrateRoot(
  container: Document | Element,
  initialChildren: ReactNode,
  options?: HydrationOptions
): Root;
