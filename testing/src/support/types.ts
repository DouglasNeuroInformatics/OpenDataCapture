/* eslint-disable @typescript-eslint/consistent-type-definitions */

import type { IfEmptyObject, IfNever, Split } from 'type-fest';

declare global {
  interface Window {
    // Read on boot by the app in test builds; the token is memory-only (never persisted) for compliance.
    __PLAYWRIGHT_ACCESS_TOKEN__?: string;
  }
}

export type Role = 'ADMIN' | 'GROUP_MANAGER' | 'STANDARD';

/** The `app` localStorage store the web app reads for first-run gating. */
export type AppState = {
  isDisclaimerAccepted: boolean;
  isWalkthroughComplete: boolean;
};

// Generated from apps/web's route tree by scripts/gen-routes.ts (see src/generated/route.d.ts).
export type RouteTo = import('../generated/route.d.ts').RouteTo;

export type ExtractParams<TPath extends string> = Split<TPath, '/'>[number] extends infer TUnion
  ? TUnion extends `$${infer TParam}`
    ? TParam
    : never
  : never;

export type RouteParams<TPath extends RouteTo> = {
  [K in ExtractParams<TPath>]: number | string;
} extends infer TParams
  ? IfEmptyObject<TParams, void, TParams>
  : never;

export type NavigateVariadicArgs<TPath extends RouteTo> = IfNever<
  ExtractParams<TPath>,
  [],
  [params: RouteParams<TPath>]
>;

export type NavigateArgs<TPath extends RouteTo> = [to: TPath, ...NavigateVariadicArgs<TPath>];
