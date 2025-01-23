/* eslint-disable @typescript-eslint/consistent-type-definitions */
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference types="vite/client" />

// All of these should be undefined in production
interface ImportMetaDevEnv {
  readonly VITE_DEV_BYPASS_AUTH?: string;
  readonly VITE_DEV_FORCE_CLEAR_QUERY_CACHE?: string;
  readonly VITE_DEV_NETWORK_LATENCY?: string;
  readonly VITE_DEV_PASSWORD?: string;
  readonly VITE_DEV_USERNAME?: string;
}

interface ImportMetaEnv extends ImportMetaDevEnv {
  readonly API_BASE_URL?: string;
  readonly CONTACT_EMAIL?: string;
  readonly DOCS_URL?: string;
  readonly GATEWAY_ENABLED?: string;
  readonly GITHUB_REPO_URL?: string;
  readonly LICENSE_URL?: string;
  readonly PLAUSIBLE_BASE_URL?: string;
  readonly PLAUSIBLE_WEB_DATA_DOMAIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare const __RELEASE__: import('@opendatacapture/schemas/setup').ReleaseInfo;
