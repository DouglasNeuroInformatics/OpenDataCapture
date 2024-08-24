type ArrayInt = {
  data: number[];
  sign: -1 | 1;
};

function fromState(state: readonly number[]): RandomGenerator;

function fromState_2(state: readonly number[]): RandomGenerator;

function fromState_3(state: readonly number[]): RandomGenerator;

function fromState_4(state: readonly number[]): RandomGenerator;

declare namespace PureRand {
  const __commitHash: string;

  const __type: string;

  const __version: string;

  const congruential32: ((seed: number) => RandomGenerator) & {
    fromState: typeof fromState;
  };

  type Distribution<T> = (rng: RandomGenerator) => [T, RandomGenerator];

  function generateN(rng: RandomGenerator, num: number): [number[], RandomGenerator];

  const mersenne: ((seed: number) => RandomGenerator) & {
    fromState: typeof fromState_2;
  };

  interface RandomGenerator {
    clone(): RandomGenerator;
    getState?(): readonly number[];
    jump?(): RandomGenerator;
    next(): [number, RandomGenerator];
    unsafeJump?(): void;
    unsafeNext(): number;
  }

  function skipN(rng: RandomGenerator, num: number): RandomGenerator;

  function uniformArrayIntDistribution(from: ArrayInt, to: ArrayInt): Distribution<ArrayInt>;

  function uniformArrayIntDistribution(from: ArrayInt, to: ArrayInt, rng: RandomGenerator): [ArrayInt, RandomGenerator];

  function uniformBigIntDistribution(from: bigint, to: bigint): Distribution<bigint>;

  function uniformBigIntDistribution(from: bigint, to: bigint, rng: RandomGenerator): [bigint, RandomGenerator];

  function uniformIntDistribution(from: number, to: number): Distribution<number>;

  function uniformIntDistribution(from: number, to: number, rng: RandomGenerator): [number, RandomGenerator];

  function unsafeGenerateN(rng: RandomGenerator, num: number): number[];

  function unsafeSkipN(rng: RandomGenerator, num: number): void;

  function unsafeUniformArrayIntDistribution(from: ArrayInt, to: ArrayInt, rng: RandomGenerator): ArrayInt;

  function unsafeUniformBigIntDistribution(from: bigint, to: bigint, rng: RandomGenerator): bigint;

  function unsafeUniformIntDistribution(from: number, to: number, rng: RandomGenerator): number;

  const xoroshiro128plus: ((seed: number) => RandomGenerator) & {
    fromState: typeof fromState_4;
  };

  const xorshift128plus: ((seed: number) => RandomGenerator) & {
    fromState: typeof fromState_3;
  };
}

export import __commitHash = PureRand.__commitHash;
export import __type = PureRand.__type;
export import __version = PureRand.__version;
export import congruential32 = PureRand.congruential32;
export import generateN = PureRand.generateN;
export import mersenne = PureRand.mersenne;
export import uniformArrayIntDistribution = PureRand.uniformArrayIntDistribution;
export import uniformBigIntDistribution = PureRand.uniformBigIntDistribution;
export import uniformIntDistribution = PureRand.uniformIntDistribution;
export import unsafeGenerateN = PureRand.unsafeGenerateN;
export import unsafeSkipN = PureRand.unsafeSkipN;
export import unsafeUniformArrayIntDistribution = PureRand.unsafeUniformArrayIntDistribution;
export import unsafeUniformBigIntDistribution = PureRand.unsafeUniformBigIntDistribution;
export import unsafeUniformIntDistribution = PureRand.unsafeUniformIntDistribution;
export import xoroshiro128plus = PureRand.xoroshiro128plus;
export import xorshift128plus = PureRand.xorshift128plus;

export import Distribution = PureRand.Distribution;
export import RandomGenerator = PureRand.RandomGenerator;
export import skipN = PureRand.skipN;

export default PureRand;
