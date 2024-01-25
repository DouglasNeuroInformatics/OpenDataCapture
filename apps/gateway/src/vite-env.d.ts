/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference types="vite/client" />
/// <reference types="@open-data-capture/i18next/client" />
/// <reference types="@open-data-capture/instrument-renderer/client" />

import type { AppProps } from './App';
import type express from 'express';

declare global {
  type App = ReturnType<typeof express>;

  interface Window {
    __APP_PROPS__: AppProps;
  }
}
