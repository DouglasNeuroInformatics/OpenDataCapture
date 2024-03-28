/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference types="vite/client" />
/// <reference types="@opendatacapture/i18next/client" />

import type express from 'express';

import type { RootProps } from './Root';

declare global {
  type App = ReturnType<typeof express>;

  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    __ROOT_PROPS__: RootProps;
  }
}
