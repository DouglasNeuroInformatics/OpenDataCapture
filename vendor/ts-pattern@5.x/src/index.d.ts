/**
 * `P._` is a wildcard pattern, matching **any value**.
 * It's an alias to `P.any`.
 *
 * [Read the documentation for `P._` on GitHub](https://github.com/gvergnaud/ts-pattern#p_-wildcard)
 *
 * @example
 *  match(value)
 *   .with(P._, () => 'will always match')
 */
declare const _: AnyPattern;

declare type All<bools extends boolean[]> = bools[number] extends true ? true : false;

declare type AllKeys<a> = a extends any ? keyof a : never;

declare type AndP<input, ps> = Matcher<input, ps, 'and'>;

declare const anonymousSelectKey = '@ts-pattern/anonymous-select-key';

declare type anonymousSelectKey = typeof anonymousSelectKey;

declare type AnonymousSelectP = SelectP<symbols.anonymousSelectKey>;

/**
 * `P.any` is a wildcard pattern, matching **any value**.
 *
 * [Read the documentation for `P.any` on GitHub](https://github.com/gvergnaud/ts-pattern#p_-wildcard)
 *
 * @example
 *  match(value)
 *   .with(P.any, () => 'will always match')
 */
declare const any: AnyPattern;

declare type AnyConstructor = abstract new (...args: any[]) => any;

declare type AnyMatcher = Matcher<any, any, any, any, any>;

declare type AnyPattern = Chainable<GuardP<unknown, unknown>, never>;

/**
 * `P.array(subpattern)` takes a sub pattern and returns a pattern, which matches
 * arrays if all their elements match the sub pattern.
 *
 * [Read the documentation for `P.array` on GitHub](https://github.com/gvergnaud/ts-pattern#parray-patterns)
 *
 * @example
 *  match(value)
 *   .with({ users: P.array({ name: P.string }) }, () => 'will match { name: string }[]')
 */
declare function array<input>(): ArrayChainable<ArrayP<input, unknown>>;

declare function array<input, const pattern extends Pattern_2<WithDefault_2<UnwrapArray<input>, unknown>>>(
  pattern: pattern
): ArrayChainable<ArrayP<input, pattern>>;

declare type ArrayChainable<pattern, omitted extends string = never> = Omit<
  {
    /**
     * `.optional()` returns a pattern which matches if the
     * key is undefined or if it is defined and the previous pattern matches its value.
     *
     * [Read the documentation for `P.optional` on GitHub](https://github.com/gvergnaud/ts-pattern#poptional-patterns)
     *
     * @example
     *  match(value)
     *   .with({ greeting: P.string.optional() }, () => 'will match { greeting?: string}')
     */
    optional<input>(): ArrayChainable<OptionalP<input, pattern>, 'optional' | omitted>;
    select<input, k extends string>(key: k): ArrayChainable<SelectP<k, input, pattern>, 'select' | omitted>;
    /**
     * `P.select()` will inject this property into the handler function's arguments.
     *
     * [Read the documentation for `P.select` on GitHub](https://github.com/gvergnaud/ts-pattern#pselect-patterns)
     *
     * @example
     *  match<{ age: number }>(value)
     *   .with({ age: P.string.select() }, (age) => 'age: number')
     */
    select<input>(): ArrayChainable<SelectP<symbols.anonymousSelectKey, input, pattern>, 'select' | omitted>;
  },
  omitted
> &
  Variadic<pattern>;

declare type ArrayP<input, p> = Matcher<input, p, 'array'>;

declare type ArrayPattern<a> = a extends readonly (infer i)[]
  ? a extends readonly [any, ...any]
    ? {
        readonly [index in keyof a]: Pattern_2<a[index]>;
      }
    : readonly [...Pattern_2<i>[], Pattern_2<i>] | readonly [] | readonly [Pattern_2<i>, ...Pattern_2<i>[]]
  : never;

/**
 * `P.bigint` is a wildcard pattern, matching any **bigint**.
 *
 * [Read the documentation for `P.bigint` on GitHub](https://github.com/gvergnaud/ts-pattern#number-wildcard)
 *
 * @example
 *   .with(P.bigint, () => 'will match on bigints')
 */
declare const bigint: BigIntPattern;

declare type BigIntChainable<p, omitted extends string = never> = Chainable<p, omitted> &
  Omit<
    {
      /**
       * `P.bigint.between(min, max)` matches **bigint** between `min` and `max`,
       * equal to min or equal to max.
       *
       * [Read the documentation for `P.bigint.between` on GitHub](https://github.com/gvergnaud/ts-pattern#pnumberbetween)
       *
       * @example
       *  match(value)
       *   .with(P.bigint.between(0, 10), () => '0 <= numbers <= 10')
       */
      between<input, const min extends bigint, const max extends bigint>(
        min: min,
        max: max
      ): BigIntChainable<MergeGuards<input, p, GuardExcludeP<unknown, bigint, never>>, omitted>;
      /**
       * `P.bigint.gt(min)` matches **bigint** greater than `min`.
       *
       * [Read the documentation for `P.bigint.gt` on GitHub](https://github.com/gvergnaud/ts-pattern#pnumbergt)
       *
       * @example
       *  match(value)
       *   .with(P.bigint.gt(10), () => 'numbers > 10')
       */
      gt<input, const min extends bigint>(
        min: min
      ): BigIntChainable<MergeGuards<input, p, GuardExcludeP<unknown, bigint, never>>, omitted>;
      /**
       * `P.bigint.gte(min)` matches **bigint** greater than or equal to `min`.
       *
       * [Read the documentation for `P.bigint.gte` on GitHub](https://github.com/gvergnaud/ts-pattern#pnumbergte)
       *
       * @example
       *  match(value)
       *   .with(P.bigint.gte(10), () => 'bigints >= 10')
       */
      gte<input, const min extends bigint>(
        min: min
      ): BigIntChainable<MergeGuards<input, p, GuardExcludeP<unknown, bigint, never>>, omitted>;
      /**
       * `P.bigint.lt(max)` matches **bigint** smaller than `max`.
       *
       * [Read the documentation for `P.bigint.lt` on GitHub](https://github.com/gvergnaud/ts-pattern#pnumberlt)
       *
       * @example
       *  match(value)
       *   .with(P.bigint.lt(10), () => 'numbers < 10')
       */
      lt<input, const max extends bigint>(
        max: max
      ): BigIntChainable<MergeGuards<input, p, GuardExcludeP<unknown, bigint, never>>, omitted>;
      /**
       * `P.bigint.lte(max)` matches **bigint** smaller than or equal to `max`.
       *
       * [Read the documentation for `P.bigint.lte` on GitHub](https://github.com/gvergnaud/ts-pattern#pnumberlte)
       *
       * @example
       *  match(value)
       *   .with(P.bigint.lte(10), () => 'bigints <= 10')
       */
      lte<input, const max extends bigint>(
        max: max
      ): BigIntChainable<MergeGuards<input, p, GuardExcludeP<unknown, bigint, never>>, omitted>;
      /**
       * `P.bigint.negative` matches **negative** bigints.
       *
       * [Read the documentation for `P.bigint.negative` on GitHub](https://github.com/gvergnaud/ts-pattern#pnumbernegative)
       *
       * @example
       *  match(value)
       *   .with(P.bigint.negative, () => 'bigint < 0')
       */
      negative<input>(): BigIntChainable<
        MergeGuards<input, p, GuardExcludeP<unknown, bigint, never>>,
        'negative' | 'positive' | omitted
      >;
      /**
       * `P.bigint.positive` matches **positive** bigints.
       *
       * [Read the documentation for `P.bigint.positive` on GitHub](https://github.com/gvergnaud/ts-pattern#pnumberpositive)
       *
       * @example
       *  match(value)
       *   .with(P.bigint.positive, () => 'bigint > 0')
       */
      positive<input>(): BigIntChainable<
        MergeGuards<input, p, GuardExcludeP<unknown, bigint, never>>,
        'negative' | 'positive' | omitted
      >;
    },
    omitted
  >;

declare type BigIntPattern = BigIntChainable<GuardP<unknown, bigint>, never>;

/**
 * `P.boolean` is a wildcard pattern, matching any **boolean**.
 *
 * [Read the documentation for `P.boolean` on GitHub](https://github.com/gvergnaud/ts-pattern#boolean-wildcard)
 *
 * @example
 *   .with(P.boolean, () => 'will match on booleans')
 */
declare const boolean: BooleanPattern;

declare type BooleanPattern = Chainable<GuardP<unknown, boolean>, never>;

declare type BuildMany<data, xs extends readonly any[]> = xs extends any ? BuildOne<data, xs> : never;

declare type BuildOne<data, xs extends readonly any[]> = xs extends [[infer value, infer path], ...infer tail]
  ? BuildOne<Update<data, value, Extract<path, readonly PropertyKey[]>>, tail>
  : data;

declare type BuiltInObjects =
  | {
      readonly [Symbol.toStringTag]: string;
    }
  | any[]
  | Date
  | Function
  | Generator
  | RegExp;

declare type Call<fn extends Fn, input> = ({
  input: input;
} & fn)['output'];

