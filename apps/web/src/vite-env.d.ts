/* eslint-disable @typescript-eslint/consistent-type-definitions */
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference types="vite/client" />

// All of these should be undefined in production
interface ImportMetaDevEnv {
  readonly VITE_DEV_BYPASS_AUTH?: string;
  readonly VITE_DEV_PASSWORD?: string;
  readonly VITE_DEV_USERNAME?: string;
}

interface ImportMetaEnv extends ImportMetaDevEnv {
  readonly CONTACT_EMAIL: string;
  readonly DOCS_URL: string;
  readonly GITHUB_REPO_URL: string;
  readonly LICENSE_URL: string;
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
