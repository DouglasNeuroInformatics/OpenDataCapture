/* eslint-disable @typescript-eslint/consistent-type-definitions */

type StyleExtension = 'css';

type ImageExtension = 'jpeg' | 'jpg' | 'png';

type RequiredFile<T extends string> = T extends `${string}.${StyleExtension}`
  ? string
  : T extends `${string}.${ImageExtension}`
    ? string
    : never;

interface ImportMeta {
  require<T extends string>(filepath: T): RequiredFile<T>;
}