declare type Chainable<p, omitted extends string = never> = Omit<
  {
    /**
     * `pattern.and(pattern)` returns a pattern that matches
     * if the previous pattern and the next one match the input.
     *
     * [Read the documentation for `P.intersection` on GitHub](https://github.com/gvergnaud/ts-pattern#pintersection-patterns)
     *
     * @example
     *  match(value)
     *   .with(
     *     P.string.and(P.when(isUsername)),
     *     (username) => '...'
     *   )
     */
    and<input, p2 extends Pattern_2<input>>(pattern: p2): Chainable<AndP<input, [p, p2]>, omitted>;
    /**
     * `.optional()` returns a pattern which matches if the
     * key is undefined or if it is defined and the previous pattern matches its value.
     *
     * [Read the documentation for `P.optional` on GitHub](https://github.com/gvergnaud/ts-pattern#poptional-patterns)
     *
     * @example
     *  match(value)
     *   .with({ greeting: P.string.optional() }, () => 'will match { greeting?: string}')
     */
    optional<input>(): Chainable<OptionalP<input, p>, 'optional' | omitted>;
    /**
     * `pattern.or(pattern)` returns a pattern that matches
     * if **either** the previous pattern or the next one match the input.
     *
     * [Read the documentation for `P.union` on GitHub](https://github.com/gvergnaud/ts-pattern#punion-patterns)
     *
     * @example
     *  match(value)
     *   .with(
     *     { value: P.string.or(P.number) },
     *     ({ value }) => 'value: number | string'
     *   )
     */
    or<input, p2 extends Pattern_2<input>>(pattern: p2): Chainable<OrP<input, [p, p2]>, omitted>;
    select<input, k extends string>(key: k): Chainable<SelectP<k, input, p>, 'and' | 'or' | 'select' | omitted>;
    /**
     * `P.select()` will inject this property into the handler function's arguments.
     *
     * [Read the documentation for `P.select` on GitHub](https://github.com/gvergnaud/ts-pattern#pselect-patterns)
     *
     * @example
     *  match<{ age: number }>(value)
     *   .with({ age: P.string.select() }, (age) => 'age: number')
     */
    select<input>(): Chainable<SelectP<symbols.anonymousSelectKey, input, p>, 'and' | 'or' | 'select' | omitted>;
  },
  omitted
> &
  p;

declare type Compute<a extends any> = a extends BuiltInObjects
  ? a
  : {
      [k in keyof a]: a[k];
    };

declare type Contains<a, b> = a extends any
  ? 'exclude' extends {
      [k in keyof a]-?: Equal<a[k], b> extends true ? 'exclude' : 'include';
    }[keyof a]
    ? true
    : false
  : never;

declare type CustomP<input, pattern, narrowedOrFn> = Matcher<input, pattern, 'custom', None, narrowedOrFn>;

declare type DeepExclude<a, b> = Exclude<DistributeMatchingUnions<a, b>, b>;

/**
 * Potential for optimization here:
 *
 * Since DeepExclude distributes the union of the input type, it can
 * generate very large union types on patterns touching several unions at once.
 * If we were sorting patterns from those which distribute the smallest
 * amount of union types to those which distribute the largest, we would eliminate
 * cheap cases more quickly and have less cases in the input type for patterns
 * that will be expensive to exclude.
 *
 * This pre supposes that we have a cheap way of telling if the number
 * of union types a pattern touches and a cheap way of sorting the tuple
 * of patterns.
 * - For the first part, we could reuse `FindMatchingUnions` and pick the `length`
 *   of the returned tuple.
 * - For the second part though I'm not aware a cheap way of sorting a tuple.
 */
declare type DeepExcludeAll<a, tupleList extends any[]> = [a] extends [never]
  ? never
  : tupleList extends [infer excluded, ...infer tail]
    ? DeepExcludeAll<DeepExclude<a, excluded>, tail>
    : a;

declare type Distribute<unions extends readonly any[]> = unions extends readonly [
  {
    cases: infer cases;
    path: infer path;
  },
  ...infer tail
]
  ? cases extends {
      subUnions: infer subUnions;
      value: infer value;
    }
    ? [[value, path], ...Distribute<Extract<subUnions, readonly any[]>>, ...Distribute<tail>]
    : never
  : [];

/**
 * DistributeMatchingUnions takes two arguments:
 * - a data structure of type `a` containing unions
 * - a pattern `p`, matching this data structure
 * and turns it into a union of all possible
 * combination of each unions contained in `a` that matches `p`.
 *
 * It does this in 3 main steps:
 *  - 1. Find all unions contained in the data structure, that matches `p`
 *    with `FindUnions<a, p>`. It returns a tree of [union, path] pairs.
 *  - 2. this tree is passed to the `Distribute` type level function,
 *    Which turns it into a union of list of `[singleValue, path]` pairs.
 *    Each list correspond to one of the possible combination of the unions
 *    found in `a`.
 *  - 3. build a data structure with the same shape as `a` for each combination
 *    and return the union of these data structures.
 *
 * @example
 * type t1 = DistributeMatchingUnions<['a' | 'b', 1 | 2], ['a', 1]>;
 * // => ['a', 1] | ['a', 2] | ['b', 1] | ['b', 2]
 *
 * type t2 = DistributeMatchingUnions<['a' | 'b', 1 | 2], ['a', unknown]>;
 * // => ['a', 1 | 2] | ['b', 1 | 2]
 */
declare type DistributeMatchingUnions<a, p> =
  IsAny<a> extends true ? any : BuildMany<a, Distribute<FindUnionsMany<a, p>>>;

declare type Equal<a, b> = (<T>() => T extends a ? 1 : 2) extends <T>() => T extends b ? 1 : 2 ? true : false;

declare type ExcludeIfExists<a, b> = [b] extends [never]
  ? never
  : unknown extends a
    ? never
    : All<[Extends<a, NonLiteralPrimitive>, Not<IsLiteral<a>>, IsLiteral<b>]> extends true
      ? never
      : DeepExclude<a, b>;

declare type Extends<a, b> = [a] extends [b] ? true : false;

declare type ExtractPlainObject<T> = T extends any ? (IsPlainObject<T> extends true ? T : never) : never;

declare type ExtractPreciseArrayValue<
  a,
  b,
  isReadonly extends boolean,
  startOutput extends any[] = [],
  endOutput extends any[] = []
> = a extends readonly (infer aItem)[]
  ? b extends readonly []
    ? MaybeAddReadonly<[...startOutput, ...endOutput], isReadonly>
    : b extends readonly [infer b1, ...infer bRest]
      ? a extends readonly [infer a1, ...infer aRest]
        ? ExtractPreciseValue<a1, b1> extends infer currentValue
          ? [currentValue] extends [never]
            ? never
            : ExtractPreciseArrayValue<aRest, bRest, isReadonly, [...startOutput, currentValue], endOutput>
          : never
        : ExtractPreciseValue<aItem, b1> extends infer currentValue
          ? [currentValue] extends [never]
            ? never
            : ExtractPreciseArrayValue<aItem[], bRest, isReadonly, [...startOutput, currentValue], endOutput>
          : never
      : b extends readonly [...infer bInit, infer b1]
        ? a extends readonly [...infer aInit, infer a1]
          ? ExtractPreciseValue<a1, b1> extends infer currentValue
            ? [currentValue] extends [never]
              ? never
              : ExtractPreciseArrayValue<aInit, bInit, isReadonly, startOutput, [...endOutput, currentValue]>
            : never
          : ExtractPreciseValue<aItem, b1> extends infer currentValue
            ? [currentValue] extends [never]
              ? never
              : ExtractPreciseArrayValue<aItem[], bInit, isReadonly, startOutput, [...endOutput, currentValue]>
            : never
        : ExtractPreciseValue<aItem, ValueOf<b>> extends infer currentValue
          ? [currentValue] extends [never]
            ? never
            : MaybeAddReadonly<[...startOutput, ...currentValue[], ...endOutput], isReadonly>
          : never
  : LeastUpperBound<a, b>;

declare type ExtractPreciseValue<a, b> =
  b extends Override<infer b1>
    ? b1
    : unknown extends b
      ? a
      : 0 extends 1 & b
        ? a
        : 0 extends 1 & a
          ? b
          : b extends readonly any[]
            ? ExtractPreciseArrayValue<a, b, IsReadonlyArray<a>>
            : b extends Map<infer bk, infer bv>
              ? a extends Map<infer ak, infer av>
                ? Map<ExtractPreciseValue<ak, bk>, ExtractPreciseValue<av, bv>>
                : LeastUpperBound<a, b>
              : b extends Set<infer bv>
                ? a extends Set<infer av>
                  ? Set<ExtractPreciseValue<av, bv>>
                  : LeastUpperBound<a, b>
                : IsPlainObject<b, BuiltInObjects | Error> extends true
                  ? a extends object
                    ? a extends b
                      ? a
                      : b extends a
                        ? Contains<b, never> extends true
                          ? never
                          : Contains<Omit<b, keyof a>, {}> extends true
                            ? never
                            : [Exclude<keyof a, keyof b>] extends [never]
                              ? b
                              : Compute<b & Omit<a, keyof b>>
                        : [keyof a & keyof b] extends [never]
                          ? never
                          : Compute<
                                {
                                  [k in keyof a as k extends keyof b ? never : k]: a[k];
                                } & {
                                  [k in keyof b]: k extends keyof a ? ExtractPreciseValue<a[k], b[k]> : b[k];
                                }
                              > extends infer result
                            ? Contains<Pick<result, keyof b & keyof result>, never> extends true
                              ? never
                              : result
                            : never
                    : LeastUpperBound<a, b>
                  : LeastUpperBound<a, b>;

declare type FindSelected<i, p> = Equal<p, Pattern_2<i>> extends true ? i : Selections<i, p>;

declare type FindSelectionUnion<i, p, path extends any[] = []> = 0 extends 1 & i
  ? never
  : 0 extends 1 & p
    ? never
    : p extends Primitives
      ? never
      : p extends Matcher<any, infer pattern, infer matcherType, infer sel>
        ? {
            and: ReduceFindSelectionUnion<i, Extract<pattern, readonly any[]>>;
            array: i extends readonly (infer iItem)[] ? MapList<FindSelectionUnion<iItem, pattern>> : never;
            custom: never;
            default: sel extends Some<infer k>
              ? {
                  [kk in k]: [i, path];
                }
              : never;
            map: never;
            not: never;
            optional: MapOptional<FindSelectionUnion<i, pattern>>;
            or: MapOptional<ReduceFindSelectionUnion<i, Extract<pattern, readonly any[]>>>;
            select: sel extends Some<infer k>
              ?
                  | {
                      [kk in k]: [i, path];
                    }
                  | FindSelectionUnion<i, pattern, path>
              : never;
            set: never;
          }[matcherType]
        : p extends readonly any[]
          ? FindSelectionUnionInArray<i, p>
          : p extends {}
            ? i extends {}
              ? {
                  [k in keyof p]: k extends keyof i ? FindSelectionUnion<i[k], p[k], [...path, k]> : never;
                }[keyof p]
              : never
            : never;

