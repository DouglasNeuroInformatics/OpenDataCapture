/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/consistent-type-definitions */

import '@casl/mongoose';
import type { AppEntityName } from '@open-data-capture/types';

type Records = {
  [K in AppEntityName]: true;
};

declare module '@casl/mongoose' {
  interface RecordTypes extends Records {}
}
