/* eslint-disable @typescript-eslint/consistent-type-definitions */

import type { AppProps } from '@/App';

declare global {
  namespace Express {
    interface Locals {
      loadRoot: (props: AppProps) => string;
    }
  }
}