declare type FindSelectionUnionInArray<
  i,
  p,
  path extends any[] = [],
  output = never
> = i extends readonly (infer iItem)[]
  ? p extends readonly []
    ? output
    : p extends readonly [infer p1, ...infer pRest]
      ? i extends readonly [infer i1, ...infer iRest]
        ? FindSelectionUnionInArray<
            iRest,
            pRest,
            [...path, p['length']],
            FindSelectionUnion<i1, p1, [...path, p['length']]> | output
          >
        : FindSelectionUnionInArray<
            iItem[],
            pRest,
            [...path, p['length']],
            FindSelectionUnion<iItem, p1, [...path, p['length']]> | output
          >
      : p extends readonly [...infer pInit, infer p1]
        ? i extends readonly [...infer iInit, infer i1]
          ? FindSelectionUnionInArray<
              iInit,
              pInit,
              [...path, p['length']],
              FindSelectionUnion<i1, p1, [...path, p['length']]> | output
            >
          : FindSelectionUnionInArray<
              iItem[],
              pInit,
              [...path, p['length']],
              FindSelectionUnion<iItem, p1, [...path, p['length']]> | output
            >
        : p extends readonly [...(readonly (AnyMatcher & infer pRest)[])]
          ? FindSelectionUnion<i, pRest, [...path, p['length']]> | output
          : FindSelectionUnion<iItem, ValueOf<p>, [...path, Extract<p, readonly any[]>['length']]> | output
  : output;

/**
 * The reason we don't look further down the tree with lists,
 * Set and Maps is that they can be heterogeneous,
 * so matching on a A[] for a in input of (A|B)[]
 * doesn't rule anything out. You can still have
 * a (A|B)[] afterward. The same logic goes for Set and Maps.
 *
 * Kinds are types of types.
 *
 * kind UnionConfig = {
 *  cases: Union<{
 *    value: b,
 *    subUnions: UnionConfig[]
 *  }>,
 *  path: string[]
 * }
 * FindUnions :: Pattern a p => a -> p -> UnionConfig[]
 */
declare type FindUnions<a, p, path extends PropertyKey[] = []> = unknown extends p
  ? []
  : IsAny<p> extends true
    ? []
    : Length<path> extends 5
      ? []
      : IsUnion<a> extends true
        ? [
            {
              cases: a extends any
                ? {
                    subUnions: FindUnionsMany<a, p, path>;
                    value: a;
                  }
                : never;
              path: path;
            }
          ]
        : [a, p] extends [readonly any[], readonly any[]]
          ? [a, p] extends [
              readonly [infer a1, infer a2, infer a3, infer a4, infer a5],
              readonly [infer p1, infer p2, infer p3, infer p4, infer p5]
            ]
            ? [
                ...FindUnions<a1, p1, [...path, 0]>,
                ...FindUnions<a2, p2, [...path, 1]>,
                ...FindUnions<a3, p3, [...path, 2]>,
                ...FindUnions<a4, p4, [...path, 3]>,
                ...FindUnions<a5, p5, [...path, 4]>
              ]
            : [a, p] extends [
                  readonly [infer a1, infer a2, infer a3, infer a4],
                  readonly [infer p1, infer p2, infer p3, infer p4]
                ]
              ? [
                  ...FindUnions<a1, p1, [...path, 0]>,
                  ...FindUnions<a2, p2, [...path, 1]>,
                  ...FindUnions<a3, p3, [...path, 2]>,
                  ...FindUnions<a4, p4, [...path, 3]>
                ]
              : [a, p] extends [readonly [infer a1, infer a2, infer a3], readonly [infer p1, infer p2, infer p3]]
                ? [
                    ...FindUnions<a1, p1, [...path, 0]>,
                    ...FindUnions<a2, p2, [...path, 1]>,
                    ...FindUnions<a3, p3, [...path, 2]>
                  ]
                : [a, p] extends [readonly [infer a1, infer a2], readonly [infer p1, infer p2]]
                  ? [...FindUnions<a1, p1, [...path, 0]>, ...FindUnions<a2, p2, [...path, 1]>]
                  : [a, p] extends [readonly [infer a1], readonly [infer p1]]
                    ? FindUnions<a1, p1, [...path, 0]>
                    : p extends readonly [...any, any] | readonly [] | readonly [any, ...any]
                      ? IsStrictArray<Extract<a, readonly any[]>> extends false
                        ? []
                        : [
                            MaybeAddReadonly<
                              | (a extends readonly [...any, any] | readonly [any, ...any] ? never : [])
                              | (p extends readonly [...any, any]
                                  ? [...Extract<a, readonly any[]>, ValueOf<a>]
                                  : [ValueOf<a>, ...Extract<a, readonly any[]>]),
                              IsReadonlyArray<a>
                            > extends infer aUnion
                              ? {
                                  cases: aUnion extends any
                                    ? {
                                        subUnions: [];
                                        value: aUnion;
                                      }
                                    : never;
                                  path: path;
                                }
                              : never
                          ]
                      : []
          : a extends Set<any>
            ? []
            : a extends Map<any, any>
              ? []
              : [IsPlainObject<a>, IsPlainObject<p>] extends [true, true]
                ? Flatten<
                    Values<{
                      [k in keyof a & keyof p]: FindUnions<a[k], p[k], [...path, k]>;
                    }>
                  >
                : [];

declare type FindUnionsMany<a, p, path extends PropertyKey[] = []> = UnionToTuple<
  (p extends any ? (IsMatching<a, p> extends true ? FindUnions<a, p, path> : []) : never) extends readonly (infer T)[]
    ? T
    : never
>;

declare type Flatten<xs extends readonly any[], output extends any[] = []> = xs extends readonly [
  infer head,
  ...infer tail
]
  ? Flatten<tail, [...output, ...Extract<head, readonly any[]>]>
  : output;

declare interface Fn {
  input: unknown;
  output: unknown;
}

declare type GetKey<O, K> = O extends any ? (K extends keyof O ? O[K] : never) : never;

declare type GuardExcludeP<input, narrowed, excluded> = Matcher<input, narrowed, 'default', None, excluded>;

declare type GuardP<input, narrowed> = Matcher<input, narrowed>;

/**
 * GuardValue returns the value guarded by a type guard function.
 */
declare type GuardValue<fn> = fn extends (value: any) => value is infer b
  ? b
  : fn extends (value: infer a) => unknown
    ? a
    : never;

/**
 * `P.infer<typeof somePattern>` will return the type of the value
 * matched by this pattern.
 *
 * [Read the documentation for `P.infer` on GitHub](https://github.com/gvergnaud/ts-pattern#pinfer)
 *
 * @example
 * const userPattern = { name: P.string }
 * type User = P.infer<typeof userPattern>
 */
declare type infer<pattern extends Pattern_2<any>> = InvertPattern<pattern, unknown>;

/**
 * `P.instanceOf(SomeClass)` is a pattern matching instances of a given class.
 *
 * [Read the documentation for `P.instanceOf` on GitHub](https://github.com/gvergnaud/ts-pattern#pinstanceof-patterns)
 *
 *  @example
 *   .with(P.instanceOf(SomeClass), () => 'will match on SomeClass instances')
 */
declare function instanceOf<T extends AnyConstructor>(classConstructor: T): Chainable<GuardP<unknown, InstanceType<T>>>;

/**
 * `P.intersection(...patterns)` returns a pattern which matches
 * only if **every** patterns provided in parameter match the input.
 *
 * [Read the documentation for `P.intersection` on GitHub](https://github.com/gvergnaud/ts-pattern#pintersection-patterns)
 *
 * @example
 *  match(value)
 *   .with(
 *     {
 *       user: P.intersection(
 *         { firstname: P.string },
 *         { lastname: P.string },
 *         { age: P.when(age => age > 21) }
 *       )
 *     },
 *     ({ user }) => 'will match { firstname: string, lastname: string, age: number } if age > 21'
 *   )
 */
declare function intersection<input, const patterns extends readonly [Pattern_2<input>, ...Pattern_2<input>[]]>(
  ...patterns: patterns
): Chainable<AndP<input, patterns>>;

declare type InvertArrayPattern<
  p,
  i,
  startOutput extends any[] = [],
  endOutput extends any[] = []
> = i extends readonly (infer ii)[]
  ? p extends readonly []
    ? [...startOutput, ...endOutput]
    : p extends readonly [infer p1, ...infer pRest]
      ? i extends readonly [infer i1, ...infer iRest]
        ? InvertArrayPattern<pRest, iRest, [...startOutput, InvertPatternInternal<p1, i1>], endOutput>
        : InvertArrayPattern<pRest, ii[], [...startOutput, InvertPatternInternal<p1, ii>], endOutput>
      : p extends readonly [...infer pInit, infer p1]
        ? i extends readonly [...infer iInit, infer i1]
          ? InvertArrayPattern<pInit, iInit, startOutput, [...endOutput, InvertPatternInternal<p1, i1>]>
          : InvertArrayPattern<pInit, ii[], startOutput, [...endOutput, InvertPatternInternal<p1, ii>]>
        : p extends readonly [...(readonly (AnyMatcher & infer pRest)[])]
          ? [...startOutput, ...Extract<InvertPatternInternal<pRest, i>, readonly any[]>, ...endOutput]
          : [...startOutput, ...InvertPatternInternal<ValueOf<p>, ii>[], ...endOutput]
  : never;

