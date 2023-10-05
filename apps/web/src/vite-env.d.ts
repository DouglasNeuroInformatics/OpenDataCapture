/* eslint-disable @typescript-eslint/consistent-type-definitions */
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference types="vite/client" />

// All of these should be undefined in production
interface ImportMetaDevEnv {
  readonly VITE_DEV_BYPASS_AUTH?: string;
  readonly VITE_DEV_GIT_BRANCH?: string;
  readonly VITE_DEV_GIT_COMMIT?: string;
  readonly VITE_DEV_GIT_COMMIT_DATE?: string;
  readonly VITE_DEV_PASSWORD?: string;
  readonly VITE_DEV_USERNAME?: string;
}

interface ImportMetaEnv extends ImportMetaDevEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_CONTACT_EMAIL: string;
  readonly VITE_DOCS_URL: string;
  readonly VITE_GITHUB_REPO_URL: string;
  readonly VITE_LICENSE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
