export declare const __commitHash: string;

export declare const __type: string;

export declare const __version: string;

declare type ArrayInt = {
  sign: -1 | 1;
  data: number[];
};

export declare const congruential32: ((seed: number) => RandomGenerator) & {
  fromState: typeof fromState;
};

export declare type Distribution<T> = (rng: RandomGenerator) => [T, RandomGenerator];

declare function fromState(state: readonly number[]): RandomGenerator;

declare function fromState_2(state: readonly number[]): RandomGenerator;

declare function fromState_3(state: readonly number[]): RandomGenerator;

declare function fromState_4(state: readonly number[]): RandomGenerator;

export declare function generateN(rng: RandomGenerator, num: number): [number[], RandomGenerator];

export declare const mersenne: ((seed: number) => RandomGenerator) & {
  fromState: typeof fromState_2;
};

export declare interface RandomGenerator {
  clone(): RandomGenerator;
  next(): [number, RandomGenerator];
  jump?(): RandomGenerator;
  unsafeNext(): number;
  unsafeJump?(): void;
  getState?(): readonly number[];
}

export declare function skipN(rng: RandomGenerator, num: number): RandomGenerator;

export declare function uniformArrayIntDistribution(from: ArrayInt, to: ArrayInt): Distribution<ArrayInt>;

export declare function uniformArrayIntDistribution(
  from: ArrayInt,
  to: ArrayInt,
  rng: RandomGenerator
): [ArrayInt, RandomGenerator];

export declare function uniformBigIntDistribution(from: bigint, to: bigint): Distribution<bigint>;

export declare function uniformBigIntDistribution(
  from: bigint,
  to: bigint,
  rng: RandomGenerator
): [bigint, RandomGenerator];

export declare function uniformIntDistribution(from: number, to: number): Distribution<number>;

export declare function uniformIntDistribution(
  from: number,
  to: number,
  rng: RandomGenerator
): [number, RandomGenerator];

export declare function unsafeGenerateN(rng: RandomGenerator, num: number): number[];

export declare function unsafeSkipN(rng: RandomGenerator, num: number): void;

export declare function unsafeUniformArrayIntDistribution(from: ArrayInt, to: ArrayInt, rng: RandomGenerator): ArrayInt;

export declare function unsafeUniformBigIntDistribution(from: bigint, to: bigint, rng: RandomGenerator): bigint;

export declare function unsafeUniformIntDistribution(from: number, to: number, rng: RandomGenerator): number;

export declare const xoroshiro128plus: ((seed: number) => RandomGenerator) & {
  fromState: typeof fromState_4;
};

export declare const xorshift128plus: ((seed: number) => RandomGenerator) & {
  fromState: typeof fromState_3;
};