declare type InvertArrayPatternForExclude<
  p,
  i,
  empty,
  isReadonly extends boolean,
  startOutput extends any[] = [],
  endOutput extends any[] = []
> = i extends readonly (infer ii)[]
  ? p extends readonly []
    ? MaybeAddReadonly<[...startOutput, ...endOutput], isReadonly>
    : p extends readonly [infer p1, ...infer pRest]
      ? i extends readonly [infer i1, ...infer iRest]
        ? InvertArrayPatternForExclude<
            pRest,
            iRest,
            empty,
            isReadonly,
            [...startOutput, InvertPatternForExcludeInternal<p1, i1, empty>],
            endOutput
          >
        : InvertArrayPatternForExclude<
            pRest,
            ii[],
            empty,
            isReadonly,
            [...startOutput, InvertPatternForExcludeInternal<p1, ii, empty>],
            endOutput
          >
      : p extends readonly [...infer pInit, infer p1]
        ? i extends readonly [...infer iInit, infer i1]
          ? InvertArrayPatternForExclude<
              pInit,
              iInit,
              empty,
              isReadonly,
              startOutput,
              [...endOutput, InvertPatternForExcludeInternal<p1, i1, empty>]
            >
          : InvertArrayPatternForExclude<
              pInit,
              ii[],
              empty,
              isReadonly,
              startOutput,
              [...endOutput, InvertPatternForExcludeInternal<p1, ii, empty>]
            >
        : p extends readonly [...(readonly (AnyMatcher & infer pRest)[])]
          ? MaybeAddReadonly<
              [
                ...startOutput,
                ...Extract<InvertPatternForExcludeInternal<pRest, i, empty>, readonly any[]>,
                ...endOutput
              ],
              isReadonly
            >
          : MaybeAddReadonly<
              [...startOutput, ...InvertPatternForExcludeInternal<ValueOf<p>, ii, empty>[], ...endOutput],
              isReadonly
            >
  : empty;

/**
 * ### InvertPatternInternal
 * Since patterns have special wildcard values, we need a way
 * to transform a pattern into the type of value it represents
 */
declare type InvertPattern<p, input> =
  Equal<Pattern_2<input>, p> extends true ? never : InvertPatternInternal<p, input>;

/**
 * ### InvertPatternForExclude
 */
declare type InvertPatternForExclude<p, i> =
  Equal<Pattern_2<i>, p> extends true ? never : InvertPatternForExcludeInternal<p, i>;

declare type InvertPatternForExcludeInternal<p, i, empty = never> = unknown extends p
  ? i
  : [p] extends [Primitives]
    ? IsLiteral<p> extends true
      ? p
      : IsLiteral<i> extends true
        ? p
        : empty
    : p extends Matcher<infer matchableInput, infer subpattern, infer matcherType, any, infer excluded>
      ? {
          and: ReduceIntersectionForExclude<Extract<subpattern, readonly any[]>, i>;
          array: i extends readonly (infer ii)[] ? InvertPatternForExcludeInternal<subpattern, ii, empty>[] : empty;
          custom: excluded extends infer narrowedOrFn extends Fn ? Call<narrowedOrFn, i> : excluded;
          default: excluded;
          map: subpattern extends [infer pk, infer pv]
            ? i extends Map<infer ik, infer iv>
              ? Map<InvertPatternForExcludeInternal<pk, ik, empty>, InvertPatternForExcludeInternal<pv, iv, empty>>
              : empty
            : empty;
          not: ExcludeIfExists<
            unknown extends matchableInput ? i : matchableInput,
            InvertPatternForExcludeInternal<subpattern, i>
          >;
          optional: InvertPatternForExcludeInternal<subpattern, i, empty> | undefined;
          or: ReduceUnionForExclude<Extract<subpattern, readonly any[]>, i>;
          select: InvertPatternForExcludeInternal<subpattern, i, empty>;
          set: i extends Set<infer iv> ? Set<InvertPatternForExcludeInternal<subpattern, iv, empty>> : empty;
        }[matcherType]
      : p extends readonly any[]
        ? Extract<i, readonly any[]> extends infer arrayInput
          ? InvertArrayPatternForExclude<p, arrayInput, empty, IsReadonlyArray<arrayInput>>
          : never
        : IsPlainObject<p> extends true
          ? i extends object
            ? [keyof i & keyof p] extends [never]
              ? empty
              : OptionalKeys<p> extends infer optKeys
                ? [optKeys] extends [never]
                  ? {
                      readonly [k in keyof p]: k extends keyof i
                        ? InvertPatternForExcludeInternal<p[k], i[k], empty>
                        : InvertPatternInternal<p[k], unknown>;
                    }
                  : Compute<
                      {
                        readonly [k in Exclude<keyof p, optKeys>]: k extends keyof i
                          ? InvertPatternForExcludeInternal<p[k], i[k], empty>
                          : InvertPatternInternal<p[k], unknown>;
                      } & {
                        readonly [k in Extract<optKeys, keyof p>]?: k extends keyof i
                          ? InvertPatternForExcludeInternal<p[k], i[k], empty>
                          : InvertPatternInternal<p[k], unknown>;
                      }
                    >
                : empty
            : empty
          : empty;

declare type InvertPatternInternal<p, input> = 0 extends 1 & p
  ? never
  : p extends Matcher<infer _input, infer subpattern, infer matcherType, any, infer narrowedOrFn>
    ? {
        and: ReduceIntersection<Extract<subpattern, readonly any[]>, input>;
        array: InvertPatternInternal<subpattern, ReadonlyArrayValue<input>>[];
        custom: Override<narrowedOrFn extends Fn ? Call<narrowedOrFn, input> : narrowedOrFn>;
        default: [subpattern] extends [never] ? input : subpattern;
        map: subpattern extends [infer pk, infer pv]
          ? Map<
              InvertPatternInternal<pk, MapKey<Extract<input, Map<any, any>>>>,
              InvertPatternInternal<pv, MapValue<Extract<input, Map<any, any>>>>
            >
          : never;
        not: DeepExclude<input, InvertPatternInternal<subpattern, input>>;
        optional: InvertPatternInternal<subpattern, Exclude<input, undefined>> | undefined;
        or: ReduceUnion<Extract<subpattern, readonly any[]>, input>;
        select: InvertPatternInternal<subpattern, input>;
        set: Set<InvertPatternInternal<subpattern, SetValue<Extract<input, Set<any>>>>>;
      }[matcherType]
    : p extends Primitives
      ? p
      : p extends readonly any[]
        ? InvertArrayPattern<p, WithDefault<Extract<input, readonly any[]>, unknown[]>>
        : IsPlainObject<p> extends true
          ? OptionalKeys<p> extends infer optKeys
            ? [optKeys] extends [never]
              ? {
                  [k in Exclude<keyof p, optKeys>]: InvertPatternInternal<
                    p[k],
                    WithDefault<GetKey<ExtractPlainObject<input>, k>, unknown>
                  >;
                }
              : Compute<
                  {
                    [k in Exclude<keyof p, optKeys>]: InvertPatternInternal<
                      p[k],
                      WithDefault<GetKey<ExtractPlainObject<input>, k>, unknown>
                    >;
                  } & {
                    [k in Extract<optKeys, keyof p>]?: InvertPatternInternal<
                      p[k],
                      WithDefault<GetKey<ExtractPlainObject<input>, k>, unknown>
                    >;
                  }
                >
            : never
          : p;

declare type IsAny<a> = 0 extends 1 & a ? true : false;

declare type IsLiteral<a> = [a] extends [null | undefined]
  ? true
  : [a] extends [string]
    ? string extends a
      ? false
      : true
    : [a] extends [number]
      ? number extends a
        ? false
        : true
      : [a] extends [boolean]
        ? boolean extends a
          ? false
          : true
        : [a] extends [symbol]
          ? symbol extends a
            ? false
            : true
          : [a] extends [bigint]
            ? bigint extends a
              ? false
              : true
            : false;

declare type IsMatching<a, b> = true extends IsUnion<a> | IsUnion<b>
  ? true extends (b extends any ? (a extends any ? IsMatching<a, b> : never) : never)
    ? true
    : false
  : unknown extends b
    ? true
    : {} extends b
      ? true
      : b extends Primitives
        ? a extends b
          ? true
          : b extends a
            ? true
            : false
        : Equal<a, b> extends true
          ? true
          : b extends readonly any[]
            ? a extends readonly any[]
              ? All<[IsLiteral<Length<a>>, IsLiteral<Length<b>>]> extends true
                ? Equal<Length<a>, Length<b>> extends false
                  ? false
                  : IsMatchingTuple<a, b>
                : IsMatchingArray<a, b>
              : false
            : IsPlainObject<b> extends true
              ? true extends (
                  a extends any
                    ? [keyof a & keyof b] extends [never]
                      ? false
                      : {
                            [k in keyof a & keyof b]: IsMatching<a[k], b[k]>;
                          }[keyof a & keyof b] extends true
                        ? true
                        : false
                    : never
                )
                ? true
                : false
              : b extends a
                ? true
                : false;

/**
 * `isMatching` takes pattern and returns a **type guard** function, cheching if a value matches this pattern.
 *
 * [Read  documentation for `isMatching` on GitHub](https://github.com/gvergnaud/ts-pattern#ismatching)
 *
 * @example
 *  const hasName = isMatching({ name: P.string })
 *
 *  declare let input: unknown
 *
 *  if (hasName(input)) {
 *    // `input` inferred as { name: string }
 *    return input.name
 *  }
 */
export declare function isMatching<const p extends Pattern_2<unknown>>(
  pattern: p
): (value: unknown) => value is P.infer<p>;

/**
 * `isMatching` takes pattern and a value and checks if the value matches this pattern.
 *
 * [Read  documentation for `isMatching` on GitHub](https://github.com/gvergnaud/ts-pattern#ismatching)
 *
 * @example
 *  declare let input: unknown
 *
 *  if (isMatching({ name: P.string }, input)) {
 *    // `input` inferred as { name: string }
 *    return input.name
 *  }
 */
