import type { ReleaseInfo } from '@opendatacapture/schemas/setup';

declare global {
  const __RELEASE_INFO__: ReleaseInfo;
}
