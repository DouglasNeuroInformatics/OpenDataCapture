/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/consistent-type-definitions */

import type { IfEmptyObject, IfNever, Split } from 'type-fest';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ADMIN_ACCESS_TOKEN: string;
      ADMIN_PASSWORD: string;
      ADMIN_USERNAME: string;
    }
  }
  interface Window {
    __PLAYWRIGHT_ACCESS_TOKEN__?: string;
  }
}

export type BrowserTarget = 'Desktop Chrome' | 'Desktop Firefox';

export type ExtractParams<TPath extends string> = Split<TPath, '/'>[number] extends infer TUnion
  ? TUnion extends `$${infer TParam}`
    ? TParam
    : never
  : never;

export type NavigateVariadicArgs<TPath extends RouteTo> = IfNever<
  ExtractParams<TPath>,
  [],
  [params: RouteParams<TPath>]
>;

export type NavigateArgs<TPath extends RouteTo> = [to: TPath, ...NavigateVariadicArgs<TPath>];

export type ProjectAuth = {
  accessToken: string;
};

export type ProjectMetadata = {
  authStorageFile: string;
  browserId: string;
  browserTarget: BrowserTarget;
};

// Generated from apps/web's route tree by scripts/gen-routes.ts (see src/generated/route.d.ts).
export type RouteTo = import('../generated/route.d.ts').RouteTo;

export type RouteParams<TPath extends RouteTo> = {
  [K in ExtractParams<TPath>]: number | string;
} extends infer TParams
  ? IfEmptyObject<TParams, void, TParams>
  : never;

export type TestDataMap<T> = {
  [K in BrowserTarget]: T;
};