export declare function isMatching<const p extends Pattern_2<unknown>>(pattern: p, value: unknown): value is P.infer<p>;

declare type IsMatchingArray<a extends readonly any[], b extends readonly any[]> = b extends readonly []
  ? true
  : b extends readonly [infer b1, ...infer bRest]
    ? a extends readonly [infer a1, ...infer aRest]
      ? IsMatching<a1, b1> extends true
        ? IsMatchingArray<aRest, bRest>
        : false
      : a extends readonly []
        ? false
        : IsMatching<ValueOf<a>, b1> extends true
          ? IsMatchingArray<a, bRest>
          : false
    : b extends readonly [...infer bInit, infer b1]
      ? a extends readonly [...infer aInit, infer a1]
        ? IsMatching<a1, b1> extends true
          ? IsMatchingArray<aInit, bInit>
          : false
        : a extends readonly []
          ? false
          : IsMatching<ValueOf<a>, b1> extends true
            ? IsMatchingArray<a, bInit>
            : false
      : IsMatching<ValueOf<a>, ValueOf<b>>;

declare type IsMatchingTuple<a extends readonly any[], b extends readonly any[]> = [a, b] extends [
  readonly [],
  readonly []
]
  ? true
  : [a, b] extends [readonly [infer a1, ...infer aRest], readonly [infer b1, ...infer bRest]]
    ? IsMatching<a1, b1> extends true
      ? IsMatchingTuple<aRest, bRest>
      : false
    : false;

declare type IsNever<T> = [T] extends [never] ? true : false;

declare type IsPlainObject<o, excludeUnion = BuiltInObjects> = o extends object
  ? o extends excludeUnion | string
    ? false
    : true
  : false;

declare type IsReadonlyArray<a> = a extends readonly any[] ? (a extends any[] ? false : true) : false;

declare type IsStrictArray<a extends readonly any[]> = Not<IsTuple<a>>;

declare type IsTuple<a> = a extends readonly [...any, any] | readonly [] | readonly [any, ...any] ? true : false;

declare type IsUnion<a> = [a] extends [UnionToIntersection<a>] ? false : true;

declare const isVariadic: unique symbol;

declare type isVariadic = typeof isVariadic;

declare type Iterator_2<n extends number, it extends any[] = []> = it['length'] extends n
  ? it
  : Iterator_2<n, [any, ...it]>;

declare type KnownPattern<a> = KnownPatternInternal<a>;

declare type KnownPatternInternal<
  a,
  objs = Exclude<a, Map<any, any> | Primitives | readonly any[] | Set<any>>,
  arrays = Extract<a, readonly any[]>,
  primitives = Extract<a, Primitives>
> =
  | ([arrays] extends [never] ? never : ArrayPattern<arrays>)
  | ([objs] extends [never] ? never : ObjectPattern<Readonly<MergeUnion<objs>>>)
  | PatternMatcher<a>
  | primitives;

/**
 * ### LeastUpperBound
 * An interesting one. A type taking two imbricated sets and returning the
 * smallest one.
 * We need that because sometimes the pattern's inferred type holds more
 * information than the value on which we are matching (if the value is any
 * or unknown for instance).
 */
declare type LeastUpperBound<a, b> = b extends a ? b : a extends b ? a : never;

declare type Length<it extends readonly any[]> = it['length'];

declare type MakeTuples<ps extends readonly any[], value> = {
  -readonly [index in keyof ps]: InvertPatternForExclude<ps[index], value>;
};

/**
 * `P.map(keyPattern, valuePattern)` takes a subpattern to match against the
 * key, a subpattern to match against the value and returns a pattern that
 * matches on maps where all elements inside the map match those two
 * subpatterns.
 *
 * [Read `P.map` documentation on GitHub](https://github.com/gvergnaud/ts-pattern#pmap-patterns)
 *
 * @example
 *  match(value)
 *   .with({ users: P.map(P.map(P.string, P.number)) }, (map) => `map's type is Map<string, number>`)
 */
declare function map<input>(): Chainable<MapP<input, unknown, unknown>>;

declare function map<
  input,
  const pkey extends Pattern_2<WithDefault_2<UnwrapMapKey<input>, unknown>>,
  const pvalue extends Pattern_2<WithDefault_2<UnwrapMapValue<input>, unknown>>
>(patternKey: pkey, patternValue: pvalue): Chainable<MapP<input, pkey, pvalue>>;

declare type MapKey<T> = T extends Map<infer K, any> ? K : never;

declare type MapList<selections> = {
  [k in keyof selections]: selections[k] extends [infer v, infer subpath] ? [v[], subpath] : never;
};

declare type MapOptional<selections> = {
  [k in keyof selections]: selections[k] extends [infer v, infer subpath] ? [undefined | v, subpath] : never;
};

declare type MapP<input, pkey, pvalue> = Matcher<input, [pkey, pvalue], 'map'>;

declare type MapValue<T> = T extends Map<any, infer V> ? V : never;

/**
 * #### Match
 * An interface to create a pattern matching clause.
 */
declare type Match<i, o, handledCases extends any[] = [], inferredOutput = never> = {
  /**
   * `.exhaustive()` checks that all cases are handled, and returns the result value.
   *
   * If you get a `NonExhaustiveError`, it means that you aren't handling
   * all cases. You should probably add another `.with(...)` clause
   * to match the missing case and prevent runtime errors.
   *
   * [Read the documentation for `.exhaustive()` on GitHub](https://github.com/gvergnaud/ts-pattern#exhaustive)
   *
   * */
  exhaustive: DeepExcludeAll<i, handledCases> extends infer remainingCases
    ? [remainingCases] extends [never]
      ? () => PickReturnValue<o, inferredOutput>
      : NonExhaustiveError_2<remainingCases>
    : never;
  /**
   * `.otherwise()` takes a **default handler function** that will be
   * called if no previous pattern matched your input.
   *
   * Equivalent to `.with(P._, () => x).exhaustive()`
   *
   * [Read the documentation for `.otherwise()` on GitHub](https://github.com/gvergnaud/ts-pattern#otherwise)
   *
   **/
  otherwise<c>(handler: (value: i) => PickReturnValue<o, c>): PickReturnValue<o, Union<inferredOutput, c>>;
  /**
   * `.returnType<T>()` Lets you specify the return type for all of your branches.
   *
   * [Read the documentation for `.returnType()` on GitHub](https://github.com/gvergnaud/ts-pattern#returnType)
   * */
  returnType: [inferredOutput] extends [never]
    ? <output>() => Match<i, output, handledCases>
    : TSPatternError<'calling `.returnType<T>()` is only allowed directly after `match(...)`.'>;
  /**
   * `.run()` return the resulting value.
   *
   * ⚠️ calling this function is unsafe, and may throw if no pattern matches your input.
   * */
  run(): PickReturnValue<o, inferredOutput>;
  /**
   * `.when(predicate, handler)` Registers a predicate function and an handler function.
   * If the predicate returns true, the handler function will be called.
   *
   * [Read the documentation for `.when()` on GitHub](https://github.com/gvergnaud/ts-pattern#when)
   **/
  when<pred extends (value: i) => unknown, c, value extends GuardValue<pred>>(
    predicate: pred,
    handler: (value: value) => PickReturnValue<o, c>
  ): pred extends (value: any) => value is infer narrowed
    ? Match<Exclude<i, narrowed>, o, [...handledCases, narrowed], Union<inferredOutput, c>>
    : Match<i, o, handledCases, Union<inferredOutput, c>>;
  with<
    const p1 extends Pattern_2<i>,
    const p2 extends Pattern_2<i>,
    c,
    p extends p1 | p2,
    value extends p extends any ? MatchedValue<i, InvertPattern<p, i>> : never
  >(
    p1: p1,
    p2: p2,
    handler: (value: value) => PickReturnValue<o, c>
  ): [InvertPatternForExclude<p1, value>, InvertPatternForExclude<p2, value>] extends [infer excluded1, infer excluded2]
    ? Match<Exclude<i, excluded1 | excluded2>, o, [...handledCases, excluded1, excluded2], Union<inferredOutput, c>>
    : never;
  with<
    const p1 extends Pattern_2<i>,
    const p2 extends Pattern_2<i>,
    const p3 extends Pattern_2<i>,
    const ps extends readonly Pattern_2<i>[],
    c,
    p extends p1 | p2 | p3 | ps[number],
    value extends MatchedValue<i, InvertPattern<p, i>>
  >(
    ...args: [p1: p1, p2: p2, p3: p3, ...patterns: ps, handler: (value: value) => PickReturnValue<o, c>]
  ): [
    InvertPatternForExclude<p1, value>,
    InvertPatternForExclude<p2, value>,
    InvertPatternForExclude<p3, value>,
    MakeTuples<ps, value>
  ] extends [infer excluded1, infer excluded2, infer excluded3, infer excludedRest]
    ? Match<
        Exclude<i, excluded1 | excluded2 | excluded3 | Extract<excludedRest, any[]>[number]>,
        o,
        [...handledCases, excluded1, excluded2, excluded3, ...Extract<excludedRest, any[]>],
        Union<inferredOutput, c>
      >
    : never;
  with<
    const pat extends Pattern_2<i>,
    pred extends (value: MatchedValue<i, InvertPattern<pat, i>>) => unknown,
    c,
    value extends GuardValue<pred>
  >(
    pattern: pat,
    predicate: pred,
    handler: (selections: FindSelected<value, pat>, value: value) => PickReturnValue<o, c>
  ): pred extends (value: any) => value is infer narrowed
    ? Match<Exclude<i, narrowed>, o, [...handledCases, narrowed], Union<inferredOutput, c>>
    : Match<i, o, handledCases, Union<inferredOutput, c>>;
  /**
   * `.with(pattern, handler)` Registers a pattern and an handler function that
   * will be called if the pattern matches the input value.
   *
   * [Read the documentation for `.with()` on GitHub](https://github.com/gvergnaud/ts-pattern#with)
   **/
  with<const p extends Pattern_2<i>, c, value extends MatchedValue<i, InvertPattern<p, i>>>(
    pattern: IsNever<p> extends true ? Pattern_2<i> : p,
    handler: (selections: FindSelected<value, p>, value: value) => PickReturnValue<o, c>
  ): InvertPatternForExclude<p, value> extends infer excluded
    ? Match<Exclude<i, excluded>, o, [...handledCases, excluded], Union<inferredOutput, c>>
    : never;
};

