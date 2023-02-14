/// <reference types="vitest" />
/// <reference types="vite/client" />

// All of these should be undefined in production
interface ImportMetaDevEnv {
  readonly VITE_DEV_USERNAME?: string;
  readonly VITE_DEV_PASSWORD?: string;
  readonly VITE_DEV_SERVER_PORT?: number;
  readonly VITE_DEV_BYPASS_AUTH?: boolean;
}

interface ImportMetaEnv extends ImportMetaDevEnv {
  readonly VITE_API_HOST: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
