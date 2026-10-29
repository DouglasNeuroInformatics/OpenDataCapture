/* eslint-disable @typescript-eslint/consistent-type-definitions -- this augments the global Window by declaration merging, which a type alias cannot do */

/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference types="vite/client" />

import type { ReleaseInfo } from '@opendatacapture/schemas/setup';
import type express from 'express';

import type { RootProps } from './Root';

declare global {
  type App = ReturnType<typeof express>;

  interface Window {
    __ROOT_PROPS__: RootProps;
  }

  const __RELEASE__: ReleaseInfo;
}