/**
 * `match` creates a **pattern matching expression**.
 *  * Use `.with(pattern, handler)` to pattern match on the input.
 *  * Use `.exhaustive()` or `.otherwise(() => defaultValue)` to end the expression and get the result.
 *
 * [Read the documentation for `match` on GitHub](https://github.com/gvergnaud/ts-pattern#match)
 *
 * @example
 *  declare let input: "A" | "B";
 *
 *  return match(input)
 *    .with("A", () => "It's an A!")
 *    .with("B", () => "It's a B!")
 *    .exhaustive();
 *
 */
export declare function match<const input, output = symbols.unset>(value: input): Match<input, output>;

declare type MatchedValue<a, invpattern> = WithDefault<ExtractPreciseValue<a, invpattern>, a>;

/**
 * A `Matcher` is an object implementing the match
 * protocol. It must define a `symbols.matcher` property
 * which returns an object with a `match()` method, taking
 * the input value and returning whether the pattern matches
 * or not, along with optional selections.
 */
declare interface Matcher<
  input,
  narrowed,
  matcherType extends MatcherType = 'default',
  selections extends SelectionType = None,
  excluded = narrowed
> {
  [matcher](): MatcherProtocol<input, narrowed, matcherType, selections, excluded>;
  [symbols.isVariadic]?: boolean;
}

/**
 * Symbols used internally within ts-pattern to construct and discriminate
 * Guard, Not, and Select, and AnonymousSelect patterns
 *
 * Symbols have the advantage of not appearing in auto-complete suggestions in
 * user defined patterns, and eliminate the risk of property
 * overlap between ts-pattern internals and user defined patterns.
 *
 * These symbols have to be visible to tsc for type inference to work, but
 * users should not import them
 * @module
 * @private
 * @internal
 */
declare const matcher: unique symbol;

declare type matcher = typeof matcher;

declare type MatcherProtocol<
  input,
  narrowed,
  matcherType extends MatcherType,
  selections extends SelectionType,
  excluded
> = {
  getSelectionKeys?: () => string[];
  match: <I>(value: I | input) => MatchResult;
  matcherType?: matcherType;
};

declare type MatcherType =
  | 'and'
  | 'array'
  | 'custom'
  | 'default'
  | 'map'
  | 'not'
  | 'optional'
  | 'or'
  | 'select'
  | 'set';

declare type MatchResult = {
  matched: boolean;
  selections?: Record<string, any>;
};

declare type MaybeAddReadonly<a, shouldAdd extends boolean> = shouldAdd extends true ? Readonly<a> : a;

declare type MergeGuards<input, guard1, guard2> = [guard1, guard2] extends [
  GuardExcludeP<any, infer narrowed1, infer excluded1>,
  GuardExcludeP<any, infer narrowed2, infer excluded2>
]
  ? GuardExcludeP<input, narrowed1 & narrowed2, excluded1 & excluded2>
  : never;

declare type MergeUnion<a> =
  | {
      [k in AllKeys<a>]: a extends any ? (k extends keyof a ? a[k] : never) : never;
    }
  | never;

declare type MixedNamedAndAnonymousSelectError<
  a = 'Mixing named selections (`select("name")`) and anonymous selections (`select()`) is forbiden. Please, only use named selections.'
> = {
  __error: never;
} & a;

/**
 * `P.narrow<Input, Pattern>` will narrow the input type to only keep
 * the set of values that are compatible with the provided pattern type.
 *
 * [Read the documentation for `P.narrow` on GitHub](https://github.com/gvergnaud/ts-pattern#pnarrow)
 *
 * @example
 * type Input = ['a' | 'b' | 'c', 'a' | 'b' | 'c']
 * const Pattern = ['a', P.union('a', 'b')] as const
 *
 * type Narrowed = P.narrow<Input, typeof Pattern>
 * //     ^? ['a', 'a' | 'b']
 */
declare type narrow<input, pattern extends Pattern_2<any>> = ExtractPreciseValue<input, InvertPattern<pattern, input>>;

declare type None = {
  type: 'none';
};

/**
 * Error when the given input value does not match any included pattern
 * and .exhaustive() was specified
 */
export declare class NonExhaustiveError extends Error {
  input: unknown;
  constructor(input: unknown);
}

declare interface NonExhaustiveError_2<i> {
  __nonExhaustive: never;
}

declare type NonLiteralPrimitive = Exclude<Primitives, null | undefined>;

/**
 * `P.nonNullable` is a wildcard pattern, matching everything except **null** or **undefined**.
 *
 * [Read the documentation for `P.nonNullable` on GitHub](https://github.com/gvergnaud/ts-pattern#nonNullable-wildcard)
 *
 * @example
 *   .with(P.nonNullable, (x) => `${x} isn't null nor undefined`)
 */
declare const nonNullable: NonNullablePattern;

declare type NonNullablePattern = Chainable<GuardP<unknown, {}>, never>;

declare type Not<a extends boolean> = a extends true ? false : true;

/**
 * `P.not(pattern)` returns a pattern which matches if the sub pattern
 * doesn't match.
 *
 * [Read the documentation for `P.not` on GitHub](https://github.com/gvergnaud/ts-pattern#pnot-patterns)
 *
 * @example
 *  match<{ a: string | number }>(value)
 *   .with({ a: P.not(P.string) }, (x) => 'will match { a: number }'
 *   )
 */
declare function not<input, const pattern extends Pattern_2<input> | UnknownPattern>(
  pattern: pattern
): Chainable<NotP<input, pattern>>;

declare type NotP<input, p> = Matcher<input, p, 'not'>;

/**
 * `P.nullish` is a wildcard pattern, matching **null** or **undefined**.
 *
 * [Read the documentation for `P.nullish` on GitHub](https://github.com/gvergnaud/ts-pattern#nullish-wildcard)
 *
 * @example
 *   .with(P.nullish, (x) => `${x} is null or undefined`)
 */
declare const nullish: NullishPattern;

declare type NullishPattern = Chainable<GuardP<unknown, null | undefined>, never>;

/**
 * `P.number` is a wildcard pattern, matching any **number**.
 *
 * [Read the documentation for `P.number` on GitHub](https://github.com/gvergnaud/ts-pattern#pnumber-wildcard)
 *
 * @example
 *  match(value)
 *   .with(P.number, () => 'will match on numbers')
 */
declare const number: NumberPattern;

declare type NumberChainable<p, omitted extends string = never> = Chainable<p, omitted> &
  Omit<
    {
      /**
       * `P.number.between(min, max)` matches **number** between `min` and `max`,
       * equal to min or equal to max.
       *
       * [Read the documentation for `P.number.between` on GitHub](https://github.com/gvergnaud/ts-pattern#pnumberbetween)
       *
       * @example
       *  match(value)
       *   .with(P.number.between(0, 10), () => '0 <= numbers <= 10')
       */
      between<input, const min extends number, const max extends number>(
        min: min,
        max: max
      ): NumberChainable<MergeGuards<input, p, GuardExcludeP<unknown, number, never>>, omitted>;
      /**
       * `P.number.finite` matches **finite numbers**.
       *
       * [Read the documentation for `P.number.finite` on GitHub](https://github.com/gvergnaud/ts-pattern#pnumberfinite)
       *
       * @example
       *  match(value)
       *   .with(P.number.finite, () => 'not Infinity')
       */
      finite<input>(): NumberChainable<
        MergeGuards<input, p, GuardExcludeP<unknown, number, never>>,
        'finite' | omitted
      >;
      /**
       * `P.number.gt(min)` matches **number** greater than `min`.
       *
       * [Read the documentation for `P.number.gt` on GitHub](https://github.com/gvergnaud/ts-pattern#pnumbergt)
       *
       * @example
       *  match(value)
       *   .with(P.number.gt(10), () => 'numbers > 10')
       */
      gt<input, const min extends number>(
        min: min
      ): NumberChainable<MergeGuards<input, p, GuardExcludeP<unknown, number, never>>, omitted>;
      /**
       * `P.number.gte(min)` matches **number** greater than or equal to `min`.
       *
       * [Read the documentation for `P.number.gte` on GitHub](https://github.com/gvergnaud/ts-pattern#pnumbergte)
       *
       * @example
       *  match(value)
       *   .with(P.number.gte(10), () => 'numbers >= 10')
       */
      gte<input, const min extends number>(
        min: min
      ): NumberChainable<MergeGuards<input, p, GuardExcludeP<unknown, number, never>>, omitted>;
      /**
       * `P.number.int` matches **integer** numbers.
       *
       * [Read the documentation for `P.number.int` on GitHub](https://github.com/gvergnaud/ts-pattern#pnumberint)
       *
       * @example
       *  match(value)
       *   .with(P.number.int, () => 'an integer')
       */
      int<input>(): NumberChainable<MergeGuards<input, p, GuardExcludeP<unknown, number, never>>, 'int' | omitted>;
      /**
       * `P.number.lt(max)` matches **number** smaller than `max`.
       *
       * [Read the documentation for `P.number.lt` on GitHub](https://github.com/gvergnaud/ts-pattern#pnumberlt)
       *
       * @example
       *  match(value)
       *   .with(P.number.lt(10), () => 'numbers < 10')
       */
      lt<input, const max extends number>(
        max: max
      ): NumberChainable<MergeGuards<input, p, GuardExcludeP<unknown, number, never>>, omitted>;
      /**
       * `P.number.lte(max)` matches **number** smaller than or equal to `max`.
       *
       * [Read the documentation for `P.number.lte` on GitHub](https://github.com/gvergnaud/ts-pattern#pnumberlte)
       *
       * @example
       *  match(value)
       *   .with(P.number.lte(10), () => 'numbers <= 10')
       */
      lte<input, const max extends number>(
        max: max
      ): NumberChainable<MergeGuards<input, p, GuardExcludeP<unknown, number, never>>, omitted>;
      /**
       * `P.number.negative` matches **negative** numbers.
       *
       * [Read the documentation for `P.number.negative` on GitHub](https://github.com/gvergnaud/ts-pattern#pnumbernegative)
       *
       * @example
       *  match(value)
       *   .with(P.number.negative, () => 'number < 0')
       */
      negative<input>(): NumberChainable<
        MergeGuards<input, p, GuardExcludeP<unknown, number, never>>,
        'negative' | 'positive' | omitted
      >;
      /**
       * `P.number.positive` matches **positive** numbers.
       *
       * [Read the documentation for `P.number.positive` on GitHub](https://github.com/gvergnaud/ts-pattern#pnumberpositive)
       *
       * @example
       *  match(value)
       *   .with(P.number.positive, () => 'number > 0')
       */
      positive<input>(): NumberChainable<
        MergeGuards<input, p, GuardExcludeP<unknown, number, never>>,
        'negative' | 'positive' | omitted
      >;
    },
    omitted
  >;

