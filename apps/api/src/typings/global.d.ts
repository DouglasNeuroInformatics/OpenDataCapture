/* eslint-disable @typescript-eslint/consistent-type-definitions */
import type { ReleaseInfo } from '@opendatacapture/schemas/setup';

declare global {
  interface ImportMeta {
    readonly release: ReleaseInfo;
  }
}
