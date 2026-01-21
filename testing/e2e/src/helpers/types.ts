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
}

export type BrowserTarget = 'Desktop Chrome' | 'Desktop Firefox' | 'Desktop Safari';

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

export type ProjectMetadata = {
  browserTarget: BrowserTarget;
};

// export type RouteTo = import('../../../../apps/web/src/route-tree.ts').FileRouteTypes['to'];

export type RouteTo = string;

export type RouteParams<TPath extends RouteTo> = {
  [K in ExtractParams<TPath>]: number | string;
} extends infer TParams
  ? IfEmptyObject<TParams, void, TParams>
  : never;

export type TestDataMap<T> = {
  [K in BrowserTarget]: T;
};