declare type NumberPattern = NumberChainable<GuardP<unknown, number>, never>;

declare type ObjectPattern<a> =
  | {
      readonly [k in keyof a]?: Pattern_2<a[k]>;
    }
  | never;

/**
 * `P.optional(subpattern)` takes a sub pattern and returns a pattern which matches if the
 * key is undefined or if it is defined and the sub pattern matches its value.
 *
 * [Read the documentation for `P.optional` on GitHub](https://github.com/gvergnaud/ts-pattern#poptional-patterns)
 *
 * @example
 *  match(value)
 *   .with({ greeting: P.optional('Hello') }, () => 'will match { greeting?: "Hello" }')
 */
declare function optional<input, const pattern extends unknown extends input ? UnknownPattern : Pattern_2<input>>(
  pattern: pattern
): Chainable<OptionalP<input, pattern>, 'optional'>;

declare type OptionalKeys<p> = ValueOf<{
  [k in keyof p]: 0 extends 1 & p[k]
    ? never
    : p[k] extends Matcher<any, any, infer matcherType>
      ? matcherType extends 'optional'
        ? k
        : never
      : never;
}>;

declare type OptionalP<input, p> = Matcher<input, p, 'optional'>;

declare type OrP<input, ps> = Matcher<input, ps, 'or'>;

declare interface Override<a> {
  [symbols.override]: a;
}

declare const override: unique symbol;

declare type override = typeof override;

declare namespace P {
  export {
    _,
    any,
    array,
    bigint,
    boolean,
    Fn as unstable_Fn,
    infer,
    instanceOf,
    intersection,
    map,
    matcher,
    narrow,
    nonNullable,
    not,
    nullish,
    number,
    optional,
    Pattern_2 as Pattern,
    select,
    set,
    shape,
    string,
    symbol,
    union,
    unstable_Matchable,
    unstable_Matcher,
    when
  };
}
export { P };
export { P as Pattern };

/**
 * `Pattern<a>` is the generic type for patterns matching a value of type `a`. A pattern can be any (nested) javascript value.
 *
 * They can also be wildcards, like `P._`, `P.string`, `P.number`,
 * or other matchers, like `P.when(predicate)`, `P.not(pattern)`, etc.
 *
 * [Read the documentation for `P.Pattern` on GitHub](https://github.com/gvergnaud/ts-pattern#patterns)
 *
 * @example
 * const pattern: P.Pattern<User> = { name: P.string }
 */
declare type Pattern_2<a> = unknown extends a ? UnknownPattern : KnownPattern<a>;

declare type PatternMatcher<input> = Matcher<input, unknown, any, any>;

declare type PickReturnValue<a, b> = a extends symbols.unset ? b : a;

declare type Prev<it extends any[]> = it extends readonly [any, ...infer tail] ? tail : [];

declare type Primitives = bigint | boolean | null | number | string | symbol | undefined;

declare type ReadonlyArrayValue<T> = T extends ReadonlyArray<infer V> ? V : never;

declare type ReduceFindSelectionUnion<i, ps extends readonly any[], output = never> = ps extends readonly [
  infer head,
  ...infer tail
]
  ? ReduceFindSelectionUnion<i, tail, FindSelectionUnion<i, head> | output>
  : output;

declare type ReduceIntersection<tuple extends readonly any[], i, output = unknown> = tuple extends readonly [
  infer p,
  ...infer tail
]
  ? ReduceIntersection<tail, i, InvertPatternInternal<p, i> & output>
  : output;

declare type ReduceIntersectionForExclude<tuple extends readonly any[], i, output = unknown> = tuple extends readonly [
  infer p,
  ...infer tail
]
  ? ReduceIntersectionForExclude<tail, i, InvertPatternForExcludeInternal<p, i, unknown> & output>
  : output;

declare type ReduceUnion<tuple extends readonly any[], i, output = never> = tuple extends readonly [
  infer p,
  ...infer tail
]
  ? ReduceUnion<tail, i, InvertPatternInternal<p, i> | output>
  : output;

declare type ReduceUnionForExclude<tuple extends readonly any[], i, output = never> = tuple extends readonly [
  infer p,
  ...infer tail
]
  ? ReduceUnionForExclude<tail, i, InvertPatternForExcludeInternal<p, i, never> | output>
  : output;

/**
 * `P.select()` is a pattern which will always match,
 * and will inject the selected piece of input in the handler function.
 *
 * [Read the documentation for `P.select` on GitHub](https://github.com/gvergnaud/ts-pattern#pselect-patterns)
 *
 * @example
 *  match<{ age: number }>(value)
 *   .with({ age: P.select() }, (age) => 'age: number'
 *   )
 */
declare function select(): Chainable<AnonymousSelectP, 'and' | 'or' | 'select'>;

declare function select<
  input,
  const patternOrKey extends string | (unknown extends input ? UnknownPattern : Pattern_2<input>)
>(
  patternOrKey: patternOrKey
): patternOrKey extends string
  ? Chainable<SelectP<patternOrKey, 'and' | 'or' | 'select'>>
  : Chainable<SelectP<symbols.anonymousSelectKey, input, patternOrKey>, 'and' | 'or' | 'select'>;

declare function select<
  input,
  const pattern extends unknown extends input ? UnknownPattern : Pattern_2<input>,
  const k extends string
>(key: k, pattern: pattern): Chainable<SelectP<k, input, pattern>, 'and' | 'or' | 'select'>;

declare type Selections<i, p> =
  FindSelectionUnion<i, p> extends infer u
    ? [u] extends [never]
      ? i
      : SelectionToArgs<Extract<MergeUnion<u>, SelectionsRecord>>
    : i;

declare type SelectionsRecord = Record<string, [unknown, unknown[]]>;

declare type SelectionToArgs<selections extends SelectionsRecord> = symbols.anonymousSelectKey extends keyof selections
  ? IsUnion<selections[symbols.anonymousSelectKey][1]> extends true
    ? SeveralAnonymousSelectError
    : keyof selections extends symbols.anonymousSelectKey
      ? selections[symbols.anonymousSelectKey][0]
      : MixedNamedAndAnonymousSelectError
  : {
      [k in keyof selections]: selections[k][0];
    };

declare type SelectionType = None | Some<string>;

declare type SelectP<key extends string, input = unknown, p = Matcher<unknown, unknown>> = Matcher<
  input,
  p,
  'select',
  Some<key>
>;

/**
 * `P.set(subpattern)` takes a sub pattern and returns a pattern that matches
 * sets if all their elements match the sub pattern.
 *
 * [Read `P.set` documentation on GitHub](https://github.com/gvergnaud/ts-pattern#pset-patterns)
 *
 * @example
 *  match(value)
 *   .with({ users: P.set(P.string) }, () => 'will match Set<string>')
 */
declare function set<input>(): Chainable<SetP<input, unknown>>;

declare function set<input, const pattern extends Pattern_2<WithDefault_2<UnwrapSet<input>, unknown>>>(
  pattern: pattern
): Chainable<SetP<input, pattern>>;

declare type SetP<input, p> = Matcher<input, p, 'set'>;

declare type SetValue<T> = T extends Set<infer V> ? V : never;

declare type SeveralAnonymousSelectError<
  a = 'You can only use a single anonymous selection (with `select()`) in your pattern. If you need to select multiple values, give them names with `select(<name>)` instead'
> = {
  __error: never;
} & a;

/**
 * `P.shape(somePattern)` lets you call methods like `.optional()`, `.and`, `.or` and `.select()`
 * On structural patterns, like objects and arrays.
 *
 * [Read the documentation for `P.shape` on GitHub](https://github.com/gvergnaud/ts-pattern#pshape-patterns)
 *
 *  @example
 *   .with(
 *     {
 *       state: P.shape({ status: "success" }).optional().select()
 *     },
 *     (state) => 'match the success state, or undefined.'
 *   )
 */
declare function shape<input, const pattern extends Pattern_2<input>>(
  pattern: pattern
): Chainable<GuardP<input, InvertPattern<pattern, input>>>;

declare type Some<key extends string> = {
  key: key;
  type: 'some';
};

/**
 * `P.string` is a wildcard pattern, matching any **string**.
 *
 * [Read the documentation for `P.string` on GitHub](https://github.com/gvergnaud/ts-pattern#pstring-wildcard)
 *
 * @example
 *  match(value)
 *   .with(P.string, () => 'will match on strings')
 */
declare const string: StringPattern;

