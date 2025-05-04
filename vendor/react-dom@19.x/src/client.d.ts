import React from 'react__19.x';

declare const REACT_FORM_STATE_SIGIL: unique symbol;

export interface ReactFormState {
  [REACT_FORM_STATE_SIGIL]: never;
}

export interface HydrationOptions {
  formState?: ReactFormState | null;
  identifierPrefix?: string;
  onUncaughtError?: ((error: unknown, errorInfo: { componentStack?: string | undefined }) => void) | undefined;
  onRecoverableError?: (error: unknown, errorInfo: ErrorInfo) => void;
  onCaughtError?:
    | ((
        error: unknown,
        errorInfo: {
          componentStack?: string | undefined;
          errorBoundary?: React.Component<unknown> | undefined;
        }
      ) => void)
    | undefined;
}

export interface RootOptions {
  identifierPrefix?: string;
  onUncaughtError?: ((error: unknown, errorInfo: { componentStack?: string | undefined }) => void) | undefined;
  onRecoverableError?: (error: unknown, errorInfo: ErrorInfo) => void;
  onCaughtError?:
    | ((
        error: unknown,
        errorInfo: {
          componentStack?: string | undefined;
          errorBoundary?: React.Component<unknown> | undefined;
        }
      ) => void)
    | undefined;
}

export interface ErrorInfo {
  componentStack?: string;
}

export interface Root {
  render(children: React.ReactNode): void;
  unmount(): void;
}

export interface DO_NOT_USE_OR_YOU_WILL_BE_FIRED_EXPERIMENTAL_CREATE_ROOT_CONTAINERS {}

export type Container =
  | Element
  | DocumentFragment
  | Document
  | DO_NOT_USE_OR_YOU_WILL_BE_FIRED_EXPERIMENTAL_CREATE_ROOT_CONTAINERS[keyof DO_NOT_USE_OR_YOU_WILL_BE_FIRED_EXPERIMENTAL_CREATE_ROOT_CONTAINERS];

export function createRoot(container: Container, options?: RootOptions): Root;

export function hydrateRoot(
  container: Element | Document,
  initialChildren: React.ReactNode,
  options?: HydrationOptions
): Root;
