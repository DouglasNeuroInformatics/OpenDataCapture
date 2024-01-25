import type { Promisable } from 'type-fest';

export type ViewEngine = (
  filepath: string,
  props: object,
  callback: (error: any, rendered?: string) => void
) => Promisable<void>;
