import fs from 'fs';

import type { Promisable } from 'type-fest';

export type ViewEngine = (
  filepath: string,
  props: object,
  callback: (error: any, rendered?: string) => void
) => Promisable<void>;

export const htmlEngine: ViewEngine = (filepath, props, callback) => {
  console.log({ props });
  fs.readFile(filepath, 'utf-8', (err, content) => {
    if (err) {
      return callback(err);
    }
    callback(null, content);
  });
};
