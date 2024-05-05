// Note: These typings deliberately do not expose the augmentation to the global Math object

type State = NonNullable<unknown>;

type PRNG = {
  (): number;
  double(): number;
  int32(): number;
  new (seed?: string, options?: SeedRandomOptions, callback?: any): PRNG;
  quick(): number;
  state(): State;
};

type SeedRandomPRNG = {
  (seed?: string, options?: SeedRandomOptions, callback?: SeedRandomCallback): PRNG;
  alea: (seed?: string, options?: SeedRandomOptions) => PRNG;
  quick: (seed?: string, options?: SeedRandomOptions) => PRNG;
  tychei: (seed?: string, options?: SeedRandomOptions) => PRNG;
  xor128: (seed?: string, options?: SeedRandomOptions) => PRNG;
  xor4096: (seed?: string, options?: SeedRandomOptions) => PRNG;
  xorshift7: (seed?: string, options?: SeedRandomOptions) => PRNG;
  xorwow: (seed?: string, options?: SeedRandomOptions) => PRNG;
};

type SeedRandomCallback = (PRNG?: PRNG, shortseed?: string, global?: boolean, state?: State) => PRNG;

type SeedRandomOptions = {
  entropy?: boolean | undefined;
  global?: boolean | undefined;
  pass?: SeedRandomCallback | undefined;
  state?: State | boolean | undefined;
};

export declare const seedrandom: SeedRandomPRNG;