declare type StringChainable<p extends Matcher<any, any, any, any, any>, omitted extends string = never> = Chainable<
  p,
  omitted
> &
  Omit<
    {
      /**
       * `P.string.endsWith(end)` is a pattern, matching **strings** ending with `end`.
       *
       * [Read the documentation for `P.string.endsWith` on GitHub](https://github.com/gvergnaud/ts-pattern#pstringendsWith)
       *
       * @example
       *  match(value)
       *   .with(P.string.endsWith('!'), () => 'value ends with an !')
       */
      endsWith<input, const end extends string>(
        end: end
      ): StringChainable<MergeGuards<input, p, GuardP<unknown, `${string}${end}`>>, 'endsWith' | omitted>;
      /**
       * `P.string.includes(substr)` is a pattern, matching **strings** containing `substr`.
       *
       * [Read the documentation for `P.string.includes` on GitHub](https://github.com/gvergnaud/ts-pattern#pstringincludes)
       *
       * @example
       *  match(value)
       *   .with(P.string.includes('http'), () => 'value contains http')
       */
      includes<input, const substr extends string>(
        substr: substr
      ): StringChainable<MergeGuards<input, p, GuardExcludeP<unknown, string, never>>, omitted>;
      /**
       * `P.string.length(len)` is a pattern, matching **strings** with exactly `len` characters.
       *
       * [Read the documentation for `P.string.length` on GitHub](https://github.com/gvergnaud/ts-pattern#pstringlength)
       *
       * @example
       *  match(value)
       *   .with(P.string.length(10), () => 'strings with length === 10')
       */
      length<input, const len extends number>(
        len: len
      ): StringChainable<
        MergeGuards<input, p, GuardExcludeP<unknown, string, never>>,
        'length' | 'maxLength' | 'minLength' | omitted
      >;
      /**
       * `P.string.maxLength(max)` is a pattern, matching **strings** with at most `max` characters.
       *
       * [Read the documentation for `P.string.maxLength` on GitHub](https://github.com/gvergnaud/ts-pattern#pstringmaxLength)
       *
       * @example
       *  match(value)
       *   .with(P.string.maxLength(10), () => 'string with more length >= 10')
       */
      maxLength<input, const max extends number>(
        max: max
      ): StringChainable<MergeGuards<input, p, GuardExcludeP<unknown, string, never>>, 'maxLength' | omitted>;
      /**
       * `P.string.minLength(min)` is a pattern, matching **strings** with at least `min` characters.
       *
       * [Read the documentation for `P.string.minLength` on GitHub](https://github.com/gvergnaud/ts-pattern#pstringminLength)
       *
       * @example
       *  match(value)
       *   .with(P.string.minLength(10), () => 'string with more length <= 10')
       */
      minLength<input, const min extends number>(
        min: min
      ): StringChainable<MergeGuards<input, p, GuardExcludeP<unknown, string, never>>, 'minLength' | omitted>;
      /**
       * `P.string.regex(expr)` is a pattern, matching **strings** that `expr` regular expression.
       *
       * [Read the documentation for `P.string.regex` on GitHub](https://github.com/gvergnaud/ts-pattern#pstringregex)
       *
       * @example
       *  match(value)
       *   .with(P.string.regex(/^https?:\/\//), () => 'url')
       */
      regex<input, const expr extends RegExp | string>(
        expr: expr
      ): StringChainable<MergeGuards<input, p, GuardExcludeP<unknown, string, never>>, omitted>;
      /**
       * `P.string.startsWith(start)` is a pattern, matching **strings** starting with `start`.
       *
       * [Read the documentation for `P.string.startsWith` on GitHub](https://github.com/gvergnaud/ts-pattern#pstringstartsWith)
       *
       * @example
       *  match(value)
       *   .with(P.string.startsWith('A'), () => 'value starts with an A')
       */
      startsWith<input, const start extends string>(
        start: start
      ): StringChainable<MergeGuards<input, p, GuardP<unknown, `${start}${string}`>>, 'startsWith' | omitted>;
    },
    omitted
  >;

declare type StringPattern = StringChainable<GuardP<unknown, string>, never>;

/**
 * `P.symbol` is a wildcard pattern, matching any **symbol**.
 *
 * [Read the documentation for `P.symbol` on GitHub](https://github.com/gvergnaud/ts-pattern#symbol-wildcard)
 *
 * @example
 *   .with(P.symbol, () => 'will match on symbols')
 */
declare const symbol: SymbolPattern;

declare type SymbolPattern = Chainable<GuardP<unknown, symbol>, never>;

declare namespace symbols {
  export { anonymousSelectKey, isVariadic, matcher, override, unset };
}

declare interface TSPatternError<i> {
  __nonExhaustive: never;
}

declare type Union<a, b> = [b] extends [a] ? a : [a] extends [b] ? b : a | b;

/**
 * `P.union(...patterns)` returns a pattern which matches
 * if **at least one** of the patterns provided in parameter match the input.
 *
 * [Read the documentation for `P.union` on GitHub](https://github.com/gvergnaud/ts-pattern#punion-patterns)
 *
 * @example
 *  match(value)
 *   .with(
 *     { type: P.union('a', 'b', 'c') },
 *     ({ type }) => 'will match { type: "a" | "b" | "c" }'
 *   )
 */
declare function union<input, const patterns extends readonly [Pattern_2<input>, ...Pattern_2<input>[]]>(
  ...patterns: patterns
): Chainable<OrP<input, patterns>>;

declare type UnionToIntersection<union> = (union extends any ? (k: union) => void : never) extends (
  k: infer intersection
) => void
  ? intersection
  : never;

declare type UnionToTuple<union, output extends any[] = []> =
  UnionToIntersection<union extends any ? (t: union) => union : never> extends (_: any) => infer elem
    ? UnionToTuple<Exclude<union, elem>, [elem, ...output]>
    : output;

declare type UnknownMatcher = PatternMatcher<unknown>;

declare type UnknownPattern =
  | {
      readonly [k: string]: unknown;
    }
  | Primitives
  | readonly [...unknown[], unknown]
  | readonly []
  | readonly [unknown, ...unknown[]]
  | UnknownMatcher;

declare const unset: unique symbol;

declare type unset = typeof unset;

/**
 * @experimental
 * A `Matchable` is an object implementing
 * the Matcher Protocol. It must have a `[P.matcher]: P.Matcher<NarrowFn>`
 * key, which defines how this object should be matched by TS-Pattern.
 *
 * Note that this api is unstable.
 *
 * @example
 * ```ts
 * class Some<T> implements P.unstable_Matchable {
 *  [P.matcher](): P.unstable_Matcher<Some<T>>
 * }
 * ```
 */
declare type unstable_Matchable<narrowedOrFn, input = unknown, pattern = never> = CustomP<input, pattern, narrowedOrFn>;

/**
 * @experimental
 * A `Matcher` is an object with `match` function, which
 * defines how this object should be matched by TS-Pattern.
 *
 * Note that this api is unstable.
 *
 * @example
 * ```ts
 * class Some<T> implements P.unstable_Matchable {
 *  [P.matcher](): P.unstable_Matcher<Some<T>>
 * }
 * ```
 */
declare type unstable_Matcher<narrowedOrFn, input = unknown, pattern = never> = ReturnType<
  CustomP<input, pattern, narrowedOrFn>[matcher]
>;

declare type UnwrapArray<xs> = xs extends readonly (infer x)[] ? x : never;

declare type UnwrapMapKey<xs> = xs extends Map<infer k, any> ? k : never;

declare type UnwrapMapValue<xs> = xs extends Map<any, infer v> ? v : never;

declare type UnwrapSet<xs> = xs extends Set<infer x> ? x : never;

declare type Update<data, value, path> = path extends readonly [infer head, ...infer tail]
  ? data extends readonly [any, ...any]
    ? head extends number
      ? UpdateAt<data, Iterator_2<head>, Update<data[head], value, tail>>
      : never
    : data extends readonly (infer a)[]
      ? Update<a, value, tail>[]
      : data extends Set<infer a>
        ? Set<Update<a, value, tail>>
        : data extends Map<infer k, infer v>
          ? Map<k, Update<v, value, tail>>
          : head extends keyof data
            ? Compute<
                {
                  [k in Exclude<keyof data, head>]: data[k];
                } & {
                  [k in head]: Update<data[k], value, tail>;
                }
              >
            : data
  : value;

declare type UpdateAt<tail extends readonly any[], n extends any[], value, inits extends readonly any[] = []> =
  Length<n> extends 0
    ? tail extends readonly [any, ...infer tail]
      ? [...inits, value, ...tail]
      : inits
    : tail extends readonly [infer head, ...infer tail]
      ? UpdateAt<tail, Prev<n>, value, [...inits, head]>
      : inits;

declare type ValueOf<a> = a extends readonly any[] ? a[number] : a[keyof a];

declare type Values<a extends object> = UnionToTuple<ValueOf<a>>;

declare type Variadic<pattern> = Iterable<pattern> & pattern;

/**
 * `P.when((value) => boolean)` returns a pattern which matches
 * if the predicate returns true for the current input.
 *
 * [Read the documentation for `P.when` on GitHub](https://github.com/gvergnaud/ts-pattern#pwhen-patterns)
 *
 * @example
 *  match<{ age: number }>(value)
 *   .with({ age: P.when(age => age > 21) }, (x) => 'will match if value.age > 21'
 *   )
 */
declare function when<input, predicate extends (value: input) => unknown>(
  predicate: predicate
): GuardP<input, predicate extends (value: any) => value is infer narrowed ? narrowed : never>;

declare function when<input, narrowed extends input, excluded>(
  predicate: (input: input) => input is narrowed
): GuardExcludeP<input, narrowed, excluded>;

declare type WithDefault<a, def> = [a] extends [never] ? def : a;

declare type WithDefault_2<a, b> = [a] extends [never] ? b : a;

export {};
