/* eslint-disable @typescript-eslint/consistent-type-definitions */

import type { RootProps } from '@/Root';

declare global {
  namespace Express {
    interface Locals {
      loadRoot: (props: RootProps) => string;
    }
  }
}
