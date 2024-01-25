/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference types="vite/client" />
/// <reference types="@open-data-capture/i18next/client" />
/// <reference types="@open-data-capture/instrument-renderer/client" />

import type { AppProps } from './App';

declare global {
  interface Window {
    __APP_PROPS__: AppProps;
  }
}
