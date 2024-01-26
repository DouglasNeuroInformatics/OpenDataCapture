/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference types="vite/client" />
/// <reference types="@open-data-capture/i18next/client" />
/// <reference types="@open-data-capture/instrument-renderer/client" />

import type { RootProps } from './Root';
import type express from 'express';

declare global {
  type App = ReturnType<typeof express>;

  interface Window {
    __ROOT_PROPS__: RootProps;
  }
}
