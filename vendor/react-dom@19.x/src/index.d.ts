import { Key, ReactNode, ReactPortal } from 'react__19.x';

export function createPortal(children: ReactNode, container: Element | DocumentFragment, key?: Key | null): ReactPortal;

export const version: string;

export function flushSync<R>(fn: () => R): R;

export function unstable_batchedUpdates<A, R>(callback: (a: A) => R, a: A): R;
export function unstable_batchedUpdates<R>(callback: () => R): R;

export interface FormStatusNotPending {
  pending: false;
  data: null;
  method: null;
  action: null;
}

export interface FormStatusPending {
  pending: true;
  data: FormData;
  method: string;
  action: string | ((formData: FormData) => void | Promise<void>);
}

export type FormStatus = FormStatusPending | FormStatusNotPending;

export function useFormStatus(): FormStatus;

export function useFormState<State>(
  action: (state: Awaited<State>) => State | Promise<State>,
  initialState: Awaited<State>,
  permalink?: string
): [state: Awaited<State>, dispatch: () => void, isPending: boolean];
export function useFormState<State, Payload>(
  action: (state: Awaited<State>, payload: Payload) => State | Promise<State>,
  initialState: Awaited<State>,
  permalink?: string
): [state: Awaited<State>, dispatch: (payload: Payload) => void, isPending: boolean];

export function prefetchDNS(href: string): void;

export interface PreconnectOptions {
  crossOrigin?: 'anonymous' | 'use-credentials' | '' | undefined;
}
export function preconnect(href: string, options?: PreconnectOptions): void;

export type PreloadAs =
  | 'audio'
  | 'document'
  | 'embed'
  | 'fetch'
  | 'font'
  | 'image'
  | 'object'
  | 'track'
  | 'script'
  | 'style'
  | 'video'
  | 'worker';

export interface PreloadOptions {
  as: PreloadAs;
  crossOrigin?: 'anonymous' | 'use-credentials' | '' | undefined;
  fetchPriority?: 'high' | 'low' | 'auto' | undefined;
  imageSizes?: string | undefined;
  imageSrcSet?: string | undefined;
  integrity?: string | undefined;
  type?: string | undefined;
  nonce?: string | undefined;
  referrerPolicy?: ReferrerPolicy | undefined;
}

export function preload(href: string, options?: PreloadOptions): void;

export type PreloadModuleAs = RequestDestination;

export interface PreloadModuleOptions {
  as: PreloadModuleAs;
  crossOrigin?: 'anonymous' | 'use-credentials' | '' | undefined;
  integrity?: string | undefined;
  nonce?: string | undefined;
}
export function preloadModule(href: string, options?: PreloadModuleOptions): void;

export type PreinitAs = 'script' | 'style';
export interface PreinitOptions {
  as: PreinitAs;
  crossOrigin?: 'anonymous' | 'use-credentials' | '' | undefined;
  fetchPriority?: 'high' | 'low' | 'auto' | undefined;
  precedence?: string | undefined;
  integrity?: string | undefined;
  nonce?: string | undefined;
}
export function preinit(href: string, options?: PreinitOptions): void;

export type PreinitModuleAs = 'script';

export interface PreinitModuleOptions {
  as?: PreinitModuleAs;
  crossOrigin?: 'anonymous' | 'use-credentials' | '' | undefined;
  integrity?: string | undefined;
  nonce?: string | undefined;
}
export function preinitModule(href: string, options?: PreinitModuleOptions): void;

export function requestFormReset(form: HTMLFormElement): void;
