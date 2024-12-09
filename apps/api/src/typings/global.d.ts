import type { ReleaseInfo } from '@opendatacapture/schemas/setup';

declare global {
  const __RELEASE__: ReleaseInfo;
}
