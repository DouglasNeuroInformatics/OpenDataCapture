/* eslint-disable @typescript-eslint/consistent-type-definitions -- this augments Express.Locals by declaration merging, which a type alias cannot do */

import type { RootProps } from '@/Root';

declare global {
  namespace Express {
    interface Locals {
      loadRoot: (props: RootProps) => string;
    }
  }
}
