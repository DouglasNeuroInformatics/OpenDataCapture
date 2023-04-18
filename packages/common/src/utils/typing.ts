export type Primitive = string | number | bigint | boolean | symbol | null | undefined;

export type Nullable<T extends object> = { [K in keyof T]: T[K] | null | undefined };

export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;
