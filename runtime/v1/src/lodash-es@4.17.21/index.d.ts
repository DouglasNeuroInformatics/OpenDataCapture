declare const _: LoDashStatic;

declare type __ = LoDashStatic;

export declare const add: (typeof _)['add'];

export declare const after: (typeof _)['after'];

declare type ArrayIterator<T, TResult> = (value: T, index: number, collection: T[]) => TResult;

export declare const ary: (typeof _)['ary'];

export declare const assign: (typeof _)['assign'];

declare type AssignCustomizer = (objectValue: any, sourceValue: any, key?: string, object?: {}, source?: {}) => any;

export declare const assignIn: (typeof _)['assignIn'];

export declare const assignInWith: (typeof _)['assignInWith'];

export declare const assignWith: (typeof _)['assignWith'];

export declare const at: (typeof _)['at'];

export declare const attempt: (typeof _)['attempt'];

export declare const before: (typeof _)['before'];

export declare const bind: (typeof _)['bind'];

export declare const bindAll: (typeof _)['bindAll'];

export declare const bindKey: (typeof _)['bindKey'];

export declare const camelCase: (typeof _)['camelCase'];

export declare const capitalize: (typeof _)['capitalize'];

export declare const castArray: (typeof _)['castArray'];

export declare const ceil: (typeof _)['ceil'];

export declare const chain: (typeof _)['chain'];

export declare const chunk: (typeof _)['chunk'];

export declare const clamp: (typeof _)['clamp'];

export declare const clone: (typeof _)['clone'];

export declare const cloneDeep: (typeof _)['cloneDeep'];

export declare const cloneDeepWith: (typeof _)['cloneDeepWith'];

declare type CloneDeepWithCustomizer<TObject> = (
  value: any,
  key: number | string | undefined,
  object: TObject | undefined,
  stack: any
) => any;

export declare const cloneWith: (typeof _)['cloneWith'];

declare type CloneWithCustomizer<TValue, TResult> = (
  value: TValue,
  key: number | string | undefined,
  object: any,
  stack: any
) => TResult;

declare interface Collection<T> {
  pop(): T | undefined;
  push(...items: T[]): this;
  shift(): T | undefined;
  sort(compareFn?: (a: T, b: T) => number): this;
  splice(start: number, deleteCount?: number, ...items: T[]): this;
  unshift(...items: T[]): this;
}

declare interface Collection<T> extends LoDashImplicitWrapper<T[]> {}

declare interface Collection<T> {
  /**
   * @see _.chunk
   */
  chunk(size?: number): Collection<T[]>;
}

declare interface Collection<T> {
  /**
   * @see _.compact
   */
  compact(): Collection<Truthy<T>>;
}

declare interface Collection<T> {
  /**
   * @see _.concat
   */
  concat(...values: Array<Many<T>>): Collection<T>;
}

declare interface Collection<T> {
  /**
   * @see _.difference
   */
  difference(...values: Array<List<T>>): Collection<T>;
}

declare interface Collection<T> {
  /**
   * @see _.differenceBy
   */
  differenceBy<T2>(values1: List<T2>, iteratee?: ValueIteratee<T | T2>): Collection<T>;
  /**
   * @see _.differenceBy
   */
  differenceBy(...values: Array<List<unknown> | ValueIteratee<T>>): Collection<T>;
}

declare interface Collection<T> {
  /**
   * @see _.differenceWith
   */
  differenceWith<T2>(values: List<T2>, comparator: Comparator2<T, T2>): Collection<T>;
  /**
   * @see _.differenceWith
   */
  differenceWith<T2, T3, T4>(...values: Array<List<unknown> | Comparator2<T, never>>): Collection<T>;
}

declare interface Collection<T> {
  /**
   * @see _.drop
   */
  drop(n?: number): Collection<T>;
}

declare interface Collection<T> {
  /**
   * @see _.dropRight
   */
  dropRight(n?: number): Collection<T>;
}

declare interface Collection<T> {
  /**
   * @see _.dropRightWhile
   */
  dropRightWhile(predicate?: ListIteratee<T>): Collection<T>;
}

declare interface Collection<T> {
  /**
   * @see _.dropWhile
   */
  dropWhile(predicate?: ListIteratee<T>): Collection<T>;
}

declare interface Collection<T> {
  /**
   * @see _.fill
   */
  fill<U>(value: U, start?: number, end?: number): Collection<T | U>;
}

declare interface Collection<T> {
  /**
   * @see _.findIndex
   */
  findIndex(predicate?: ListIterateeCustom<T, boolean>, fromIndex?: number): number;
}

declare interface Collection<T> {
  /**
   * @see _.findLastIndex
   */
  findLastIndex(predicate?: ListIterateeCustom<T, boolean>, fromIndex?: number): number;
}

declare interface Collection<T> {
  /**
   * @see _.first
   */
  first(): T | undefined;
}

declare interface Collection<T> {
  /**
   * @see _.flatten
   */
  flatten(): T extends Many<infer U> ? Collection<U> : Collection<T>;
}

declare interface Collection<T> {
  /**
   * @see _.flattenDeep
   */
  flattenDeep(): T extends ListOfRecursiveArraysOrValues<infer U> ? Collection<Flat<U>> : Collection<T>;
}

declare interface Collection<T> {
  /**
   * @see _.flattenDepth
   */
  flattenDepth(depth?: number): Collection<T>;
}

declare interface Collection<T> {
  /**
   * @see _.fromPairs
   */
  fromPairs(): Object_2<Dictionary<T extends [PropertyName, infer U] ? U : any>>;
}

declare interface Collection<T> {
  /**
   * @see _.head
   */
  head(): T | undefined;
}

declare interface Collection<T> {
  /**
   * @see _.indexOf
   */
  indexOf(value: T, fromIndex?: number): number;
}

declare interface Collection<T> {
  /**
   * @see _.initial
   */
  initial(): Collection<T>;
}

declare interface Collection<T> {
  /**
   * @see _.intersection
   */
  intersection(...arrays: Array<List<T> | null | undefined>): Collection<T>;
}

declare interface Collection<T> {
  /**
   * @see _.intersectionBy
   */
  intersectionBy<T2>(values: List<T2>, iteratee: ValueIteratee<T | T2>): Collection<T>;
  /**
   * @see _.intersectionBy
   */
  intersectionBy(...values: Array<List<unknown> | ValueIteratee<T>>): Collection<T>;
}

declare interface Collection<T> {
  /**
   * @see _.intersectionWith
   */
  intersectionWith<T2>(values: List<T2>, comparator: Comparator2<T, T2>): Collection<T>;
  /**
   * @see _.intersectionWith
   */
  intersectionWith(...values: Array<List<unknown> | Comparator2<T, never>>): Collection<T>;
}

declare interface Collection<T> {
  /**
   * @see _.join
   */
  join(separator?: string): string;
}

declare interface Collection<T> {
  /**
   * @see _.last
   */
  last(): T | undefined;
}

declare interface Collection<T> {
  /**
   * @see _.lastIndexOf
   */
  lastIndexOf(value: T, fromIndex?: true | number): number;
}

declare interface Collection<T> {
  /**
   * @see _.nth
   */
  nth(n?: number): T | undefined;
}

declare interface Collection<T> {
  /**
   * @see _.pull
   */
  pull(...values: T[]): Collection<T>;
}

declare interface Collection<T> {
  /**
   * @see _.pullAll
   */
  pullAll(values?: List<T>): Collection<T>;
}

declare interface Collection<T> {
  /**
   * @see _.pullAllBy
   */
  pullAllBy<T2>(values?: List<T2>, iteratee?: ValueIteratee<T | T2>): Collection<T>;
}

declare interface Collection<T> {
  /**
   * @see _.pullAllWith
   */
  pullAllWith<T2>(values?: List<T2>, comparator?: Comparator2<T, T2>): Collection<T>;
}

declare interface Collection<T> {
  /**
   * @see _.pullAt
   */
  pullAt(...indexes: Array<Many<number>>): Collection<T>;
}

declare interface Collection<T> {
  /**
   * @see _.remove
   */
  remove(predicate?: ListIteratee<T>): Collection<T>;
}

declare interface Collection<T> {
  /**
   * @see _.slice
   */
  slice(start?: number, end?: number): Collection<T>;
}

declare interface Collection<T> {
  /**
   * @see _.sortedIndex
   */
  sortedIndex(value: T): number;
}

declare interface Collection<T> {
  /**
   * @see _.sortedIndex
   */
  sortedIndex(value: T): number;
}

declare interface Collection<T> {
  /**
   * @see _.sortedIndexBy
   */
  sortedIndexBy(value: T, iteratee?: ValueIteratee<T>): number;
}

declare interface Collection<T> {
  /**
   * @see _.sortedIndexOf
   */
  sortedIndexOf(value: T): number;
}

declare interface Collection<T> {
  /**
   * @see _.sortedLastIndex
   */
  sortedLastIndex(value: T): number;
}

declare interface Collection<T> {
  /**
   * @see _.sortedLastIndexBy
   */
  sortedLastIndexBy(value: T, iteratee: ValueIteratee<T>): number;
}

declare interface Collection<T> {
  /**
   * @see _.sortedLastIndexOf
   */
  sortedLastIndexOf(value: T): number;
}

declare interface Collection<T> {
  /**
   * @see _.sortedUniq
   */
  sortedUniq(): Collection<T>;
}

declare interface Collection<T> {
  /**
   * @see _.sortedUniqBy
   */
  sortedUniqBy(iteratee: ValueIteratee<T>): Collection<T>;
}

declare interface Collection<T> {
  /**
   * @see _.tail
   */
  tail(): Collection<T>;
}

declare interface Collection<T> {
  /**
   * @see _.take
   */
  take(n?: number): Collection<T>;
}

declare interface Collection<T> {
  /**
   * @see _.takeRight
   */
  takeRight(n?: number): Collection<T>;
}

declare interface Collection<T> {
  /**
   * @see _.takeRightWhile
   */
  takeRightWhile(predicate?: ListIteratee<T>): Collection<T>;
}

declare interface Collection<T> {
  /**
   * @see _.takeWhile
   */
  takeWhile(predicate?: ListIteratee<T>): Collection<T>;
}

declare interface Collection<T> {
  /**
   * @see _.union
   */
  union(...arrays: Array<List<T> | null | undefined>): Collection<T>;
}

declare interface Collection<T> {
  /**
   * @see _.unionBy
   */
  unionBy(arrays2: List<T> | null | undefined, iteratee?: ValueIteratee<T>): Collection<T>;
  /**
   * @see _.unionBy
   */
  unionBy(...iteratee: Array<ValueIteratee<T> | List<T> | null | undefined>): Collection<T>;
}

declare interface Collection<T> {
  /**
   * @see _.unionWith
   */
  unionWith(arrays2: List<T> | null | undefined, comparator?: Comparator<T>): Collection<T>;
  /**
   * @see _.unionWith
   */
  unionWith(...comparator: Array<Comparator<T> | List<T> | null | undefined>): Collection<T>;
}

declare interface Collection<T> {
  /**
   * @see _.uniq
   */
  uniq(): Collection<T>;
}

declare interface Collection<T> {
  /**
   * @see _.uniqBy
   */
  uniqBy(iteratee: ValueIteratee<T>): Collection<T>;
}

declare interface Collection<T> {
  /**
   * @see _.uniqWith
   */
  uniqWith(comparator?: Comparator<T>): Collection<T>;
}

declare interface Collection<T> {
  /**
   * @see _.unzip
   */
  unzip(): T extends List<infer U> ? Collection<U[]> : unknown;
}

declare interface Collection<T> {
  /**
   * @see _.unzipWith
   */
  unzipWith<TResult>(
    iteratee: (...values: Array<T extends List<infer U> ? U : unknown>) => TResult
  ): Collection<TResult>;
  /**
   * @see _.unzipWith
   */
  unzipWith(): T extends List<infer U> ? Collection<U[]> : unknown;
}

declare interface Collection<T> {
  /**
   * @see _.without
   */
  without(...values: T[]): Collection<T>;
}

declare interface Collection<T> {
  /**
   * @see _.xor
   */
  xor(...arrays: Array<List<T> | null | undefined>): Collection<T>;
}

declare interface Collection<T> {
  /**
   * @see _.xorBy
   */
  xorBy(arrays2: List<T> | null | undefined, iteratee?: ValueIteratee<T>): Collection<T>;
  /**
   * @see _.xorBy
   */
  xorBy(...iteratee: Array<ValueIteratee<T> | List<T> | null | undefined>): Collection<T>;
}

declare interface Collection<T> {
  /**
   * @see _.xorWith
   */
  xorWith(arrays2: List<T> | null | undefined, comparator?: Comparator<T>): Collection<T>;
  /**
   * @see _.xorWith
   */
  xorWith(...comparator: Array<Comparator<T> | List<T> | null | undefined>): Collection<T>;
}

declare interface Collection<T> {
  /**
   * @see _.zip
   */
  zip<T2>(arrays2: List<T2>): Collection<[T | undefined, T2 | undefined]>;
  /**
   * @see _.zip
   */
  zip(...arrays: Array<List<T> | null | undefined>): Collection<Array<T | undefined>>;
}

declare interface Collection<T> {
  /**
   * @see _.zipObject
   */
  zipObject<U>(values: List<U>): Object_2<Dictionary<U>>;
  /**
   * @see _.zipObject
   */
  zipObject(): Object_2<Dictionary<undefined>>;
}

declare interface Collection<T> {
  /**
   * @see _.zipObjectDeep
   */
  zipObjectDeep(values?: List<any>): Object_2<object>;
}

declare interface Collection<T> {
  /**
   * @see _.zipWith
   */
  zipWith<T2, TResult>(arrays2: List<T2>, iteratee: (value1: T, value2: T2) => TResult): Collection<TResult>;
  /**
   * @see _.zipWith
   */
  zipWith<T2, T3, TResult>(
    arrays2: List<T2>,
    arrays3: List<T3>,
    iteratee: (value1: T, value2: T2, value3: T3) => TResult
  ): Collection<TResult>;
  /**
   * @see _.zipWith
   */
  zipWith<TResult>(...iteratee: Array<((...group: T[]) => TResult) | List<T> | null | undefined>): Collection<TResult>;
}

declare interface Collection<T> {
  /**
   * @see _.countBy
   */
  countBy(iteratee?: ValueIteratee<T>): Object_2<Dictionary<number>>;
}

declare interface Collection<T> {
  /**
   * @see _.each
   */
  each: Collection<T>['forEach'];
}

declare interface Collection<T> {
  /**
   * @see _.eachRight
   */
  eachRight: Collection<T>['forEachRight'];
}

declare interface Collection<T> {
  /**
   * @see _.every
   */
  every(predicate?: ListIterateeCustom<T, boolean>): boolean;
}

declare interface Collection<T> {
  /**
   * @see _.filter
   */
  filter<S extends T>(predicate: ListIteratorTypeGuard<T, S>): Collection<S>;
  /**
   * @see _.filter
   */
  filter(predicate?: ListIterateeCustom<T, boolean>): Collection<T>;
}

declare interface Collection<T> {
  /**
   * @see _.find
   */
  find<S extends T>(predicate: ListIteratorTypeGuard<T, S>, fromIndex?: number): S | undefined;
  /**
   * @see _.find
   */
  find(predicate?: ListIterateeCustom<T, boolean>, fromIndex?: number): T | undefined;
}

declare interface Collection<T> {
  /**
   * @see _.findLast
   */
  findLast<S extends T>(predicate: ListIteratorTypeGuard<T, S>, fromIndex?: number): S | undefined;
  /**
   * @see _.findLast
   */
  findLast(predicate?: ListIterateeCustom<T, boolean>, fromIndex?: number): T | undefined;
}

declare interface Collection<T> {
  /**
   * @see _.flatMap
   */
  flatMap<TResult = any>(iteratee: ListIterator<T, Many<TResult>> | PropertyName): Collection<TResult>;
  /**
   * @see _.flatMap
   */
  flatMap(iteratee: [PropertyName, any] | object): Collection<boolean>;
  /**
   * @see _.flatMap
   */
  flatMap(): T extends Many<infer U> ? Collection<U> : Collection<T>;
}

declare interface Collection<T> {
  /**
   * @see _.flatMapDeep
   */
  flatMapDeep<TResult = any>(
    iteratee: ListIterator<T, ListOfRecursiveArraysOrValues<TResult> | TResult> | PropertyName
  ): Collection<TResult>;
  /**
   * @see _.flatMapDeep
   */
  flatMapDeep(iteratee: [PropertyName, any] | object): Collection<boolean>;
  /**
   * @see _.flatMapDeep
   */
  flatMapDeep(): Collection<T>;
}

declare interface Collection<T> {
  /**
   * @see _.flatMapDepth
   */
  flatMapDepth<TResult = any>(
    iteratee: ListIterator<T, ListOfRecursiveArraysOrValues<TResult> | TResult> | PropertyName,
    depth?: number
  ): Collection<TResult>;
  /**
   * @see _.flatMapDepth
   */
  flatMapDepth(iteratee: [PropertyName, any] | object, depth?: number): Collection<boolean>;
  /**
   * @see _.flatMapDepth
   */
  flatMapDepth(depth?: number): Collection<T>;
}

declare interface Collection<T> {
  /**
   * @see _.forEach
   */
  forEach(iteratee?: ListIterator<T, any>): Collection<T>;
}

declare interface Collection<T> {
  /**
   * @see _.forEachRight
   */
  forEachRight(iteratee?: ListIterator<T, any>): Collection<T>;
}

declare interface Collection<T> {
  /**
   * @see _.groupBy
   */
  groupBy(iteratee?: ValueIteratee<T>): Object_2<Dictionary<T[]>>;
}

declare interface Collection<T> {
  /**
   * @see _.includes
   */
  includes(target: T, fromIndex?: number): boolean;
}

declare interface Collection<T> {
  /**
   * @see _.keyBy
   */
  keyBy(iteratee?: ValueIterateeCustom<T, PropertyName>): Object_2<Dictionary<T>>;
}

declare interface Collection<T> {
  /**
   * @see _.map
   */
  map<K extends keyof T>(key: K): Collection<T[K]>;
  /**
   * @see _.map
   */
  map<TResult>(iteratee: ListIterator<T, TResult>): Collection<TResult>;
  /**
   * @see _.map
   */
  map(iteratee: PropertyName): Collection<any>;
  /**
   * @see _.map
   */
  map(iteratee: [PropertyName, any] | object): Collection<boolean>;
  /**
   * @see _.map
   */
  map(): Collection<T>;
}

declare interface Collection<T> {
  /**
   * @see _.orderBy
   */
  orderBy(
    iteratees?: Many<ListIterator<T, NotVoid> | PropertyName | PartialShallow<T>>,
    orders?: Many<boolean | 'asc' | 'desc'>
  ): Collection<T>;
}

declare interface Collection<T> {
  /**
   * @see _.partition
   */
  partition<U extends T>(callback: ValueIteratorTypeGuard<T, U>): LoDashImplicitWrapper<[U[], Array<Exclude<T, U>>]>;
  /**
   * @see _.partition
   */
  partition(callback: ValueIteratee<T>): LoDashImplicitWrapper<[T[], T[]]>;
}

declare interface Collection<T> {
  /**
   * @see _.reduce
   */
  reduce<TResult>(callback: MemoListIterator<T, TResult, List<T>>, accumulator: TResult): TResult;
  /**
   * @see _.reduce
   */
  reduce(callback: MemoListIterator<T, T, List<T>>): T | undefined;
}

declare interface Collection<T> {
  /**
   * @see _.reduceRight
   */
  reduceRight<TResult>(callback: MemoListIterator<T, TResult, List<T>>, accumulator: TResult): TResult;
  /**
   * @see _.reduceRight
   */
  reduceRight(callback: MemoListIterator<T, T, List<T>>): T | undefined;
}

declare interface Collection<T> {
  /**
   * @see _.reject
   */
  reject(predicate?: ListIterateeCustom<T, boolean>): Collection<T>;
}

declare interface Collection<T> {
  /**
   * @see _.sample
   */
  sample(): T | undefined;
}

declare interface Collection<T> {
  /**
   * @see _.sampleSize
   */
  sampleSize(n?: number): Collection<T>;
}

declare interface Collection<T> {
  /**
   * @see _.shuffle
   */
  shuffle(): Collection<T>;
}

declare interface Collection<T> {
  /**
   * @see _.some
   */
  some(predicate?: ListIterateeCustom<T, boolean>): boolean;
}

declare interface Collection<T> {
  /**
   * @see _.sortBy
   */
  sortBy(...iteratees: Array<Many<ListIteratee<T>>>): Collection<T>;
}

declare interface Collection<T> {
  /**
   * @see _.castArray
   */
  castArray(): Collection<T>;
}

declare interface Collection<T> {
  /**
   * @see _.toArray
   */
  toArray(): Collection<T>;
}

declare interface Collection<T> {
  /**
   * @see _.max
   */
  max(): T | undefined;
}

declare interface Collection<T> {
  /**
   * @see _.maxBy
   */
  maxBy(iteratee?: ValueIteratee<T>): T | undefined;
}

declare interface Collection<T> {
  /**
   * @see _.meanBy
   */
  meanBy(iteratee?: ValueIteratee<T>): number;
}

declare interface Collection<T> {
  /**
   * @see _.min
   */
  min(): T | undefined;
}

declare interface Collection<T> {
  /**
   * @see _.minBy
   */
  minBy(iteratee?: ValueIteratee<T>): T | undefined;
}

declare interface Collection<T> {
  /**
   * @see _.sumBy
   */
  sumBy(iteratee?: ((value: T) => number) | string): number;
}

declare interface Collection<T> {
  /**
   * @see _.at
   */
  at(...props: PropertyPath[]): Collection<T>;
}

declare interface Collection<T> {
  /**
   * @see _.get
   */
  get(path: number): T;
  /**
   * @see _.get
   */
  get<TDefault>(path: number, defaultValue: TDefault): T | TDefault;
}

declare interface Collection<T> {
  /**
   * @see _.invertBy
   */
  invertBy(iteratee?: ValueIteratee<T>): Object_2<Dictionary<string[]>>;
}

declare interface Collection<T> {
  /**
   * @see _.mapKeys
   */
  mapKeys(iteratee?: ListIteratee<T>): Object_2<Dictionary<T>>;
}

declare interface Collection<T> {
  /**
   * @see _.mapValues
   */
  mapValues<TResult>(callback: DictionaryIterator<T, TResult>): Object_2<Dictionary<TResult>>;
  /**
   * @see _.mapValues
   */
  mapValues<TKey extends keyof T>(iteratee: TKey): Object_2<Dictionary<T[TKey]>>;
  /**
   * @see _.mapValues
   */
  mapValues(iteratee: object): Object_2<Dictionary<boolean>>;
  /**
   * @see _.mapValues
   */
  mapValues(iteratee: string): Object_2<Dictionary<any>>;
  /**
   * @see _.mapValues
   */
  mapValues(): Object_2<Dictionary<T>>;
}

declare interface Collection<T> {
  /**
   * @see _.omit
   */
  omit(...paths: Array<Many<PropertyName>>): Collection<T>;
}

declare interface Collection<T> {
  /**
   * @see _.omitBy
   */
  omitBy(predicate?: ValueKeyIteratee<T>): Object_2<Dictionary<T>>;
}

declare interface Collection<T> {
  /**
   * @see _.pickBy
   */
  pickBy<S extends T>(predicate: ValueKeyIterateeTypeGuard<T, S>): Object_2<Dictionary<S>>;
  /**
   * @see _.pickBy
   */
  pickBy(predicate?: ValueKeyIteratee<T>): Object_2<Dictionary<T>>;
}

declare interface Collection<T> {
  /**
   * @see _.transform
   */
  transform<TResult>(iteratee: MemoVoidArrayIterator<T, TResult>, accumulator?: TResult): ImpChain<TResult>;
  /**
   * @see _.transform
   */
  transform(): Collection<any>;
}

declare interface Collection<T> {
  /**
   * @see _.chain
   */
  chain(): CollectionChain<T>;
}

declare interface Collection<T> {
  /**
   * @see _.iteratee
   */
  iteratee(): LoDashFunction<(o: object) => boolean>;
}

declare interface Collection<T> {
  /**
   * @see _.over
   */
  over<TResult>(...iteratees: Array<Many<(...args: any[]) => TResult>>): LoDashFunction<(...args: any[]) => TResult[]>;
}

declare interface Collection<T> {
  /**
   * @see _.overEvery
   */
  overEvery<TArgs>(
    ...iteratees: Array<Many<(...args: TArgs[]) => boolean>>
  ): LoDashFunction<(...args: TArgs[]) => boolean>;
}

declare interface Collection<T> {
  /**
   * @see _.overSome
   */
  overSome<TArgs>(
    ...iteratees: Array<Many<(...args: TArgs[]) => boolean>>
  ): LoDashFunction<(...args: TArgs[]) => boolean>;
}

declare interface CollectionChain<T> {
  pop(): ExpChain<T | undefined>;
  push(...items: T[]): this;
  shift(): ExpChain<T | undefined>;
  sort(compareFn?: (a: T, b: T) => number): this;
  splice(start: number, deleteCount?: number, ...items: T[]): this;
  unshift(...items: T[]): this;
}

declare interface CollectionChain<T> extends LoDashExplicitWrapper<T[]> {}

declare interface CollectionChain<T> {
  /**
   * @see _.chunk
   */
  chunk(size?: number): CollectionChain<T[]>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.compact
   */
  compact(): CollectionChain<Truthy<T>>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.concat
   */
  concat(...values: Array<Many<T>>): CollectionChain<T>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.difference
   */
  difference(...values: Array<List<T>>): CollectionChain<T>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.differenceBy
   */
  differenceBy<T2>(values1: List<T2>, iteratee?: ValueIteratee<T | T2>): CollectionChain<T>;
  /**
   * @see _.differenceBy
   */
  differenceBy(...values: Array<List<unknown> | ValueIteratee<T>>): CollectionChain<T>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.differenceWith
   */
  differenceWith<T2>(values: List<T2>, comparator: Comparator2<T, T2>): CollectionChain<T>;
  /**
   * @see _.differenceWith
   */
  differenceWith<T2, T3, T4>(...values: Array<List<unknown> | Comparator2<T, never>>): CollectionChain<T>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.drop
   */
  drop(n?: number): CollectionChain<T>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.dropRight
   */
  dropRight(n?: number): CollectionChain<T>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.dropRightWhile
   */
  dropRightWhile(predicate?: ListIteratee<T>): CollectionChain<T>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.dropWhile
   */
  dropWhile(predicate?: ListIteratee<T>): CollectionChain<T>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.fill
   */
  fill<U>(value: U, start?: number, end?: number): CollectionChain<T | U>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.findIndex
   */
  findIndex(predicate?: ListIterateeCustom<T, boolean>, fromIndex?: number): PrimitiveChain<number>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.findLastIndex
   */
  findLastIndex(predicate?: ListIterateeCustom<T, boolean>, fromIndex?: number): PrimitiveChain<number>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.first
   */
  first(): ExpChain<T | undefined>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.flatten
   */
  flatten(): T extends Many<infer U> ? CollectionChain<U> : CollectionChain<T>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.flattenDeep
   */
  flattenDeep(): T extends ListOfRecursiveArraysOrValues<infer U> ? CollectionChain<Flat<U>> : CollectionChain<T>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.flattenDepth
   */
  flattenDepth(depth?: number): CollectionChain<T>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.fromPairs
   */
  fromPairs(): ObjectChain<Dictionary<T extends [PropertyName, infer U] ? U : any>>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.head
   */
  head(): ExpChain<T | undefined>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.indexOf
   */
  indexOf(value: T, fromIndex?: number): PrimitiveChain<number>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.initial
   */
  initial(): CollectionChain<T>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.intersection
   */
  intersection(...arrays: Array<List<T> | null | undefined>): CollectionChain<T>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.intersectionBy
   */
  intersectionBy<T2>(values: List<T2>, iteratee: ValueIteratee<T | T2>): CollectionChain<T>;
  /**
   * @see _.intersectionBy
   */
  intersectionBy(...values: Array<List<unknown> | ValueIteratee<T>>): CollectionChain<T>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.intersectionWith
   */
  intersectionWith<T2>(values: List<T2>, comparator: Comparator2<T, T2>): CollectionChain<T>;
  /**
   * @see _.intersectionWith
   */
  intersectionWith(...values: Array<List<unknown> | Comparator2<T, never>>): CollectionChain<T>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.join
   */
  join(separator?: string): StringChain;
}

declare interface CollectionChain<T> {
  /**
   * @see _.last
   */
  last(): ExpChain<T | undefined>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.lastIndexOf
   */
  lastIndexOf(value: T, fromIndex?: true | number): PrimitiveChain<number>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.nth
   */
  nth(n?: number): ExpChain<T | undefined>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.pull
   */
  pull(...values: T[]): CollectionChain<T>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.pullAll
   */
  pullAll(values?: List<T>): CollectionChain<T>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.pullAllBy
   */
  pullAllBy<T2>(values?: List<T2>, iteratee?: ValueIteratee<T | T2>): CollectionChain<T>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.pullAllWith
   */
  pullAllWith<T2>(values?: List<T2>, comparator?: Comparator2<T, T2>): CollectionChain<T>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.pullAt
   */
  pullAt(...indexes: Array<Many<number>>): CollectionChain<T>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.remove
   */
  remove(predicate?: ListIteratee<T>): CollectionChain<T>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.slice
   */
  slice(start?: number, end?: number): CollectionChain<T>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.sortedIndex
   */
  sortedIndex(value: T): PrimitiveChain<number>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.sortedIndex
   */
  sortedIndex(value: T): PrimitiveChain<number>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.sortedIndexBy
   */
  sortedIndexBy(value: T, iteratee?: ValueIteratee<T>): PrimitiveChain<number>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.sortedIndexOf
   */
  sortedIndexOf(value: T): PrimitiveChain<number>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.sortedLastIndex
   */
  sortedLastIndex(value: T): PrimitiveChain<number>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.sortedLastIndexBy
   */
  sortedLastIndexBy(value: T, iteratee: ValueIteratee<T>): PrimitiveChain<number>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.sortedLastIndexOf
   */
  sortedLastIndexOf(value: T): PrimitiveChain<number>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.sortedUniq
   */
  sortedUniq(): CollectionChain<T>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.sortedUniqBy
   */
  sortedUniqBy(iteratee: ValueIteratee<T>): CollectionChain<T>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.tail
   */
  tail(): CollectionChain<T>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.take
   */
  take(n?: number): CollectionChain<T>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.takeRight
   */
  takeRight(n?: number): CollectionChain<T>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.takeRightWhile
   */
  takeRightWhile(predicate?: ListIteratee<T>): CollectionChain<T>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.takeWhile
   */
  takeWhile(predicate?: ListIteratee<T>): CollectionChain<T>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.union
   */
  union(...arrays: Array<List<T> | null | undefined>): CollectionChain<T>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.unionBy
   */
  unionBy(arrays2: List<T> | null | undefined, iteratee?: ValueIteratee<T>): CollectionChain<T>;
  /**
   * @see _.unionBy
   */
  unionBy(...iteratee: Array<ValueIteratee<T> | List<T> | null | undefined>): CollectionChain<T>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.unionWith
   */
  unionWith(arrays2: List<T> | null | undefined, comparator?: Comparator<T>): CollectionChain<T>;
  /**
   * @see _.unionWith
   */
  unionWith(...comparator: Array<Comparator<T> | List<T> | null | undefined>): CollectionChain<T>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.uniq
   */
  uniq(): CollectionChain<T>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.uniqBy
   */
  uniqBy(iteratee: ValueIteratee<T>): CollectionChain<T>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.uniqWith
   */
  uniqWith(comparator?: Comparator<T>): CollectionChain<T>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.unzip
   */
  unzip(): T extends List<infer U> ? CollectionChain<U[]> : unknown;
}

declare interface CollectionChain<T> {
  /**
   * @see _.unzipWith
   */
  unzipWith<TResult>(
    iteratee: (...values: Array<T extends List<infer U> ? U : unknown>) => TResult
  ): CollectionChain<TResult>;
  /**
   * @see _.unzipWith
   */
  unzipWith(): T extends List<infer U> ? CollectionChain<U[]> : unknown;
}

declare interface CollectionChain<T> {
  /**
   * @see _.without
   */
  without(...values: T[]): CollectionChain<T>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.xor
   */
  xor(...arrays: Array<List<T> | null | undefined>): CollectionChain<T>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.xorBy
   */
  xorBy(arrays2: List<T> | null | undefined, iteratee?: ValueIteratee<T>): CollectionChain<T>;
  /**
   * @see _.xorBy
   */
  xorBy(...iteratee: Array<ValueIteratee<T> | List<T> | null | undefined>): CollectionChain<T>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.xorWith
   */
  xorWith(arrays2: List<T> | null | undefined, comparator?: Comparator<T>): CollectionChain<T>;
  /**
   * @see _.xorWith
   */
  xorWith(...comparator: Array<Comparator<T> | List<T> | null | undefined>): CollectionChain<T>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.zip
   */
  zip<T2>(arrays2: List<T2>): CollectionChain<[T | undefined, T2 | undefined]>;
  /**
   * @see _.zip
   */
  zip(...arrays: Array<List<T> | null | undefined>): CollectionChain<Array<T | undefined>>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.zipObject
   */
  zipObject<U>(values: List<U>): ObjectChain<Dictionary<U>>;
  /**
   * @see _.zipObject
   */
  zipObject(): ObjectChain<Dictionary<undefined>>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.zipObjectDeep
   */
  zipObjectDeep(values?: List<any>): ObjectChain<object>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.zipWith
   */
  zipWith<T2, TResult>(arrays2: List<T2>, iteratee: (value1: T, value2: T2) => TResult): CollectionChain<TResult>;
  /**
   * @see _.zipWith
   */
  zipWith<T2, T3, TResult>(
    arrays2: List<T2>,
    arrays3: List<T3>,
    iteratee: (value1: T, value2: T2, value3: T3) => TResult
  ): CollectionChain<TResult>;
  /**
   * @see _.zipWith
   */
  zipWith<TResult>(
    ...iteratee: Array<((...group: T[]) => TResult) | List<T> | null | undefined>
  ): CollectionChain<TResult>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.countBy
   */
  countBy(iteratee?: ValueIteratee<T>): ObjectChain<Dictionary<number>>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.each
   */
  each: CollectionChain<T>['forEach'];
}

declare interface CollectionChain<T> {
  /**
   * @see _.eachRight
   */
  eachRight: CollectionChain<T>['forEachRight'];
}

declare interface CollectionChain<T> {
  /**
   * @see _.every
   */
  every(predicate?: ListIterateeCustom<T, boolean>): PrimitiveChain<boolean>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.filter
   */
  filter<S extends T>(predicate: ListIteratorTypeGuard<T, S>): CollectionChain<S>;
  /**
   * @see _.filter
   */
  filter(predicate?: ListIterateeCustom<T, boolean>): CollectionChain<T>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.find
   */
  find<S extends T>(predicate: ListIteratorTypeGuard<T, S>, fromIndex?: number): ExpChain<S | undefined>;
  /**
   * @see _.find
   */
  find(predicate?: ListIterateeCustom<T, boolean>, fromIndex?: number): ExpChain<T | undefined>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.findLast
   */
  findLast<S extends T>(predicate: ListIteratorTypeGuard<T, S>, fromIndex?: number): ExpChain<S | undefined>;
  /**
   * @see _.findLast
   */
  findLast(predicate?: ListIterateeCustom<T, boolean>, fromIndex?: number): ExpChain<T | undefined>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.flatMap
   */
  flatMap<TResult = any>(iteratee: ListIterator<T, Many<TResult>> | PropertyName): CollectionChain<TResult>;
  /**
   * @see _.flatMap
   */
  flatMap(iteratee: [PropertyName, any] | object): CollectionChain<boolean>;
  /**
   * @see _.flatMap
   */
  flatMap(): T extends Many<infer U> ? CollectionChain<U> : CollectionChain<T>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.flatMapDeep
   */
  flatMapDeep<TResult = any>(
    iteratee: ListIterator<T, ListOfRecursiveArraysOrValues<TResult> | TResult> | PropertyName
  ): CollectionChain<TResult>;
  /**
   * @see _.flatMapDeep
   */
  flatMapDeep(iteratee: [PropertyName, any] | object): CollectionChain<boolean>;
  /**
   * @see _.flatMapDeep
   */
  flatMapDeep(): CollectionChain<T>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.flatMapDepth
   */
  flatMapDepth<TResult = any>(
    iteratee: ListIterator<T, ListOfRecursiveArraysOrValues<TResult> | TResult> | PropertyName,
    depth?: number
  ): CollectionChain<TResult>;
  /**
   * @see _.flatMapDepth
   */
  flatMapDepth(iteratee: [PropertyName, any] | object, depth?: number): CollectionChain<boolean>;
  /**
   * @see _.flatMapDepth
   */
  flatMapDepth(depth?: number): CollectionChain<T>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.forEach
   */
  forEach(iteratee?: ListIterator<T, any>): CollectionChain<T>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.forEachRight
   */
  forEachRight(iteratee?: ListIterator<T, any>): CollectionChain<T>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.groupBy
   */
  groupBy(iteratee?: ValueIteratee<T>): ObjectChain<Dictionary<T[]>>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.includes
   */
  includes(target: T, fromIndex?: number): PrimitiveChain<boolean>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.keyBy
   */
  keyBy(iteratee?: ValueIterateeCustom<T, PropertyName>): ObjectChain<Dictionary<T>>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.map
   */
  map<K extends keyof T>(key: K): CollectionChain<T[K]>;
  /**
   * @see _.map
   */
  map<TResult>(iteratee: ListIterator<T, TResult>): CollectionChain<TResult>;
  /**
   * @see _.map
   */
  map(iteratee: PropertyName): CollectionChain<any>;
  /**
   * @see _.map
   */
  map(iteratee: [PropertyName, any] | object): CollectionChain<boolean>;
  /**
   * @see _.map
   */
  map(): CollectionChain<T>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.orderBy
   */
  orderBy(
    iteratees?: Many<ListIterator<T, NotVoid> | PropertyName | PartialShallow<T>>,
    orders?: Many<boolean | 'asc' | 'desc'>
  ): CollectionChain<T>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.partition
   */
  partition<U extends T>(callback: ValueIteratorTypeGuard<T, U>): LoDashExplicitWrapper<[U[], Array<Exclude<T, U>>]>;
  /**
   * @see _.partition
   */
  partition(callback: ValueIteratee<T>): LoDashExplicitWrapper<[T[], T[]]>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.reduce
   */
  reduce<TResult>(callback: MemoListIterator<T, TResult, List<T>>, accumulator: TResult): ExpChain<TResult>;
  /**
   * @see _.reduce
   */
  reduce(callback: MemoListIterator<T, T, List<T>>): ExpChain<T | undefined>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.reduceRight
   */
  reduceRight<TResult>(callback: MemoListIterator<T, TResult, List<T>>, accumulator: TResult): ExpChain<TResult>;
  /**
   * @see _.reduceRight
   */
  reduceRight(callback: MemoListIterator<T, T, List<T>>): ExpChain<T | undefined>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.reject
   */
  reject(predicate?: ListIterateeCustom<T, boolean>): CollectionChain<T>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.sample
   */
  sample(): ExpChain<T | undefined>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.sampleSize
   */
  sampleSize(n?: number): CollectionChain<T>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.shuffle
   */
  shuffle(): CollectionChain<T>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.some
   */
  some(predicate?: ListIterateeCustom<T, boolean>): PrimitiveChain<boolean>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.sortBy
   */
  sortBy(...iteratees: Array<Many<ListIteratee<T>>>): CollectionChain<T>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.castArray
   */
  castArray(): CollectionChain<T>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.toArray
   */
  toArray(): CollectionChain<T>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.max
   */
  max(): ExpChain<T | undefined>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.maxBy
   */
  maxBy(iteratee?: ValueIteratee<T>): ExpChain<T | undefined>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.meanBy
   */
  meanBy(iteratee?: ValueIteratee<T>): PrimitiveChain<number>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.min
   */
  min(): ExpChain<T | undefined>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.minBy
   */
  minBy(iteratee?: ValueIteratee<T>): ExpChain<T | undefined>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.sumBy
   */
  sumBy(iteratee?: ((value: T) => number) | string): PrimitiveChain<number>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.at
   */
  at(...props: PropertyPath[]): CollectionChain<T>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.get
   */
  get(path: number): ExpChain<T>;
  /**
   * @see _.get
   */
  get<TDefault>(path: number, defaultValue: TDefault): ExpChain<T | TDefault>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.invertBy
   */
  invertBy(iteratee?: ValueIteratee<T>): ObjectChain<Dictionary<string[]>>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.mapKeys
   */
  mapKeys(iteratee?: ListIteratee<T>): ObjectChain<Dictionary<T>>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.mapValues
   */
  mapValues<TResult>(callback: DictionaryIterator<T, TResult>): ObjectChain<Dictionary<TResult>>;
  /**
   * @see _.mapValues
   */
  mapValues<TKey extends keyof T>(iteratee: TKey): ObjectChain<Dictionary<T[TKey]>>;
  /**
   * @see _.mapValues
   */
  mapValues(iteratee: object): ObjectChain<Dictionary<boolean>>;
  /**
   * @see _.mapValues
   */
  mapValues(iteratee: string): ObjectChain<Dictionary<any>>;
  /**
   * @see _.mapValues
   */
  mapValues(): ObjectChain<Dictionary<T>>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.omit
   */
  omit(...paths: Array<Many<PropertyName>>): CollectionChain<T>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.omitBy
   */
  omitBy(predicate?: ValueKeyIteratee<T>): ObjectChain<Dictionary<T>>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.pickBy
   */
  pickBy<S extends T>(predicate: ValueKeyIterateeTypeGuard<T, S>): ObjectChain<Dictionary<S>>;
  /**
   * @see _.pickBy
   */
  pickBy(predicate?: ValueKeyIteratee<T>): ObjectChain<Dictionary<T>>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.transform
   */
  transform<TResult>(iteratee: MemoVoidArrayIterator<T, TResult>, accumulator?: TResult): ExpChain<TResult>;
  /**
   * @see _.transform
   */
  transform(): CollectionChain<any>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.iteratee
   */
  iteratee(): FunctionChain<(o: object) => boolean>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.over
   */
  over<TResult>(...iteratees: Array<Many<(...args: any[]) => TResult>>): FunctionChain<(...args: any[]) => TResult[]>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.overEvery
   */
  overEvery<TArgs>(
    ...iteratees: Array<Many<(...args: TArgs[]) => boolean>>
  ): FunctionChain<(...args: TArgs[]) => boolean>;
}

declare interface CollectionChain<T> {
  /**
   * @see _.overSome
   */
  overSome<TArgs>(
    ...iteratees: Array<Many<(...args: TArgs[]) => boolean>>
  ): FunctionChain<(...args: TArgs[]) => boolean>;
}

export declare const compact: (typeof _)['compact'];

declare type Comparator<T> = (a: T, b: T) => boolean;

declare type Comparator2<T1, T2> = (a: T1, b: T2) => boolean;

export declare const concat: (typeof _)['concat'];

export declare const cond: (typeof _)['cond'];

declare type CondPairNullary<R> = [() => boolean, () => R];

declare type CondPairUnary<T, R> = [(val: T) => boolean, (val: T) => R];

export declare const conforms: (typeof _)['conforms'];

declare type ConformsPredicateObject<T> = {
  [P in keyof T]: T[P] extends (arg: infer A) => any ? A : any;
};

export declare const conformsTo: (typeof _)['conformsTo'];

export declare const constant: (typeof _)['constant'];

export declare const countBy: (typeof _)['countBy'];

export declare const create: (typeof _)['create'];

declare interface CurriedFunction1<T1, R> {
  (): CurriedFunction1<T1, R>;
  (t1: T1): R;
}

declare interface CurriedFunction2<T1, T2, R> {
  (): CurriedFunction2<T1, T2, R>;
  (t1: T1): CurriedFunction1<T2, R>;
  (t1: __, t2: T2): CurriedFunction1<T1, R>;
  (t1: T1, t2: T2): R;
}

declare interface CurriedFunction3<T1, T2, T3, R> {
  (): CurriedFunction3<T1, T2, T3, R>;
  (t1: T1): CurriedFunction2<T2, T3, R>;
  (t1: __, t2: T2): CurriedFunction2<T1, T3, R>;
  (t1: T1, t2: T2): CurriedFunction1<T3, R>;
  (t1: __, t2: __, t3: T3): CurriedFunction2<T1, T2, R>;
  (t1: T1, t2: __, t3: T3): CurriedFunction1<T2, R>;
  (t1: __, t2: T2, t3: T3): CurriedFunction1<T1, R>;
  (t1: T1, t2: T2, t3: T3): R;
}

declare interface CurriedFunction4<T1, T2, T3, T4, R> {
  (): CurriedFunction4<T1, T2, T3, T4, R>;
  (t1: T1): CurriedFunction3<T2, T3, T4, R>;
  (t1: __, t2: T2): CurriedFunction3<T1, T3, T4, R>;
  (t1: T1, t2: T2): CurriedFunction2<T3, T4, R>;
  (t1: __, t2: __, t3: T3): CurriedFunction3<T1, T2, T4, R>;
  (t1: __, t2: __, t3: T3): CurriedFunction2<T2, T4, R>;
  (t1: __, t2: T2, t3: T3): CurriedFunction2<T1, T4, R>;
  (t1: T1, t2: T2, t3: T3): CurriedFunction1<T4, R>;
  (t1: __, t2: __, t3: __, t4: T4): CurriedFunction3<T1, T2, T3, R>;
  (t1: T1, t2: __, t3: __, t4: T4): CurriedFunction2<T2, T3, R>;
  (t1: __, t2: T2, t3: __, t4: T4): CurriedFunction2<T1, T3, R>;
  (t1: __, t2: __, t3: T3, t4: T4): CurriedFunction2<T1, T2, R>;
  (t1: T1, t2: T2, t3: __, t4: T4): CurriedFunction1<T3, R>;
  (t1: T1, t2: __, t3: T3, t4: T4): CurriedFunction1<T2, R>;
  (t1: __, t2: T2, t3: T3, t4: T4): CurriedFunction1<T1, R>;
  (t1: T1, t2: T2, t3: T3, t4: T4): R;
}

declare interface CurriedFunction5<T1, T2, T3, T4, T5, R> {
  (): CurriedFunction5<T1, T2, T3, T4, T5, R>;
  (t1: T1): CurriedFunction4<T2, T3, T4, T5, R>;
  (t1: __, t2: T2): CurriedFunction4<T1, T3, T4, T5, R>;
  (t1: T1, t2: T2): CurriedFunction3<T3, T4, T5, R>;
  (t1: __, t2: __, t3: T3): CurriedFunction4<T1, T2, T4, T5, R>;
  (t1: T1, t2: __, t3: T3): CurriedFunction3<T2, T4, T5, R>;
  (t1: __, t2: T2, t3: T3): CurriedFunction3<T1, T4, T5, R>;
  (t1: T1, t2: T2, t3: T3): CurriedFunction2<T4, T5, R>;
  (t1: __, t2: __, t3: __, t4: T4): CurriedFunction4<T1, T2, T3, T5, R>;
  (t1: T1, t2: __, t3: __, t4: T4): CurriedFunction3<T2, T3, T5, R>;
  (t1: __, t2: T2, t3: __, t4: T4): CurriedFunction3<T1, T3, T5, R>;
  (t1: __, t2: __, t3: T3, t4: T4): CurriedFunction3<T1, T2, T5, R>;
  (t1: T1, t2: T2, t3: __, t4: T4): CurriedFunction2<T3, T5, R>;
  (t1: T1, t2: __, t3: T3, t4: T4): CurriedFunction2<T2, T5, R>;
  (t1: __, t2: T2, t3: T3, t4: T4): CurriedFunction2<T1, T5, R>;
  (t1: T1, t2: T2, t3: T3, t4: T4): CurriedFunction1<T5, R>;
  (t1: __, t2: __, t3: __, t4: __, t5: T5): CurriedFunction4<T1, T2, T3, T4, R>;
  (t1: T1, t2: __, t3: __, t4: __, t5: T5): CurriedFunction3<T2, T3, T4, R>;
  (t1: __, t2: T2, t3: __, t4: __, t5: T5): CurriedFunction3<T1, T3, T4, R>;
  (t1: __, t2: __, t3: T3, t4: __, t5: T5): CurriedFunction3<T1, T2, T4, R>;
  (t1: __, t2: __, t3: __, t4: T4, t5: T5): CurriedFunction3<T1, T2, T3, R>;
  (t1: T1, t2: T2, t3: __, t4: __, t5: T5): CurriedFunction2<T3, T4, R>;
  (t1: T1, t2: __, t3: T3, t4: __, t5: T5): CurriedFunction2<T2, T4, R>;
  (t1: T1, t2: __, t3: __, t4: T4, t5: T5): CurriedFunction2<T2, T3, R>;
  (t1: __, t2: T2, t3: T3, t4: __, t5: T5): CurriedFunction2<T1, T4, R>;
  (t1: __, t2: T2, t3: __, t4: T4, t5: T5): CurriedFunction2<T1, T3, R>;
  (t1: __, t2: __, t3: T3, t4: T4, t5: T5): CurriedFunction2<T1, T2, R>;
  (t1: T1, t2: T2, t3: T3, t4: __, t5: T5): CurriedFunction1<T4, R>;
  (t1: T1, t2: T2, t3: __, t4: T4, t5: T5): CurriedFunction1<T3, R>;
  (t1: T1, t2: __, t3: T3, t4: T4, t5: T5): CurriedFunction1<T2, R>;
  (t1: __, t2: T2, t3: T3, t4: T4, t5: T5): CurriedFunction1<T1, R>;
  (t1: T1, t2: T2, t3: T3, t4: T4, t5: T5): R;
}

declare interface Curry {
  <T1, R>(func: (t1: T1) => R, arity?: number): CurriedFunction1<T1, R>;
  <T1, T2, R>(func: (t1: T1, t2: T2) => R, arity?: number): CurriedFunction2<T1, T2, R>;
  <T1, T2, T3, R>(func: (t1: T1, t2: T2, t3: T3) => R, arity?: number): CurriedFunction3<T1, T2, T3, R>;
  <T1, T2, T3, T4, R>(func: (t1: T1, t2: T2, t3: T3, t4: T4) => R, arity?: number): CurriedFunction4<T1, T2, T3, T4, R>;
  <T1, T2, T3, T4, T5, R>(
    func: (t1: T1, t2: T2, t3: T3, t4: T4, t5: T5) => R,
    arity?: number
  ): CurriedFunction5<T1, T2, T3, T4, T5, R>;
  (func: (...args: any[]) => any, arity?: number): (...args: any[]) => any;
  placeholder: __;
}

export declare const curry: (typeof _)['curry'];

declare interface CurryRight {
  <T1, R>(func: (t1: T1) => R, arity?: number): RightCurriedFunction1<T1, R>;
  <T1, T2, R>(func: (t1: T1, t2: T2) => R, arity?: number): RightCurriedFunction2<T1, T2, R>;
  <T1, T2, T3, R>(func: (t1: T1, t2: T2, t3: T3) => R, arity?: number): RightCurriedFunction3<T1, T2, T3, R>;
  <T1, T2, T3, T4, R>(
    func: (t1: T1, t2: T2, t3: T3, t4: T4) => R,
    arity?: number
  ): RightCurriedFunction4<T1, T2, T3, T4, R>;
  <T1, T2, T3, T4, T5, R>(
    func: (t1: T1, t2: T2, t3: T3, t4: T4, t5: T5) => R,
    arity?: number
  ): RightCurriedFunction5<T1, T2, T3, T4, T5, R>;
  (func: (...args: any[]) => any, arity?: number): (...args: any[]) => any;
  placeholder: __;
}

export declare const curryRight: (typeof _)['curryRight'];

export declare const debounce: (typeof _)['debounce'];

declare interface DebouncedFunc<T extends (...args: any[]) => any> {
  /**
   * Call the original function, but applying the debounce rules.
   *
   * If the debounced function can be run immediately, this calls it and returns its return
   * value.
   *
   * Otherwise, it returns the return value of the last invocation, or undefined if the debounced
   * function was not invoked yet.
   */
  (...args: Parameters<T>): ReturnType<T> | undefined;

  /**
   * Throw away any pending invocation of the debounced function.
   */
  cancel(): void;

  /**
   * If there is a pending invocation of the debounced function, invoke it immediately and return
   * its return value.
   *
   * Otherwise, return the value from the last invocation, or undefined if the debounced function
   * was never invoked.
   */
  flush(): ReturnType<T> | undefined;
}

declare interface DebouncedFuncLeading<T extends (...args: any[]) => any> extends DebouncedFunc<T> {
  (...args: Parameters<T>): ReturnType<T>;
  flush(): ReturnType<T>;
}

declare interface DebounceSettings {
  /**
   * @see _.leading
   */
  leading?: boolean | undefined;
  /**
   * @see _.maxWait
   */
  maxWait?: number | undefined;
  /**
   * @see _.trailing
   */
  trailing?: boolean | undefined;
}

declare interface DebounceSettingsLeading extends DebounceSettings {
  leading: true;
}

export declare const deburr: (typeof _)['deburr'];

export declare const defaults: (typeof _)['defaults'];

export declare const defaultsDeep: (typeof _)['defaultsDeep'];

export declare const defaultTo: (typeof _)['defaultTo'];

export declare const defer: (typeof _)['defer'];

export declare const delay: (typeof _)['delay'];

declare interface Dictionary<T> {
  [index: string]: T;
}

declare type DictionaryIterator<T, TResult> = ObjectIterator<Dictionary<T>, TResult>;

export declare const difference: (typeof _)['difference'];

export declare const differenceBy: (typeof _)['differenceBy'];

export declare const differenceWith: (typeof _)['differenceWith'];

export declare const divide: (typeof _)['divide'];

export declare const drop: (typeof _)['drop'];

export declare const dropRight: (typeof _)['dropRight'];

export declare const dropRightWhile: (typeof _)['dropRightWhile'];

export declare const dropWhile: (typeof _)['dropWhile'];

export declare const each: (typeof _)['each'];

export declare const eachRight: (typeof _)['eachRight'];

declare type EmptyObject<T> = { [K in keyof T]?: never };

declare type EmptyObjectOf<T> = EmptyObject<T> extends T ? EmptyObject<T> : never;

export declare const endsWith: (typeof _)['endsWith'];

export declare const entries: (typeof _)['entries'];

export declare const entriesIn: (typeof _)['entriesIn'];

export declare const eq: (typeof _)['eq'];

declare const escape_2: (typeof _)['escape'];
export { escape_2 as escape };

export declare const escapeRegExp: (typeof _)['escapeRegExp'];

export declare const every: (typeof _)['every'];

declare type ExpChain<T> = T extends { __trapAny: any }
  ? CollectionChain<any> & FunctionChain<any> & ObjectChain<any> & PrimitiveChain<any> & StringChain
  : T extends null | undefined
    ? never
    : T extends string
      ? StringChain
      : T extends string | null | undefined
        ? StringNullableChain
        : T extends (...args: any) => any
          ? FunctionChain<T>
          : T extends List<infer U> | null | undefined
            ? CollectionChain<U>
            : T extends object | null | undefined
              ? ObjectChain<T>
              : PrimitiveChain<T>;

export declare const extend: (typeof _)['extend'];

export declare const extendWith: (typeof _)['extendWith'];

declare type Falsey = null | undefined | false | '' | 0 | 0n;

declare type FieldWithPossiblyUndefined<T, Key> = GetFieldType<Exclude<T, undefined>, Key> | Extract<T, undefined>;

export declare const fill: (typeof _)['fill'];

export declare const filter: (typeof _)['filter'];

export declare const find: (typeof _)['find'];

export declare const findIndex: (typeof _)['findIndex'];

export declare const findKey: (typeof _)['findKey'];

export declare const findLast: (typeof _)['findLast'];

export declare const findLastIndex: (typeof _)['findLastIndex'];

export declare const findLastKey: (typeof _)['findLastKey'];

export declare const first: (typeof _)['first'];

declare type Flat<T> = T extends string ? T : T extends List<any> ? never : T;

export declare const flatMap: (typeof _)['flatMap'];

export declare const flatMapDeep: (typeof _)['flatMapDeep'];

export declare const flatMapDepth: (typeof _)['flatMapDepth'];

export declare const flatten: (typeof _)['flatten'];

export declare const flattenDeep: (typeof _)['flattenDeep'];

export declare const flattenDepth: (typeof _)['flattenDepth'];

export declare const flip: (typeof _)['flip'];

export declare const floor: (typeof _)['floor'];

export declare const flow: (typeof _)['flow'];

export declare const flowRight: (typeof _)['flowRight'];

export declare const forEach: (typeof _)['forEach'];

export declare const forEachRight: (typeof _)['forEachRight'];

export declare const forIn: (typeof _)['forIn'];

export declare const forInRight: (typeof _)['forInRight'];

export declare const forOwn: (typeof _)['forOwn'];

export declare const forOwnRight: (typeof _)['forOwnRight'];

export declare const fromPairs: (typeof _)['fromPairs'];

declare type Function0<R> = () => R;

declare type Function1<T1, R> = (t1: T1) => R;

declare type Function2<T1, T2, R> = (t1: T1, t2: T2) => R;

declare type Function3<T1, T2, T3, R> = (t1: T1, t2: T2, t3: T3) => R;

declare type Function4<T1, T2, T3, T4, R> = (t1: T1, t2: T2, t3: T3, t4: T4) => R;

declare type FunctionBase = Function;

declare interface FunctionBind {
  /**
   * @see _.placeholder
   */
  placeholder: __;
  (func: (...args: any[]) => any, thisArg: any, ...partials: any[]): (...args: any[]) => any;
}

declare interface FunctionBindKey {
  placeholder: __;
  (object: object, key: string, ...partials: any[]): (...args: any[]) => any;
}

declare interface FunctionChain<T extends (...args: any) => any> extends LoDashExplicitWrapper<T> {}

declare interface FunctionChain<T extends (...args: any) => any> {
  /**
   * @see _.ary
   */
  ary(n?: number): FunctionChain<(...args: any[]) => any>;
}

declare interface FunctionChain<T extends (...args: any) => any> {
  /**
   * @see _.curry
   */
  curry(
    arity?: number
  ): T extends (arg1: infer T1) => infer R
    ? FunctionChain<CurriedFunction1<T1, R>>
    : T extends (arg1: infer T1, arg2: infer T2) => infer R
      ? FunctionChain<CurriedFunction2<T1, T2, R>>
      : T extends (arg1: infer T1, arg2: infer T2, arg3: infer T3) => infer R
        ? FunctionChain<CurriedFunction3<T1, T2, T3, R>>
        : T extends (arg1: infer T1, arg2: infer T2, arg3: infer T3, arg4: infer T4) => infer R
          ? FunctionChain<CurriedFunction4<T1, T2, T3, T4, R>>
          : T extends (arg1: infer T1, arg2: infer T2, arg3: infer T3, arg4: infer T4, arg5: infer T5) => infer R
            ? FunctionChain<CurriedFunction5<T1, T2, T3, T4, T5, R>>
            : FunctionChain<(...args: any[]) => any>;
}

declare interface FunctionChain<T extends (...args: any) => any> {
  /**
   * @see _.curryRight
   */
  curryRight(
    arity?: number
  ): T extends (arg1: infer T1) => infer R
    ? FunctionChain<RightCurriedFunction1<T1, R>>
    : T extends (arg1: infer T1, arg2: infer T2) => infer R
      ? FunctionChain<RightCurriedFunction2<T1, T2, R>>
      : T extends (arg1: infer T1, arg2: infer T2, arg3: infer T3) => infer R
        ? FunctionChain<RightCurriedFunction3<T1, T2, T3, R>>
        : T extends (arg1: infer T1, arg2: infer T2, arg3: infer T3, arg4: infer T4) => infer R
          ? FunctionChain<RightCurriedFunction4<T1, T2, T3, T4, R>>
          : T extends (arg1: infer T1, arg2: infer T2, arg3: infer T3, arg4: infer T4, arg5: infer T5) => infer R
            ? FunctionChain<RightCurriedFunction5<T1, T2, T3, T4, T5, R>>
            : FunctionChain<(...args: any[]) => any>;
}

declare interface FunctionChain<T extends (...args: any) => any> {
  /**
   * @see _.debounce
   */
  debounce(
    wait: number | undefined,
    options: DebounceSettingsLeading
  ): T extends (...args: any[]) => any ? FunctionChain<DebouncedFuncLeading<T>> : never;
  debounce(
    wait?: number,
    options?: DebounceSettings
  ): T extends (...args: any[]) => any ? FunctionChain<DebouncedFunc<T>> : never;
}

declare interface FunctionChain<T extends (...args: any) => any> {
  /**
   * @see _.flip
   */
  flip(): this;
}

declare interface FunctionChain<T extends (...args: any) => any> {
  /**
   * @see _.memoize
   */
  memoize(resolver?: (...args: any[]) => any): FunctionChain<T & MemoizedFunction>;
}

declare interface FunctionChain<T extends (...args: any) => any> {
  /**
   * @see _.negate
   */
  negate(): FunctionChain<(...args: Parameters<T>) => boolean>;
}

declare interface FunctionChain<T extends (...args: any) => any> {
  /**
   * @see _.once
   */
  once(): FunctionChain<T>;
}

declare interface FunctionChain<T extends (...args: any) => any> {
  /**
   * @see _.overArgs
   */
  overArgs(...transforms: Array<Many<(...args: any[]) => any>>): FunctionChain<(...args: any[]) => any>;
}

declare interface FunctionChain<T extends (...args: any) => any> {
  /**
   * @see _.partial
   */
  partial<T2>(
    plc1: __,
    arg2: T2
  ): FunctionChain<
    T extends Function2<infer T1, T2, infer R>
      ? Function1<T1, R>
      : T extends Function3<infer T1, T2, infer T3, infer R>
        ? Function2<T1, T3, R>
        : T extends Function4<infer T1, T2, infer T3, infer T4, infer R>
          ? Function3<T1, T3, T4, R>
          : any
  >;
  /**
   * @see _.partial
   */
  partial<T3>(
    plc1: __,
    plc2: __,
    arg3: T3
  ): FunctionChain<
    T extends Function3<infer T1, infer T2, T3, infer R>
      ? Function2<T1, T2, R>
      : T extends Function4<infer T1, infer T2, T3, infer T4, infer R>
        ? Function3<T1, T2, T4, R>
        : any
  >;
  /**
   * @see _.partial
   */
  partial<T1, T3>(
    arg1: T1,
    plc2: __,
    arg3: T3
  ): FunctionChain<
    T extends Function3<T1, infer T2, T3, infer R>
      ? Function1<T2, R>
      : T extends Function4<T1, infer T2, T3, infer T4, infer R>
        ? Function2<T2, T4, R>
        : any
  >;
  /**
   * @see _.partial
   */
  partial<T2, T3>(
    plc1: __,
    arg2: T2,
    arg3: T3
  ): FunctionChain<
    T extends Function3<infer T1, T2, T3, infer R>
      ? Function1<T1, R>
      : T extends Function4<infer T1, T2, T3, infer T4, infer R>
        ? Function2<T1, T4, R>
        : any
  >;
  /**
   * @see _.partial
   */
  partial<T3>(
    plc1: __,
    plc2: __,
    arg3: T3
  ): FunctionChain<T extends Function4<infer T1, infer T2, T3, infer T4, infer R> ? Function3<T1, T2, T4, R> : any>;
  /**
   * @see _.partial
   */
  partial<T1, T4>(
    arg1: T1,
    plc2: __,
    plc3: __,
    arg4: T4
  ): FunctionChain<T extends Function4<T1, infer T2, infer T3, T4, infer R> ? Function2<T2, T3, R> : any>;
  /**
   * @see _.partial
   */
  partial<T2, T4>(
    plc1: __,
    arg2: T2,
    plc3: __,
    arg4: T4
  ): FunctionChain<T extends Function4<infer T1, T2, infer T3, T4, infer R> ? Function2<T1, T3, R> : any>;
  /**
   * @see _.partial
   */
  partial<T1, T2, T4>(
    arg1: T1,
    arg2: T2,
    plc3: __,
    arg4: T4
  ): FunctionChain<T extends Function4<T1, T2, infer T3, T4, infer R> ? Function1<T3, R> : any>;
  /**
   * @see _.partial
   */
  partial<T3, T4>(
    plc1: __,
    plc2: __,
    arg3: T3,
    arg4: T4
  ): FunctionChain<T extends Function4<infer T1, infer T2, T3, T4, infer R> ? Function2<T1, T2, R> : any>;
  /**
   * @see _.partial
   */
  partial<T1, T3, T4>(
    arg1: T1,
    plc2: __,
    arg3: T3,
    arg4: T4
  ): FunctionChain<T extends Function4<T1, infer T2, T3, T4, infer R> ? Function1<T2, R> : any>;
  /**
   * @see _.partial
   */
  partial<T2, T3, T4>(
    plc1: __,
    arg2: T2,
    arg3: T3,
    arg4: T4
  ): FunctionChain<T extends Function4<infer T1, T2, T3, T4, infer R> ? Function1<T1, R> : any>;
  /**
   * @see _.partial
   */
  partial<T1, T2, T3, T4>(
    arg1: T1,
    arg2: T2,
    arg3: T3,
    arg4: T4
  ): FunctionChain<T extends (t1: T1, t2: T2, t3: T3, t4: T4, ...ts: infer TS) => infer R ? (...ts: TS) => R : any>;
  /**
   * @see _.partial
   */
  partial<T1, T2, T3>(
    arg1: T1,
    arg2: T2,
    arg3: T3
  ): FunctionChain<T extends (t1: T1, t2: T2, t3: T3, ...ts: infer TS) => infer R ? (...ts: TS) => R : any>;
  /**
   * @see _.partial
   */
  partial<T1, T2>(
    arg1: T1,
    arg2: T2
  ): FunctionChain<T extends (t1: T1, t2: T2, ...ts: infer TS) => infer R ? (...ts: TS) => R : any>;
  /**
   * @see _.partial
   */
  partial<T1>(arg1: T1): FunctionChain<T extends (t1: T1, ...ts: infer TS) => infer R ? (...ts: TS) => R : any>;
  /**
   * @see _.partial
   */
  partial(): FunctionChain<T extends (...ts: any[]) => any ? T : any>;
}

declare interface FunctionChain<T extends (...args: any) => any> {
  /**
   * @see _.partialRight
   */
  partialRight<T1>(
    arg1: T1,
    plc2: __
  ): FunctionChain<T extends Function2<T1, infer T2, infer R> ? Function1<T2, R> : any>;
  /**
   * @see _.partialRight
   */
  partialRight<T2>(arg2: T2): FunctionChain<T extends Function2<infer T1, T2, infer R> ? Function1<T1, R> : any>;
  /**
   * @see _.partialRight
   */
  partialRight<T1>(
    arg1: T1,
    plc2: __,
    plc3: __
  ): FunctionChain<T extends Function3<T1, infer T2, infer T3, infer R> ? Function2<T2, T3, R> : any>;
  /**
   * @see _.partialRight
   */
  partialRight<T2>(
    arg2: T2,
    plc3: __
  ): FunctionChain<T extends Function3<infer T1, T2, infer T3, infer R> ? Function2<T1, T3, R> : any>;
  /**
   * @see _.partialRight
   */
  partialRight<T1, T2>(
    arg1: T1,
    arg2: T2,
    plc3: __
  ): FunctionChain<T extends Function3<T1, T2, infer T3, infer R> ? Function1<T3, R> : any>;
  /**
   * @see _.partialRight
   */
  partialRight<T3>(
    arg3: T3
  ): FunctionChain<T extends Function3<infer T1, infer T2, T3, infer R> ? Function2<T1, T2, R> : any>;
  /**
   * @see _.partialRight
   */
  partialRight<T1, T3>(
    arg1: T1,
    plc2: __,
    arg3: T3
  ): FunctionChain<T extends Function3<T1, infer T2, T3, infer R> ? Function1<T2, R> : any>;
  /**
   * @see _.partialRight
   */
  partialRight<T2, T3>(
    arg2: T2,
    arg3: T3
  ): FunctionChain<T extends Function3<infer T1, T2, T3, infer R> ? Function1<T1, R> : any>;
  /**
   * @see _.partialRight
   */
  partialRight<T1>(
    arg1: T1,
    plc2: __,
    plc3: __,
    plc4: __
  ): FunctionChain<T extends Function4<T1, infer T2, infer T3, infer T4, infer R> ? Function3<T2, T3, T4, R> : any>;
  /**
   * @see _.partialRight
   */
  partialRight<T2>(
    arg2: T2,
    plc3: __,
    plc4: __
  ): FunctionChain<T extends Function4<infer T1, T2, infer T3, infer T4, infer R> ? Function3<T1, T3, T4, R> : any>;
  /**
   * @see _.partialRight
   */
  partialRight<T1, T2>(
    arg1: T1,
    arg2: T2,
    plc3: __,
    plc4: __
  ): FunctionChain<T extends Function4<T1, T2, infer T3, infer T4, infer R> ? Function2<T3, T4, R> : any>;
  /**
   * @see _.partialRight
   */
  partialRight<T3>(
    arg3: T3,
    plc4: __
  ): FunctionChain<T extends Function4<infer T1, infer T2, T3, infer T4, infer R> ? Function3<T1, T2, T4, R> : any>;
  /**
   * @see _.partialRight
   */
  partialRight<T1, T3>(
    arg1: T1,
    plc2: __,
    arg3: T3,
    plc4: __
  ): FunctionChain<T extends Function4<T1, infer T2, infer T3, infer T4, infer R> ? Function2<T2, T4, R> : any>;
  /**
   * @see _.partialRight
   */
  partialRight<T2, T3>(
    arg2: T2,
    arg3: T3,
    plc4: __
  ): FunctionChain<T extends Function4<infer T1, T2, T3, infer T4, infer R> ? Function2<T1, T4, R> : any>;
  /**
   * @see _.partialRight
   */
  partialRight<T1, T2, T3>(
    arg1: T1,
    arg2: T2,
    arg3: T3,
    plc4: __
  ): FunctionChain<T extends Function4<T1, T2, T3, infer T4, infer R> ? Function1<T4, R> : any>;
  /**
   * @see _.partialRight
   */
  partialRight<T4>(
    arg4: T4
  ): FunctionChain<T extends Function4<infer T1, infer T2, infer T3, T4, infer R> ? Function3<T1, T2, T3, R> : any>;
  /**
   * @see _.partialRight
   */
  partialRight<T1, T4>(
    arg1: T1,
    plc2: __,
    plc3: __,
    arg4: T4
  ): FunctionChain<T extends Function4<T1, infer T2, infer T3, T4, infer R> ? Function2<T2, T3, R> : any>;
  /**
   * @see _.partialRight
   */
  partialRight<T2, T4>(
    arg2: T2,
    plc3: __,
    arg4: T4
  ): FunctionChain<T extends Function4<infer T1, T2, infer T3, T4, infer R> ? Function2<T1, T3, R> : any>;
  /**
   * @see _.partialRight
   */
  partialRight<T1, T2, T4>(
    arg1: T1,
    arg2: T2,
    plc3: __,
    arg4: T4
  ): FunctionChain<T extends Function4<T1, T2, infer T3, T4, infer R> ? Function1<T3, R> : any>;
  /**
   * @see _.partialRight
   */
  partialRight<T3, T4>(
    arg3: T3,
    arg4: T4
  ): FunctionChain<T extends Function4<infer T1, infer T2, T3, T4, infer R> ? Function2<T1, T2, R> : any>;
  /**
   * @see _.partialRight
   */
  partialRight<T1, T3, T4>(
    arg1: T1,
    plc2: __,
    arg3: T3,
    arg4: T4
  ): FunctionChain<T extends Function4<T1, infer T2, T3, T4, infer R> ? Function1<T2, R> : any>;
  /**
   * @see _.partialRight
   */
  partialRight<T2, T3, T4>(
    arg2: T2,
    arg3: T3,
    arg4: T4
  ): FunctionChain<T extends Function4<infer T1, T2, T3, T4, infer R> ? Function1<T1, R> : any>;
  /**
   * @see _.partialRight
   */
  partialRight<TS extends any[]>(...ts: TS): FunctionChain<T extends (...args: TS) => infer R ? () => R : any>;
  /**
   * @see _.partialRight
   */
  partialRight(): FunctionChain<T extends (...ts: any[]) => any ? T : any>;
}

declare interface FunctionChain<T extends (...args: any) => any> {
  /**
   * @see _.rearg
   */
  rearg(...indexes: Array<Many<number>>): FunctionChain<(...args: any[]) => any>;
}

declare interface FunctionChain<T extends (...args: any) => any> {
  /**
   * @see _.rest
   */
  rest(start?: number): FunctionChain<(...args: any[]) => any>;
}

declare interface FunctionChain<T extends (...args: any) => any> {
  /**
   * @see _.spread
   */
  spread(start?: number): FunctionChain<(...args: any[]) => ReturnType<T>>;
}

declare interface FunctionChain<T extends (...args: any) => any> {
  /**
   * @see _.throttle
   */
  throttle(
    wait?: number,
    options?: ThrottleSettings
  ): T extends (...args: any[]) => any ? FunctionChain<DebouncedFunc<T>> : never;
}

declare interface FunctionChain<T extends (...args: any) => any> {
  /**
   * @see _.unary
   */
  unary(): FunctionChain<(arg1: Parameters<T>['0']) => ReturnType<T>>;
}

declare interface FunctionChain<T extends (...args: any) => any> {
  /**
   * @see _.castArray
   */
  castArray(): CollectionChain<T>;
}

declare interface FunctionChain<T> {
  /**
   * @see _.flow
   */
  flow<R2, R3, R4, R5, R6, R7>(
    f2: (a: ReturnType<T>) => R2,
    f3: (a: R2) => R3,
    f4: (a: R3) => R4,
    f5: (a: R4) => R5,
    f6: (a: R5) => R6,
    f7: (a: R6) => R7
  ): FunctionChain<(...args: Parameters<T>) => R7>;
  /**
   * @see _.flow
   */
  flow<R2, R3, R4, R5, R6, R7>(
    f2: (a: ReturnType<T>) => R2,
    f3: (a: R2) => R3,
    f4: (a: R3) => R4,
    f5: (a: R4) => R5,
    f6: (a: R5) => R6,
    f7: (a: R6) => R7,
    ...func: Array<Many<(a: any) => any>>
  ): FunctionChain<(...args: Parameters<T>) => any>;
  /**
   * @see _.flow
   */
  flow<R2, R3, R4, R5, R6>(
    f2: (a: ReturnType<T>) => R2,
    f3: (a: R2) => R3,
    f4: (a: R3) => R4,
    f5: (a: R4) => R5,
    f6: (a: R5) => R6
  ): FunctionChain<(...args: Parameters<T>) => R6>;
  /**
   * @see _.flow
   */
  flow<R2, R3, R4, R5>(
    f2: (a: ReturnType<T>) => R2,
    f3: (a: R2) => R3,
    f4: (a: R3) => R4,
    f5: (a: R4) => R5
  ): FunctionChain<(...args: Parameters<T>) => R5>;
  /**
   * @see _.flow
   */
  flow<R2, R3, R4>(
    f2: (a: ReturnType<T>) => R2,
    f3: (a: R2) => R3,
    f4: (a: R3) => R4
  ): FunctionChain<(...args: Parameters<T>) => R4>;
  /**
   * @see _.flow
   */
  flow<R2, R3>(f2: (a: ReturnType<T>) => R2, f3: (a: R2) => R3): FunctionChain<(...args: Parameters<T>) => R3>;
  /**
   * @see _.flow
   */
  flow<R2>(f2: (a: ReturnType<T>) => R2): FunctionChain<(...args: Parameters<T>) => R2>;
  /**
   * @see _.flow
   */
  flow(...func: Array<Many<(...args: any[]) => any>>): FunctionChain<(...args: any[]) => any>;
}

declare interface FunctionChain<T> {
  /**
   * @see _.flowRight
   */
  flowRight<A extends any[], R1, R2, R3, R4, R5>(
    f6: (a: R5) => Parameters<T>['0'],
    f5: (a: R4) => R5,
    f4: (a: R3) => R4,
    f3: (a: R2) => R3,
    f2: (a: R1) => R2,
    f1: (...args: A) => R1
  ): FunctionChain<(...args: A) => ReturnType<T>>;
  /**
   * @see _.flowRight
   */
  flowRight<A extends any[], R1, R2, R3, R4>(
    f5: (a: R4) => Parameters<T>['0'],
    f4: (a: R3) => R4,
    f3: (a: R2) => R3,
    f2: (a: R1) => R2,
    f1: (...args: A) => R1
  ): FunctionChain<(...args: A) => ReturnType<T>>;
  /**
   * @see _.flowRight
   */
  flowRight<A extends any[], R1, R2, R3>(
    f4: (a: R3) => Parameters<T>['0'],
    f3: (a: R2) => R3,
    f2: (a: R1) => R2,
    f1: (...args: A) => R1
  ): FunctionChain<(...args: A) => ReturnType<T>>;
  /**
   * @see _.flowRight
   */
  flowRight<A extends any[], R1, R2>(
    f3: (a: R2) => Parameters<T>['0'],
    f2: (a: R1) => R2,
    f1: (...args: A) => R1
  ): FunctionChain<(...args: A) => ReturnType<T>>;
  /**
   * @see _.flowRight
   */
  flowRight<A extends any[], R1>(
    f2: (a: R1) => Parameters<T>['0'],
    f1: (...args: A) => R1
  ): FunctionChain<(...args: A) => ReturnType<T>>;
  /**
   * @see _.flowRight
   */
  flowRight<A extends any[]>(f1: (...args: A) => Parameters<T>['0']): FunctionChain<(...args: A) => ReturnType<T>>;
  /**
   * @see _.flowRight
   */
  flowRight(...func: Array<Many<(...args: any[]) => any>>): FunctionChain<(...args: any[]) => any>;
}

declare interface FunctionChain<T extends (...args: any) => any> {
  /**
   * @see _.iteratee
   */
  iteratee(): FunctionChain<T>;
}

declare interface FunctionChain<T> {
  /**
   * @see _.over
   */
  over<TResult>(
    ...iteratees: Array<Many<(...args: any[]) => TResult>>
  ): FunctionChain<(...args: any[]) => Array<ReturnType<T> | TResult>>;
}

declare interface FunctionChain<T> {
  /**
   * @see _.overEvery
   */
  overEvery<TArgs>(
    ...iteratees: Array<Many<(...args: TArgs[]) => boolean>>
  ): FunctionChain<(...args: Parameters<T> | TArgs[]) => boolean>;
}

declare interface FunctionChain<T> {
  /**
   * @see _.overSome
   */
  overSome<TArgs>(
    ...iteratees: Array<Many<(...args: TArgs[]) => boolean>>
  ): FunctionChain<(...args: Parameters<T> | TArgs[]) => boolean>;
}

export declare const functions: (typeof _)['functions'];

export declare const functionsIn: (typeof _)['functionsIn'];

export declare const get: (typeof _)['get'];

declare type GetFieldType<T, P> = P extends `${infer Left}.${infer Right}`
  ? Left extends keyof Exclude<T, undefined>
    ? FieldWithPossiblyUndefined<Exclude<T, undefined>[Left], Right> | Extract<T, undefined>
    : Left extends `${infer FieldKey}[${infer IndexKey}]`
      ? FieldKey extends keyof T
        ? FieldWithPossiblyUndefined<IndexedFieldWithPossiblyUndefined<T[FieldKey], IndexKey>, Right>
        : undefined
      : undefined
  : P extends keyof T
    ? T[P]
    : P extends `${infer FieldKey}[${infer IndexKey}]`
      ? FieldKey extends keyof T
        ? IndexedFieldWithPossiblyUndefined<T[FieldKey], IndexKey>
        : undefined
      : IndexedFieldWithPossiblyUndefined<T, P>;

declare type GetIndexedField<T, K> = K extends keyof T
  ? T[K]
  : K extends `${number}`
    ? 'length' extends keyof T
      ? number extends T['length']
        ? number extends keyof T
          ? T[number]
          : undefined
        : undefined
      : undefined
    : undefined;

export declare const groupBy: (typeof _)['groupBy'];

export declare const gt: (typeof _)['gt'];

export declare const gte: (typeof _)['gte'];

export declare const has: (typeof _)['has'];

export declare const hasIn: (typeof _)['hasIn'];

export declare const head: (typeof _)['head'];

export declare const identity: (typeof _)['identity'];

declare type ImpChain<T> = T extends { __trapAny: any }
  ? Collection<any> & LoDashFunction<any> & Object_2<any> & Primitive<any> & String_2
  : T extends null | undefined
    ? never
    : T extends string | null | undefined
      ? String_2
      : T extends (...args: any) => any
        ? LoDashFunction<T>
        : T extends List<infer U> | null | undefined
          ? Collection<U>
          : T extends object | null | undefined
            ? Object_2<T>
            : Primitive<T>;

export declare const includes: (typeof _)['includes'];

declare type IndexedFieldWithPossiblyUndefined<T, Key> =
  | GetIndexedField<Exclude<T, undefined>, Key>
  | Extract<T, undefined>;

export declare const indexOf: (typeof _)['indexOf'];

export declare const initial: (typeof _)['initial'];

export declare const inRange: (typeof _)['inRange'];

export declare const intersection: (typeof _)['intersection'];

export declare const intersectionBy: (typeof _)['intersectionBy'];

export declare const intersectionWith: (typeof _)['intersectionWith'];

export declare const invert: (typeof _)['invert'];

export declare const invertBy: (typeof _)['invertBy'];

export declare const invoke: (typeof _)['invoke'];

export declare const invokeMap: (typeof _)['invokeMap'];

export declare const isArguments: (typeof _)['isArguments'];

export declare const isArray: (typeof _)['isArray'];

export declare const isArrayBuffer: (typeof _)['isArrayBuffer'];

export declare const isArrayLike: (typeof _)['isArrayLike'];

export declare const isArrayLikeObject: (typeof _)['isArrayLikeObject'];

export declare const isBoolean: (typeof _)['isBoolean'];

export declare const isBuffer: (typeof _)['isBuffer'];

export declare const isDate: (typeof _)['isDate'];

export declare const isElement: (typeof _)['isElement'];

export declare const isEmpty: (typeof _)['isEmpty'];

export declare const isEqual: (typeof _)['isEqual'];

declare type IsEqualCustomizer = (
  value: any,
  other: any,
  indexOrKey: PropertyName | undefined,
  parent: any,
  otherParent: any,
  stack: any
) => boolean | undefined;

export declare const isEqualWith: (typeof _)['isEqualWith'];

export declare const isError: (typeof _)['isError'];

declare const isFinite_2: (typeof _)['isFinite'];
export { isFinite_2 as isFinite };

export declare const isFunction: (typeof _)['isFunction'];

export declare const isInteger: (typeof _)['isInteger'];

export declare const isLength: (typeof _)['isLength'];

export declare const isMap: (typeof _)['isMap'];

export declare const isMatch: (typeof _)['isMatch'];

export declare const isMatchWith: (typeof _)['isMatchWith'];

declare type isMatchWithCustomizer = (
  value: any,
  other: any,
  indexOrKey: PropertyName,
  object: object,
  source: object
) => boolean | undefined;

declare const isNaN_2: (typeof _)['isNaN'];
export { isNaN_2 as isNaN };

export declare const isNative: (typeof _)['isNative'];

export declare const isNil: (typeof _)['isNil'];

export declare const isNull: (typeof _)['isNull'];

export declare const isNumber: (typeof _)['isNumber'];

export declare const isObject: (typeof _)['isObject'];

export declare const isObjectLike: (typeof _)['isObjectLike'];

export declare const isPlainObject: (typeof _)['isPlainObject'];

export declare const isRegExp: (typeof _)['isRegExp'];

export declare const isSafeInteger: (typeof _)['isSafeInteger'];

export declare const isSet: (typeof _)['isSet'];

export declare const isString: (typeof _)['isString'];

export declare const isSymbol: (typeof _)['isSymbol'];

export declare const isTypedArray: (typeof _)['isTypedArray'];

export declare const isUndefined: (typeof _)['isUndefined'];

export declare const isWeakMap: (typeof _)['isWeakMap'];

export declare const isWeakSet: (typeof _)['isWeakSet'];

export declare const iteratee: (typeof _)['iteratee'];

declare type IterateeShorthand<T> = PropertyName | [PropertyName, any] | PartialShallow<T>;

export declare const join: (typeof _)['join'];

export declare const kebabCase: (typeof _)['kebabCase'];

export declare const keyBy: (typeof _)['keyBy'];

export declare const keys: (typeof _)['keys'];

export declare const keysIn: (typeof _)['keysIn'];

export declare const last: (typeof _)['last'];

export declare const lastIndexOf: (typeof _)['lastIndexOf'];

/** Common interface between Arrays and jQuery objects */
declare type List<T> = ArrayLike<T>;

declare type ListIteratee<T> = ListIterator<T, NotVoid> | IterateeShorthand<T>;

declare type ListIterateeCustom<T, TResult> = ListIterator<T, TResult> | IterateeShorthand<T>;

declare type ListIterator<T, TResult> = (value: T, index: number, collection: List<T>) => TResult;

declare type ListIteratorTypeGuard<T, S extends T> = (value: T, index: number, collection: List<T>) => value is S;

declare interface ListOfRecursiveArraysOrValues<T> extends List<T | RecursiveArray<T>> {}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.invokeMap
   */
  invokeMap(methodName: string, ...args: any[]): CollectionChain<any>;
  /**
   * @see _.invokeMap
   */
  invokeMap<TResult>(method: (...args: any[]) => TResult, ...args: any[]): CollectionChain<TResult>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.size
   */
  size(): PrimitiveChain<number>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.now
   */
  now(): PrimitiveChain<number>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.bind
   */
  bind(thisArg: any, ...partials: any[]): FunctionChain<(...args: any[]) => any>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.bindKey
   */
  bindKey(key: string, ...partials: any[]): FunctionChain<(...args: any[]) => any>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.defer
   */
  defer(...args: any[]): PrimitiveChain<number>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.delay
   */
  delay(wait: number, ...args: any[]): PrimitiveChain<number>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.wrap
   */
  wrap<TArgs, TResult>(
    wrapper: (value: TValue, ...args: TArgs[]) => TResult
  ): FunctionChain<(...args: TArgs[]) => TResult>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.clone
   */
  clone(): this;
  /**
   * @see _.cloneDeep
   */
  cloneDeep(): this;
  /**
   * @see _.cloneDeepWith
   */
  cloneDeepWith(customizer: CloneDeepWithCustomizer<TValue>): LoDashExplicitWrapper<any>;
  /**
   * @see _.cloneDeepWith
   */
  cloneDeepWith(): this;
  /**
   * @see _.cloneWith
   */
  cloneWith<TResult extends object | string | number | boolean | null>(
    customizer: CloneWithCustomizer<TValue, TResult>
  ): ExpChain<TResult>;
  /**
   * @see _.cloneWith
   */
  cloneWith<TResult>(customizer: CloneWithCustomizer<TValue, TResult | undefined>): ExpChain<TResult | TValue>;
  /**
   * @see _.cloneWith
   */
  cloneWith(): this;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.conformsTo
   */
  conformsTo(source: ConformsPredicateObject<TValue>): PrimitiveChain<boolean>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.eq
   */
  eq(other: any): PrimitiveChain<boolean>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.gt
   */
  gt(other: any): PrimitiveChain<boolean>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.gte
   */
  gte(other: any): PrimitiveChain<boolean>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.isArguments
   */
  isArguments(): PrimitiveChain<boolean>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.isArray
   */
  isArray(): PrimitiveChain<boolean>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.isArrayBuffer
   */
  isArrayBuffer(): PrimitiveChain<boolean>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.isArrayLike
   */
  isArrayLike(): PrimitiveChain<boolean>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.isArrayLikeObject
   */
  isArrayLikeObject(): PrimitiveChain<boolean>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.isBoolean
   */
  isBoolean(): PrimitiveChain<boolean>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.isBuffer
   */
  isBuffer(): PrimitiveChain<boolean>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.isDate
   */
  isDate(): PrimitiveChain<boolean>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.isElement
   */
  isElement(): PrimitiveChain<boolean>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.isEmpty
   */
  isEmpty(): PrimitiveChain<boolean>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.isEqual
   */
  isEqual(other: any): PrimitiveChain<boolean>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.isEqualWith
   */
  isEqualWith(other: any, customizer?: IsEqualCustomizer): PrimitiveChain<boolean>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.isError
   */
  isError(): PrimitiveChain<boolean>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.isFinite
   */
  isFinite(): PrimitiveChain<boolean>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.isFunction
   */
  isFunction(): PrimitiveChain<boolean>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.isInteger
   */
  isInteger(): PrimitiveChain<boolean>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.isLength
   */
  isLength(): PrimitiveChain<boolean>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.isMap
   */
  isMap(): PrimitiveChain<boolean>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.isMatch
   */
  isMatch(source: object): PrimitiveChain<boolean>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.isMatchWith
   */
  isMatchWith(source: object, customizer: isMatchWithCustomizer): PrimitiveChain<boolean>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.isNaN
   */
  isNaN(): PrimitiveChain<boolean>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.isNative
   */
  isNative(): PrimitiveChain<boolean>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.isNil
   */
  isNil(): PrimitiveChain<boolean>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.isNull
   */
  isNull(): PrimitiveChain<boolean>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.isNumber
   */
  isNumber(): PrimitiveChain<boolean>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.isObject
   */
  isObject(): PrimitiveChain<boolean>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.isObjectLike
   */
  isObjectLike(): PrimitiveChain<boolean>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.isPlainObject
   */
  isPlainObject(): PrimitiveChain<boolean>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.isRegExp
   */
  isRegExp(): PrimitiveChain<boolean>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.isSafeInteger
   */
  isSafeInteger(): PrimitiveChain<boolean>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.isSet
   */
  isSet(): PrimitiveChain<boolean>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.isString
   */
  isString(): PrimitiveChain<boolean>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.isSymbol
   */
  isSymbol(): PrimitiveChain<boolean>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.isTypedArray
   */
  isTypedArray(): PrimitiveChain<boolean>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.isUndefined
   */
  isUndefined(): PrimitiveChain<boolean>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.isWeakMap
   */
  isWeakMap(): PrimitiveChain<boolean>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.isWeakSet
   */
  isWeakSet(): PrimitiveChain<boolean>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.lt
   */
  lt(other: any): PrimitiveChain<boolean>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.lte
   */
  lte(other: any): PrimitiveChain<boolean>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.toFinite
   */
  toFinite(): PrimitiveChain<number>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.toInteger
   */
  toInteger(): PrimitiveChain<number>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.toLength
   */
  toLength(): PrimitiveChain<number>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.toNumber
   */
  toNumber(): PrimitiveChain<number>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.toPlainObject
   */
  toPlainObject(): ObjectChain<any>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.toSafeInteger
   */
  toSafeInteger(): PrimitiveChain<number>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.add
   */
  add(addend: number): PrimitiveChain<number>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.ceil
   */
  ceil(precision?: number): PrimitiveChain<number>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.divide
   */
  divide(divisor: number): PrimitiveChain<number>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.floor
   */
  floor(precision?: number): PrimitiveChain<number>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.mean
   */
  mean(): PrimitiveChain<number>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.multiply
   */
  multiply(multiplicand: number): PrimitiveChain<number>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.round
   */
  round(precision?: number): PrimitiveChain<number>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.subtract
   */
  subtract(subtrahend: number): PrimitiveChain<number>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.sum
   */
  sum(): PrimitiveChain<number>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.clamp
   */
  clamp(lower: number, upper: number): PrimitiveChain<number>;
  /**
   * @see _.clamp
   */
  clamp(upper: number): PrimitiveChain<number>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.inRange
   */
  inRange(start: number, end?: number): PrimitiveChain<boolean>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.random
   */
  random(floating?: boolean): PrimitiveChain<number>;
  /**
   * @see _.random
   */
  random(max: number, floating?: boolean): PrimitiveChain<number>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.entries
   */
  entries(): CollectionChain<[string, any]>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.entriesIn
   */
  entriesIn(): CollectionChain<[string, any]>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.findKey
   */
  findKey(predicate?: ObjectIteratee<TValue>): StringNullableChain;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.findLastKey
   */
  findLastKey(predicate?: ObjectIteratee<TValue>): StringNullableChain;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.forIn
   */
  forIn(iteratee?: ObjectIterator<TValue, any>): this;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.forInRight
   */
  forInRight(iteratee?: ObjectIterator<TValue, any>): this;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.forOwn
   */
  forOwn(iteratee?: ObjectIterator<TValue, any>): this;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.forOwnRight
   */
  forOwnRight(iteratee?: ObjectIterator<TValue, any>): this;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.functions
   */
  functions(): CollectionChain<string>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.functionsIn
   */
  functionsIn(): CollectionChain<string>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.has
   */
  has(path: PropertyPath): PrimitiveChain<boolean>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.hasIn
   */
  hasIn(path: PropertyPath): PrimitiveChain<boolean>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.invert
   */
  invert(): ObjectChain<Dictionary<string>>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.invoke
   */
  invoke(path: PropertyPath, ...args: any[]): LoDashExplicitWrapper<any>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.keys
   */
  keys(): CollectionChain<string>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.keysIn
   */
  keysIn(): CollectionChain<string>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.result
   */
  result<TResult>(path: PropertyPath, defaultValue?: TResult | ((...args: any[]) => TResult)): ExpChain<TResult>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.set
   */
  set(path: PropertyPath, value: any): this;
  /**
   * @see _.set
   */
  set<TResult>(path: PropertyPath, value: any): ExpChain<TResult>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.setWith
   */
  setWith(path: PropertyPath, value: any, customizer?: SetWithCustomizer<TValue>): this;
  /**
   * @see _.setWith
   */
  setWith<TResult>(path: PropertyPath, value: any, customizer?: SetWithCustomizer<TValue>): ExpChain<TResult>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.toPairs
   */
  toPairs(): CollectionChain<
    [string, TValue extends Dictionary<infer U> ? U : TValue extends NumericDictionary<infer V> ? V : any]
  >;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.toPairsIn
   */
  toPairsIn(): CollectionChain<
    [string, TValue extends Dictionary<infer U> ? U : TValue extends NumericDictionary<infer V> ? V : any]
  >;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.unset
   */
  unset(path: PropertyPath): PrimitiveChain<boolean>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.update
   */
  update(path: PropertyPath, updater: (value: any) => any): ObjectChain<any>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.chain
   */
  chain(): this;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.commit
   */
  commit(): this;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.plant
   */
  plant(value: unknown): this;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.reverse
   */
  reverse(): this;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.toJSON
   */
  toJSON(): TValue;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.value
   */
  value(): TValue;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.valueOf
   */
  valueOf(): TValue;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.tap
   */
  tap(interceptor: (value: TValue) => void): this;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.thru
   */
  thru<TResult>(interceptor: (value: TValue) => TResult): ExpChain<TResult>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.camelCase
   */
  camelCase(): StringChain;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.capitalize
   */
  capitalize(): StringChain;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.deburr
   */
  deburr(): StringChain;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.endsWith
   */
  endsWith(target?: string, position?: number): PrimitiveChain<boolean>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.escape
   */
  escape(): StringChain;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.escapeRegExp
   */
  escapeRegExp(): StringChain;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.kebabCase
   */
  kebabCase(): StringChain;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.lowerCase
   */
  lowerCase(): StringChain;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.lowerFirst
   */
  lowerFirst(): StringChain;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.pad
   */
  pad(length?: number, chars?: string): StringChain;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.padEnd
   */
  padEnd(length?: number, chars?: string): StringChain;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.padStart
   */
  padStart(length?: number, chars?: string): StringChain;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.parseInt
   */
  parseInt(radix?: number): PrimitiveChain<number>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.repeat
   */
  repeat(n?: number): StringChain;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.replace
   */
  replace(pattern: RegExp | string, replacement: ReplaceFunction | string): StringChain;
  /**
   * @see _.replace
   */
  replace(replacement: ReplaceFunction | string): StringChain;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.snakeCase
   */
  snakeCase(): StringChain;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.split
   */
  split(separator?: RegExp | string, limit?: number): CollectionChain<string>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.startCase
   */
  startCase(): StringChain;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.startsWith
   */
  startsWith(target?: string, position?: number): PrimitiveChain<boolean>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.template
   */
  template(options?: TemplateOptions): FunctionChain<TemplateExecutor>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.toLower
   */
  toLower(): StringChain;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.toUpper
   */
  toUpper(): StringChain;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.trim
   */
  trim(chars?: string): StringChain;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.trimEnd
   */
  trimEnd(chars?: string): StringChain;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.trimStart
   */
  trimStart(chars?: string): StringChain;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.truncate
   */
  truncate(options?: TruncateOptions): StringChain;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.unescape
   */
  unescape(): StringChain;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.upperCase
   */
  upperCase(): StringChain;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.upperFirst
   */
  upperFirst(): StringChain;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.words
   */
  words(pattern?: string | RegExp): CollectionChain<string>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.attempt
   */
  attempt<TResult>(...args: any[]): ExpChain<TResult | Error>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.bindAll
   */
  bindAll(...methodNames: Array<Many<string>>): this;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.conforms
   */
  conforms(): FunctionChain<(value: ConformsPredicateObject<TValue>) => boolean>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.constant
   */
  constant(): FunctionChain<() => TValue>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.defaultTo
   */
  defaultTo(defaultValue: TValue): ExpChain<TValue>;
  /**
   * @see _.defaultTo
   */
  defaultTo<TDefault>(defaultValue: TDefault): ExpChain<TValue extends null | undefined ? TDefault : TValue | TDefault>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.identity
   */
  identity(): this;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.matches
   */
  matches<V>(): FunctionChain<(value: V) => boolean>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.matchesProperty
   */
  matchesProperty<SrcValue>(srcValue: SrcValue): FunctionChain<(value: any) => boolean>;
  /**
   * @see _.matchesProperty
   */
  matchesProperty<SrcValue, Value>(srcValue: SrcValue): FunctionChain<(value: Value) => boolean>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.method
   */
  method(...args: any[]): FunctionChain<(object: any) => any>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.methodOf
   */
  methodOf(...args: any[]): LoDashExplicitWrapper<(path: PropertyPath) => any>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.mixin
   */
  mixin(source: Dictionary<(...args: any[]) => any>, options?: MixinOptions): this;
  /**
   * @see _.mixin
   */
  mixin(options?: MixinOptions): LoDashExplicitWrapper<LoDashStatic>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.noConflict
   */
  noConflict(): LoDashExplicitWrapper<typeof _>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.noop
   */
  noop(...args: any[]): PrimitiveChain<undefined>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.nthArg
   */
  nthArg(): FunctionChain<(...args: any[]) => any>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.property
   */
  property<TObj, TResult>(): FunctionChain<(obj: TObj) => TResult>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.propertyOf
   */
  propertyOf(): LoDashExplicitWrapper<(path: PropertyPath) => any>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.range
   */
  range(end?: number, step?: number): CollectionChain<number>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.rangeRight
   */
  rangeRight(end?: number, step?: number): CollectionChain<number>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.stubArray
   */
  stubArray(): CollectionChain<any>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.stubFalse
   */
  stubFalse(): PrimitiveChain<false>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.stubObject
   */
  stubObject(): LoDashExplicitWrapper<any>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.stubString
   */
  stubString(): StringChain;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.stubTrue
   */
  stubTrue(): PrimitiveChain<true>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.times
   */
  times<TResult>(iteratee: (num: number) => TResult): CollectionChain<TResult>;
  /**
   * @see _.times
   */
  times(): CollectionChain<number>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.toPath
   */
  toPath(): CollectionChain<string>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.uniqueId
   */
  uniqueId(): StringChain;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.stubTrue
   */
  stubTrue(): LoDashExplicitWrapper<true>;
}

declare interface LoDashExplicitWrapper<TValue> {
  /**
   * @see _.stubFalse
   */
  stubFalse(): LoDashExplicitWrapper<false>;
}

declare interface LoDashFunction<T extends (...args: any) => any> extends LoDashImplicitWrapper<T> {}

declare interface LoDashFunction<T extends (...args: any) => any> {
  /**
   * @see _.ary
   */
  ary(n?: number): LoDashFunction<(...args: any[]) => any>;
}

declare interface LoDashFunction<T extends (...args: any) => any> {
  /**
   * @see _.curry
   */
  curry(
    arity?: number
  ): T extends (arg1: infer T1) => infer R
    ? LoDashFunction<CurriedFunction1<T1, R>>
    : T extends (arg1: infer T1, arg2: infer T2) => infer R
      ? LoDashFunction<CurriedFunction2<T1, T2, R>>
      : T extends (arg1: infer T1, arg2: infer T2, arg3: infer T3) => infer R
        ? LoDashFunction<CurriedFunction3<T1, T2, T3, R>>
        : T extends (arg1: infer T1, arg2: infer T2, arg3: infer T3, arg4: infer T4) => infer R
          ? LoDashFunction<CurriedFunction4<T1, T2, T3, T4, R>>
          : T extends (arg1: infer T1, arg2: infer T2, arg3: infer T3, arg4: infer T4, arg5: infer T5) => infer R
            ? LoDashFunction<CurriedFunction5<T1, T2, T3, T4, T5, R>>
            : LoDashFunction<(...args: any[]) => any>;
}

declare interface LoDashFunction<T extends (...args: any) => any> {
  /**
   * @see _.curryRight
   */
  curryRight(
    arity?: number
  ): T extends (arg1: infer T1) => infer R
    ? LoDashFunction<RightCurriedFunction1<T1, R>>
    : T extends (arg1: infer T1, arg2: infer T2) => infer R
      ? LoDashFunction<RightCurriedFunction2<T1, T2, R>>
      : T extends (arg1: infer T1, arg2: infer T2, arg3: infer T3) => infer R
        ? LoDashFunction<RightCurriedFunction3<T1, T2, T3, R>>
        : T extends (arg1: infer T1, arg2: infer T2, arg3: infer T3, arg4: infer T4) => infer R
          ? LoDashFunction<RightCurriedFunction4<T1, T2, T3, T4, R>>
          : T extends (arg1: infer T1, arg2: infer T2, arg3: infer T3, arg4: infer T4, arg5: infer T5) => infer R
            ? LoDashFunction<RightCurriedFunction5<T1, T2, T3, T4, T5, R>>
            : LoDashFunction<(...args: any[]) => any>;
}

declare interface LoDashFunction<T extends (...args: any) => any> {
  /**
   * @see _.debounce
   */
  debounce(
    wait: number | undefined,
    options: DebounceSettingsLeading
  ): T extends (...args: any[]) => any ? LoDashFunction<DebouncedFuncLeading<T>> : never;
  debounce(
    wait?: number,
    options?: DebounceSettings
  ): T extends (...args: any[]) => any ? LoDashFunction<DebouncedFunc<T>> : never;
}

declare interface LoDashFunction<T extends (...args: any) => any> {
  /**
   * @see _.flip
   */
  flip(): this;
}

declare interface LoDashFunction<T extends (...args: any) => any> {
  /**
   * @see _.memoize
   */
  memoize(resolver?: (...args: any[]) => any): LoDashFunction<T & MemoizedFunction>;
}

declare interface LoDashFunction<T extends (...args: any) => any> {
  /**
   * @see _.negate
   */
  negate(): LoDashFunction<(...args: Parameters<T>) => boolean>;
}

declare interface LoDashFunction<T extends (...args: any) => any> {
  /**
   * @see _.once
   */
  once(): LoDashFunction<T>;
}

declare interface LoDashFunction<T extends (...args: any) => any> {
  /**
   * @see _.overArgs
   */
  overArgs(...transforms: Array<Many<(...args: any[]) => any>>): LoDashFunction<(...args: any[]) => any>;
}

declare interface LoDashFunction<T extends (...args: any) => any> {
  /**
   * @see _.partial
   */
  partial<T2>(
    plc1: __,
    arg2: T2
  ): LoDashFunction<
    T extends Function2<infer T1, T2, infer R>
      ? Function1<T1, R>
      : T extends Function3<infer T1, T2, infer T3, infer R>
        ? Function2<T1, T3, R>
        : T extends Function4<infer T1, T2, infer T3, infer T4, infer R>
          ? Function3<T1, T3, T4, R>
          : any
  >;
  /**
   * @see _.partial
   */
  partial<T3>(
    plc1: __,
    plc2: __,
    arg3: T3
  ): LoDashFunction<
    T extends Function3<infer T1, infer T2, T3, infer R>
      ? Function2<T1, T2, R>
      : T extends Function4<infer T1, infer T2, T3, infer T4, infer R>
        ? Function3<T1, T2, T4, R>
        : any
  >;
  /**
   * @see _.partial
   */
  partial<T1, T3>(
    arg1: T1,
    plc2: __,
    arg3: T3
  ): LoDashFunction<
    T extends Function3<T1, infer T2, T3, infer R>
      ? Function1<T2, R>
      : T extends Function4<T1, infer T2, T3, infer T4, infer R>
        ? Function2<T2, T4, R>
        : any
  >;
  /**
   * @see _.partial
   */
  partial<T2, T3>(
    plc1: __,
    arg2: T2,
    arg3: T3
  ): LoDashFunction<
    T extends Function3<infer T1, T2, T3, infer R>
      ? Function1<T1, R>
      : T extends Function4<infer T1, T2, T3, infer T4, infer R>
        ? Function2<T1, T4, R>
        : any
  >;
  /**
   * @see _.partial
   */
  partial<T3>(
    plc1: __,
    plc2: __,
    arg3: T3
  ): LoDashFunction<T extends Function4<infer T1, infer T2, T3, infer T4, infer R> ? Function3<T1, T2, T4, R> : any>;
  /**
   * @see _.partial
   */
  partial<T1, T4>(
    arg1: T1,
    plc2: __,
    plc3: __,
    arg4: T4
  ): LoDashFunction<T extends Function4<T1, infer T2, infer T3, T4, infer R> ? Function2<T2, T3, R> : any>;
  /**
   * @see _.partial
   */
  partial<T2, T4>(
    plc1: __,
    arg2: T2,
    plc3: __,
    arg4: T4
  ): LoDashFunction<T extends Function4<infer T1, T2, infer T3, T4, infer R> ? Function2<T1, T3, R> : any>;
  /**
   * @see _.partial
   */
  partial<T1, T2, T4>(
    arg1: T1,
    arg2: T2,
    plc3: __,
    arg4: T4
  ): LoDashFunction<T extends Function4<T1, T2, infer T3, T4, infer R> ? Function1<T3, R> : any>;
  /**
   * @see _.partial
   */
  partial<T3, T4>(
    plc1: __,
    plc2: __,
    arg3: T3,
    arg4: T4
  ): LoDashFunction<T extends Function4<infer T1, infer T2, T3, T4, infer R> ? Function2<T1, T2, R> : any>;
  /**
   * @see _.partial
   */
  partial<T1, T3, T4>(
    arg1: T1,
    plc2: __,
    arg3: T3,
    arg4: T4
  ): LoDashFunction<T extends Function4<T1, infer T2, T3, T4, infer R> ? Function1<T2, R> : any>;
  /**
   * @see _.partial
   */
  partial<T2, T3, T4>(
    plc1: __,
    arg2: T2,
    arg3: T3,
    arg4: T4
  ): LoDashFunction<T extends Function4<infer T1, T2, T3, T4, infer R> ? Function1<T1, R> : any>;
  /**
   * @see _.partial
   */
  partial<T1, T2, T3, T4>(
    arg1: T1,
    arg2: T2,
    arg3: T3,
    arg4: T4
  ): LoDashFunction<T extends (t1: T1, t2: T2, t3: T3, t4: T4, ...ts: infer TS) => infer R ? (...ts: TS) => R : any>;
  /**
   * @see _.partial
   */
  partial<T1, T2, T3>(
    arg1: T1,
    arg2: T2,
    arg3: T3
  ): LoDashFunction<T extends (t1: T1, t2: T2, t3: T3, ...ts: infer TS) => infer R ? (...ts: TS) => R : any>;
  /**
   * @see _.partial
   */
  partial<T1, T2>(
    arg1: T1,
    arg2: T2
  ): LoDashFunction<T extends (t1: T1, t2: T2, ...ts: infer TS) => infer R ? (...ts: TS) => R : any>;
  /**
   * @see _.partial
   */
  partial<T1>(arg1: T1): LoDashFunction<T extends (t1: T1, ...ts: infer TS) => infer R ? (...ts: TS) => R : any>;
  /**
   * @see _.partial
   */
  partial(): LoDashFunction<T extends (...ts: any[]) => any ? T : any>;
}

declare interface LoDashFunction<T extends (...args: any) => any> {
  /**
   * @see _.partialRight
   */
  partialRight<T1>(
    arg1: T1,
    plc2: __
  ): LoDashFunction<T extends Function2<T1, infer T2, infer R> ? Function1<T2, R> : any>;
  /**
   * @see _.partialRight
   */
  partialRight<T2>(arg2: T2): LoDashFunction<T extends Function2<infer T1, T2, infer R> ? Function1<T1, R> : any>;
  /**
   * @see _.partialRight
   */
  partialRight<T1>(
    arg1: T1,
    plc2: __,
    plc3: __
  ): LoDashFunction<T extends Function3<T1, infer T2, infer T3, infer R> ? Function2<T2, T3, R> : any>;
  /**
   * @see _.partialRight
   */
  partialRight<T2>(
    arg2: T2,
    plc3: __
  ): LoDashFunction<T extends Function3<infer T1, T2, infer T3, infer R> ? Function2<T1, T3, R> : any>;
  /**
   * @see _.partialRight
   */
  partialRight<T1, T2>(
    arg1: T1,
    arg2: T2,
    plc3: __
  ): LoDashFunction<T extends Function3<T1, T2, infer T3, infer R> ? Function1<T3, R> : any>;
  /**
   * @see _.partialRight
   */
  partialRight<T3>(
    arg3: T3
  ): LoDashFunction<T extends Function3<infer T1, infer T2, T3, infer R> ? Function2<T1, T2, R> : any>;
  /**
   * @see _.partialRight
   */
  partialRight<T1, T3>(
    arg1: T1,
    plc2: __,
    arg3: T3
  ): LoDashFunction<T extends Function3<T1, infer T2, T3, infer R> ? Function1<T2, R> : any>;
  /**
   * @see _.partialRight
   */
  partialRight<T2, T3>(
    arg2: T2,
    arg3: T3
  ): LoDashFunction<T extends Function3<infer T1, T2, T3, infer R> ? Function1<T1, R> : any>;
  /**
   * @see _.partialRight
   */
  partialRight<T1>(
    arg1: T1,
    plc2: __,
    plc3: __,
    plc4: __
  ): LoDashFunction<T extends Function4<T1, infer T2, infer T3, infer T4, infer R> ? Function3<T2, T3, T4, R> : any>;
  /**
   * @see _.partialRight
   */
  partialRight<T2>(
    arg2: T2,
    plc3: __,
    plc4: __
  ): LoDashFunction<T extends Function4<infer T1, T2, infer T3, infer T4, infer R> ? Function3<T1, T3, T4, R> : any>;
  /**
   * @see _.partialRight
   */
  partialRight<T1, T2>(
    arg1: T1,
    arg2: T2,
    plc3: __,
    plc4: __
  ): LoDashFunction<T extends Function4<T1, T2, infer T3, infer T4, infer R> ? Function2<T3, T4, R> : any>;
  /**
   * @see _.partialRight
   */
  partialRight<T3>(
    arg3: T3,
    plc4: __
  ): LoDashFunction<T extends Function4<infer T1, infer T2, T3, infer T4, infer R> ? Function3<T1, T2, T4, R> : any>;
  /**
   * @see _.partialRight
   */
  partialRight<T1, T3>(
    arg1: T1,
    plc2: __,
    arg3: T3,
    plc4: __
  ): LoDashFunction<T extends Function4<T1, infer T2, infer T3, infer T4, infer R> ? Function2<T2, T4, R> : any>;
  /**
   * @see _.partialRight
   */
  partialRight<T2, T3>(
    arg2: T2,
    arg3: T3,
    plc4: __
  ): LoDashFunction<T extends Function4<infer T1, T2, T3, infer T4, infer R> ? Function2<T1, T4, R> : any>;
  /**
   * @see _.partialRight
   */
  partialRight<T1, T2, T3>(
    arg1: T1,
    arg2: T2,
    arg3: T3,
    plc4: __
  ): LoDashFunction<T extends Function4<T1, T2, T3, infer T4, infer R> ? Function1<T4, R> : any>;
  /**
   * @see _.partialRight
   */
  partialRight<T4>(
    arg4: T4
  ): LoDashFunction<T extends Function4<infer T1, infer T2, infer T3, T4, infer R> ? Function3<T1, T2, T3, R> : any>;
  /**
   * @see _.partialRight
   */
  partialRight<T1, T4>(
    arg1: T1,
    plc2: __,
    plc3: __,
    arg4: T4
  ): LoDashFunction<T extends Function4<T1, infer T2, infer T3, T4, infer R> ? Function2<T2, T3, R> : any>;
  /**
   * @see _.partialRight
   */
  partialRight<T2, T4>(
    arg2: T2,
    plc3: __,
    arg4: T4
  ): LoDashFunction<T extends Function4<infer T1, T2, infer T3, T4, infer R> ? Function2<T1, T3, R> : any>;
  /**
   * @see _.partialRight
   */
  partialRight<T1, T2, T4>(
    arg1: T1,
    arg2: T2,
    plc3: __,
    arg4: T4
  ): LoDashFunction<T extends Function4<T1, T2, infer T3, T4, infer R> ? Function1<T3, R> : any>;
  /**
   * @see _.partialRight
   */
  partialRight<T3, T4>(
    arg3: T3,
    arg4: T4
  ): LoDashFunction<T extends Function4<infer T1, infer T2, T3, T4, infer R> ? Function2<T1, T2, R> : any>;
  /**
   * @see _.partialRight
   */
  partialRight<T1, T3, T4>(
    arg1: T1,
    plc2: __,
    arg3: T3,
    arg4: T4
  ): LoDashFunction<T extends Function4<T1, infer T2, T3, T4, infer R> ? Function1<T2, R> : any>;
  /**
   * @see _.partialRight
   */
  partialRight<T2, T3, T4>(
    arg2: T2,
    arg3: T3,
    arg4: T4
  ): LoDashFunction<T extends Function4<infer T1, T2, T3, T4, infer R> ? Function1<T1, R> : any>;
  /**
   * @see _.partialRight
   */
  partialRight<TS extends any[]>(...ts: TS): LoDashFunction<T extends (...args: TS) => infer R ? () => R : any>;
  /**
   * @see _.partialRight
   */
  partialRight(): LoDashFunction<T extends (...ts: any[]) => any ? T : any>;
}

declare interface LoDashFunction<T extends (...args: any) => any> {
  /**
   * @see _.rearg
   */
  rearg(...indexes: Array<Many<number>>): LoDashFunction<(...args: any[]) => any>;
}

declare interface LoDashFunction<T extends (...args: any) => any> {
  /**
   * @see _.rest
   */
  rest(start?: number): LoDashFunction<(...args: any[]) => any>;
}

declare interface LoDashFunction<T extends (...args: any) => any> {
  /**
   * @see _.spread
   */
  spread(start?: number): LoDashFunction<(...args: any[]) => ReturnType<T>>;
}

declare interface LoDashFunction<T extends (...args: any) => any> {
  /**
   * @see _.throttle
   */
  throttle(
    wait?: number,
    options?: ThrottleSettings
  ): T extends (...args: any[]) => any ? LoDashFunction<DebouncedFunc<T>> : never;
}

declare interface LoDashFunction<T extends (...args: any) => any> {
  /**
   * @see _.unary
   */
  unary(): LoDashFunction<(arg1: Parameters<T>['0']) => ReturnType<T>>;
}

declare interface LoDashFunction<T extends (...args: any) => any> {
  /**
   * @see _.castArray
   */
  castArray(): Collection<T>;
}

declare interface LoDashFunction<T extends (...args: any) => any> {
  /**
   * @see _.chain
   */
  chain(): FunctionChain<T>;
}

declare interface LoDashFunction<T extends (...arg: any) => any> {
  /**
   * @see _.flow
   */
  flow<R2, R3, R4, R5, R6, R7>(
    f2: (a: ReturnType<T>) => R2,
    f3: (a: R2) => R3,
    f4: (a: R3) => R4,
    f5: (a: R4) => R5,
    f6: (a: R5) => R6,
    f7: (a: R6) => R7
  ): LoDashFunction<(...args: Parameters<T>) => R7>;
  /**
   * @see _.flow
   */
  flow<R2, R3, R4, R5, R6, R7>(
    f2: (a: ReturnType<T>) => R2,
    f3: (a: R2) => R3,
    f4: (a: R3) => R4,
    f5: (a: R4) => R5,
    f6: (a: R5) => R6,
    f7: (a: R6) => R7,
    ...func: Array<Many<(a: any) => any>>
  ): LoDashFunction<(...args: Parameters<T>) => any>;
  /**
   * @see _.flow
   */
  flow<R2, R3, R4, R5, R6>(
    f2: (a: ReturnType<T>) => R2,
    f3: (a: R2) => R3,
    f4: (a: R3) => R4,
    f5: (a: R4) => R5,
    f6: (a: R5) => R6
  ): LoDashFunction<(...args: Parameters<T>) => R6>;
  /**
   * @see _.flow
   */
  flow<R2, R3, R4, R5>(
    f2: (a: ReturnType<T>) => R2,
    f3: (a: R2) => R3,
    f4: (a: R3) => R4,
    f5: (a: R4) => R5
  ): LoDashFunction<(...args: Parameters<T>) => R5>;
  /**
   * @see _.flow
   */
  flow<R2, R3, R4>(
    f2: (a: ReturnType<T>) => R2,
    f3: (a: R2) => R3,
    f4: (a: R3) => R4
  ): LoDashFunction<(...args: Parameters<T>) => R4>;
  /**
   * @see _.flow
   */
  flow<R2, R3>(f2: (a: ReturnType<T>) => R2, f3: (a: R2) => R3): LoDashFunction<(...args: Parameters<T>) => R3>;
  /**
   * @see _.flow
   */
  flow<R2>(f2: (a: ReturnType<T>) => R2): LoDashFunction<(...args: Parameters<T>) => R2>;
  /**
   * @see _.flow
   */
  flow(...func: Array<Many<(...args: any[]) => any>>): LoDashFunction<(...args: any[]) => any>;
}

declare interface LoDashFunction<T> {
  /**
   * @see _.flowRight
   */
  flowRight<A extends any[], R1, R2, R3, R4, R5>(
    f6: (a: R5) => Parameters<T>['0'],
    f5: (a: R4) => R5,
    f4: (a: R3) => R4,
    f3: (a: R2) => R3,
    f2: (a: R1) => R2,
    f1: (...args: A) => R1
  ): LoDashFunction<(...args: A) => ReturnType<T>>;
  /**
   * @see _.flowRight
   */
  flowRight<A extends any[], R1, R2, R3, R4>(
    f5: (a: R4) => Parameters<T>['0'],
    f4: (a: R3) => R4,
    f3: (a: R2) => R3,
    f2: (a: R1) => R2,
    f1: (...args: A) => R1
  ): LoDashFunction<(...args: A) => ReturnType<T>>;
  /**
   * @see _.flowRight
   */
  flowRight<A extends any[], R1, R2, R3>(
    f4: (a: R3) => Parameters<T>['0'],
    f3: (a: R2) => R3,
    f2: (a: R1) => R2,
    f1: (...args: A) => R1
  ): LoDashFunction<(...args: A) => ReturnType<T>>;
  /**
   * @see _.flowRight
   */
  flowRight<A extends any[], R1, R2>(
    f3: (a: R2) => Parameters<T>['0'],
    f2: (a: R1) => R2,
    f1: (...args: A) => R1
  ): LoDashFunction<(...args: A) => ReturnType<T>>;
  /**
   * @see _.flowRight
   */
  flowRight<A extends any[], R1>(
    f2: (a: R1) => Parameters<T>['0'],
    f1: (...args: A) => R1
  ): LoDashFunction<(...args: A) => ReturnType<T>>;
  /**
   * @see _.flowRight
   */
  flowRight<A extends any[]>(f1: (...args: A) => Parameters<T>['0']): LoDashFunction<(...args: A) => ReturnType<T>>;
  /**
   * @see _.flowRight
   */
  flowRight(...func: Array<Many<(...args: any[]) => any>>): LoDashFunction<(...args: any[]) => any>;
}

declare interface LoDashFunction<T extends (...args: any) => any> {
  /**
   * @see _.iteratee
   */
  iteratee(): LoDashFunction<T>;
}

declare interface LoDashFunction<T> {
  /**
   * @see _.over
   */
  over<TResult>(
    ...iteratees: Array<Many<(...args: any[]) => TResult>>
  ): LoDashFunction<(...args: any[]) => Array<ReturnType<T> | TResult>>;
}

declare interface LoDashFunction<T> {
  /**
   * @see _.overEvery
   */
  overEvery<TArgs>(
    ...iteratees: Array<Many<(...args: TArgs[]) => boolean>>
  ): LoDashFunction<(...args: Parameters<T> | TArgs[]) => boolean>;
}

declare interface LoDashFunction<T> {
  /**
   * @see _.overSome
   */
  overSome<TArgs>(
    ...iteratees: Array<Many<(...args: TArgs[]) => boolean>>
  ): LoDashFunction<(...args: Parameters<T> | TArgs[]) => boolean>;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.invokeMap
   */
  invokeMap(methodName: string, ...args: any[]): Collection<any>;
  /**
   * @see _.invokeMap
   */
  invokeMap<TResult>(method: (...args: any[]) => TResult, ...args: any[]): Collection<TResult>;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.size
   */
  size(): number;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.now
   */
  now(): number;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.bind
   */
  bind(thisArg: any, ...partials: any[]): LoDashFunction<(...args: any[]) => any>;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.bindKey
   */
  bindKey(key: string, ...partials: any[]): LoDashFunction<(...args: any[]) => any>;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.defer
   */
  defer(...args: any[]): Primitive<number>;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.delay
   */
  delay(wait: number, ...args: any[]): Primitive<number>;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.wrap
   */
  wrap<TArgs, TResult>(
    wrapper: (value: TValue, ...args: TArgs[]) => TResult
  ): LoDashFunction<(...args: TArgs[]) => TResult>;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.clone
   */
  clone(): TValue;
  /**
   * @see _.cloneDeep
   */
  cloneDeep(): TValue;
  /**
   * @see _.cloneDeepWith
   */
  cloneDeepWith(customizer: CloneDeepWithCustomizer<TValue>): any;
  /**
   * @see _.cloneDeepWith
   */
  cloneDeepWith(): TValue;
  /**
   * @see _.cloneWith
   */
  cloneWith<TResult extends object | string | number | boolean | null>(
    customizer: CloneWithCustomizer<TValue, TResult>
  ): TResult;
  /**
   * @see _.cloneWith
   */
  cloneWith<TResult>(customizer: CloneWithCustomizer<TValue, TResult | undefined>): TResult | TValue;
  /**
   * @see _.cloneWith
   */
  cloneWith(): TValue;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.conformsTo
   */
  conformsTo(source: ConformsPredicateObject<TValue>): boolean;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.eq
   */
  eq(other: any): boolean;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.gt
   */
  gt(other: any): boolean;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.gte
   */
  gte(other: any): boolean;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.isArguments
   */
  isArguments(): boolean;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.isArray
   */
  isArray(): boolean;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.isArrayBuffer
   */
  isArrayBuffer(): boolean;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.isArrayLike
   */
  isArrayLike(): boolean;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.isArrayLikeObject
   */
  isArrayLikeObject(): boolean;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.isBoolean
   */
  isBoolean(): boolean;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.isBuffer
   */
  isBuffer(): boolean;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.isDate
   */
  isDate(): boolean;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.isElement
   */
  isElement(): boolean;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.isEmpty
   */
  isEmpty(): boolean;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.isEqual
   */
  isEqual(other: any): boolean;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.isEqualWith
   */
  isEqualWith(other: any, customizer?: IsEqualCustomizer): boolean;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.isError
   */
  isError(): boolean;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.isFinite
   */
  isFinite(): boolean;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.isFunction
   */
  isFunction(): boolean;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.isInteger
   */
  isInteger(): boolean;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.isLength
   */
  isLength(): boolean;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.isMap
   */
  isMap(): boolean;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.isMatch
   */
  isMatch(source: object): boolean;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.isMatchWith
   */
  isMatchWith(source: object, customizer: isMatchWithCustomizer): boolean;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.isNaN
   */
  isNaN(): boolean;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.isNative
   */
  isNative(): boolean;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.isNil
   */
  isNil(): boolean;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.isNull
   */
  isNull(): boolean;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.isNumber
   */
  isNumber(): boolean;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.isObject
   */
  isObject(): this is LoDashImplicitWrapper<object>;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.isObjectLike
   */
  isObjectLike(): boolean;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.isPlainObject
   */
  isPlainObject(): boolean;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.isRegExp
   */
  isRegExp(): boolean;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.isSafeInteger
   */
  isSafeInteger(): boolean;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.isSet
   */
  isSet(): boolean;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.isString
   */
  isString(): boolean;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.isSymbol
   */
  isSymbol(): boolean;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.isTypedArray
   */
  isTypedArray(): boolean;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.isUndefined
   */
  isUndefined(): boolean;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.isWeakMap
   */
  isWeakMap(): boolean;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.isWeakSet
   */
  isWeakSet(): boolean;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.lt
   */
  lt(other: any): boolean;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.lte
   */
  lte(other: any): boolean;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.toFinite
   */
  toFinite(): number;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.toInteger
   */
  toInteger(): number;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.toLength
   */
  toLength(): number;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.toNumber
   */
  toNumber(): number;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.toPlainObject
   */
  toPlainObject(): Object_2<any>;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.toSafeInteger
   */
  toSafeInteger(): number;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.add
   */
  add(addend: number): number;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.ceil
   */
  ceil(precision?: number): number;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.divide
   */
  divide(divisor: number): number;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.floor
   */
  floor(precision?: number): number;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.mean
   */
  mean(): number;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.multiply
   */
  multiply(multiplicand: number): number;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.round
   */
  round(precision?: number): number;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.subtract
   */
  subtract(subtrahend: number): number;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.sum
   */
  sum(): number;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.clamp
   */
  clamp(lower: number, upper: number): number;
  /**
   * @see _.clamp
   */
  clamp(upper: number): number;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.inRange
   */
  inRange(start: number, end?: number): boolean;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.random
   */
  random(floating?: boolean): number;
  /**
   * @see _.random
   */
  random(max: number, floating?: boolean): number;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.entries
   */
  entries(): Collection<[string, any]>;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.entriesIn
   */
  entriesIn(): Collection<[string, any]>;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.findKey
   */
  findKey(predicate?: ObjectIteratee<TValue>): string | undefined;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.findLastKey
   */
  findLastKey(predicate?: ObjectIteratee<TValue>): string | undefined;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.forIn
   */
  forIn(iteratee?: ObjectIterator<TValue, any>): this;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.forInRight
   */
  forInRight(iteratee?: ObjectIterator<TValue, any>): this;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.forOwn
   */
  forOwn(iteratee?: ObjectIterator<TValue, any>): this;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.forOwnRight
   */
  forOwnRight(iteratee?: ObjectIterator<TValue, any>): this;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.functions
   */
  functions(): Collection<string>;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.functionsIn
   */
  functionsIn(): Collection<string>;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.has
   */
  has(path: PropertyPath): boolean;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.hasIn
   */
  hasIn(path: PropertyPath): boolean;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.invert
   */
  invert(): Object_2<Dictionary<string>>;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.invoke
   */
  invoke(path: PropertyPath, ...args: any[]): any;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.keys
   */
  keys(): Collection<string>;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.keysIn
   */
  keysIn(): Collection<string>;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.result
   */
  result<TResult>(path: PropertyPath, defaultValue?: TResult | ((...args: any[]) => TResult)): TResult;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.set
   */
  set(path: PropertyPath, value: any): this;
  /**
   * @see _.set
   */
  set<TResult>(path: PropertyPath, value: any): ImpChain<TResult>;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.setWith
   */
  setWith(path: PropertyPath, value: any, customizer?: SetWithCustomizer<TValue>): this;
  /**
   * @see _.setWith
   */
  setWith<TResult>(path: PropertyPath, value: any, customizer?: SetWithCustomizer<TValue>): ImpChain<TResult>;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.toPairs
   */
  toPairs(): Collection<
    [string, TValue extends Dictionary<infer U> ? U : TValue extends NumericDictionary<infer V> ? V : any]
  >;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.toPairsIn
   */
  toPairsIn(): Collection<
    [string, TValue extends Dictionary<infer U> ? U : TValue extends NumericDictionary<infer V> ? V : any]
  >;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.unset
   */
  unset(path: PropertyPath): Primitive<boolean>;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.update
   */
  update(path: PropertyPath, updater: (value: any) => any): Object_2<any>;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.commit
   */
  commit(): this;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.plant
   */
  plant(value: unknown): this;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.reverse
   */
  reverse(): this;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.toJSON
   */
  toJSON(): TValue;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.value
   */
  value(): TValue;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.valueOf
   */
  valueOf(): TValue;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.tap
   */
  tap(interceptor: (value: TValue) => void): this;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.thru
   */
  thru<TResult>(interceptor: (value: TValue) => TResult): ImpChain<TResult>;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.camelCase
   */
  camelCase(): string;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.capitalize
   */
  capitalize(): string;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.deburr
   */
  deburr(): string;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.endsWith
   */
  endsWith(target?: string, position?: number): boolean;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.escape
   */
  escape(): string;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.escapeRegExp
   */
  escapeRegExp(): string;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.kebabCase
   */
  kebabCase(): string;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.lowerCase
   */
  lowerCase(): string;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.lowerFirst
   */
  lowerFirst(): string;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.pad
   */
  pad(length?: number, chars?: string): string;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.padEnd
   */
  padEnd(length?: number, chars?: string): string;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.padStart
   */
  padStart(length?: number, chars?: string): string;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.parseInt
   */
  parseInt(radix?: number): number;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.repeat
   */
  repeat(n?: number): string;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.replace
   */
  replace(pattern: RegExp | string, replacement: ReplaceFunction | string): string;
  /**
   * @see _.replace
   */
  replace(replacement: ReplaceFunction | string): string;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.snakeCase
   */
  snakeCase(): string;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.split
   */
  split(separator?: RegExp | string, limit?: number): Collection<string>;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.startCase
   */
  startCase(): string;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.startsWith
   */
  startsWith(target?: string, position?: number): boolean;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.template
   */
  template(options?: TemplateOptions): TemplateExecutor;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.toLower
   */
  toLower(): string;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.toUpper
   */
  toUpper(): string;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.trim
   */
  trim(chars?: string): string;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.trimEnd
   */
  trimEnd(chars?: string): string;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.trimStart
   */
  trimStart(chars?: string): string;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.truncate
   */
  truncate(options?: TruncateOptions): string;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.unescape
   */
  unescape(): string;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.upperCase
   */
  upperCase(): string;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.upperFirst
   */
  upperFirst(): string;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.words
   */
  words(pattern?: string | RegExp): Collection<string>;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.attempt
   */
  attempt<TResult>(...args: any[]): TResult | Error;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.bindAll
   */
  bindAll(...methodNames: Array<Many<string>>): this;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.conforms
   */
  conforms(): LoDashFunction<(value: ConformsPredicateObject<TValue>) => boolean>;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.constant
   */
  constant(): LoDashFunction<() => TValue>;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.defaultTo
   */
  defaultTo(defaultValue: TValue): TValue;
  /**
   * @see _.defaultTo
   */
  defaultTo<TDefault>(defaultValue: TDefault): TValue extends null | undefined ? TDefault : TValue | TDefault;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.identity
   */
  identity(): TValue;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.matches
   */
  matches<V>(): LoDashFunction<(value: V) => boolean>;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.matchesProperty
   */
  matchesProperty<SrcValue>(srcValue: SrcValue): LoDashFunction<(value: any) => boolean>;
  /**
   * @see _.matchesProperty
   */
  matchesProperty<SrcValue, Value>(srcValue: SrcValue): LoDashFunction<(value: Value) => boolean>;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.method
   */
  method(...args: any[]): LoDashFunction<(object: any) => any>;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.methodOf
   */
  methodOf(...args: any[]): LoDashImplicitWrapper<(path: PropertyPath) => any>;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.mixin
   */
  mixin(source: Dictionary<(...args: any[]) => any>, options?: MixinOptions): this;
  /**
   * @see _.mixin
   */
  mixin(options?: MixinOptions): LoDashImplicitWrapper<LoDashStatic>;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.noConflict
   */
  noConflict(): typeof _;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.noop
   */
  noop(...args: any[]): void;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.nthArg
   */
  nthArg(): LoDashFunction<(...args: any[]) => any>;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.property
   */
  property<TObj, TResult>(): LoDashFunction<(obj: TObj) => TResult>;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.propertyOf
   */
  propertyOf(): LoDashImplicitWrapper<(path: PropertyPath) => any>;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.range
   */
  range(end?: number, step?: number): Collection<number>;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.rangeRight
   */
  rangeRight(end?: number, step?: number): Collection<number>;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.runInContext
   */
  runInContext(): LoDashStatic;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.stubArray
   */
  stubArray(): any[];
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.stubFalse
   */
  stubFalse(): false;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.stubObject
   */
  stubObject(): any;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.stubString
   */
  stubString(): string;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.stubTrue
   */
  stubTrue(): true;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.times
   */
  times<TResult>(iteratee: (num: number) => TResult): TResult[];
  /**
   * @see _.times
   */
  times(): number[];
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.toPath
   */
  toPath(): Collection<string>;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.uniqueId
   */
  uniqueId(): string;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.stubTrue
   */
  stubTrue(): true;
}

declare interface LoDashImplicitWrapper<TValue> {
  /**
   * @see _.stubFalse
   */
  stubFalse(): false;
}

declare interface LoDashPartial {
  <T1, T2, R>(func: Function2<T1, T2, R>, plc1: __, arg2: T2): Function1<T1, R>;
  <T1, T2, T3, R>(func: Function3<T1, T2, T3, R>, plc1: __, arg2: T2): Function2<T1, T3, R>;
  <T1, T2, T3, R>(func: Function3<T1, T2, T3, R>, plc1: __, plc2: __, arg3: T3): Function2<T1, T2, R>;
  <T1, T2, T3, R>(func: Function3<T1, T2, T3, R>, arg1: T1, plc2: __, arg3: T3): Function1<T2, R>;
  <T1, T2, T3, R>(func: Function3<T1, T2, T3, R>, plc1: __, arg2: T2, arg3: T3): Function1<T1, R>;
  <T1, T2, T3, T4, R>(func: Function4<T1, T2, T3, T4, R>, plc1: __, arg2: T2): Function3<T1, T3, T4, R>;
  <T1, T2, T3, T4, R>(func: Function4<T1, T2, T3, T4, R>, plc1: __, plc2: __, arg3: T3): Function3<T1, T2, T4, R>;
  <T1, T2, T3, T4, R>(func: Function4<T1, T2, T3, T4, R>, arg1: T1, plc2: __, arg3: T3): Function2<T2, T4, R>;
  <T1, T2, T3, T4, R>(func: Function4<T1, T2, T3, T4, R>, plc1: __, arg2: T2, arg3: T3): Function2<T1, T4, R>;
  <T1, T2, T3, T4, R>(func: Function4<T1, T2, T3, T4, R>, arg1: T1, arg2: T2, arg3: T3): Function1<T4, R>;
  <T1, T2, T3, T4, R>(
    func: Function4<T1, T2, T3, T4, R>,
    plc1: __,
    plc2: __,
    plc3: __,
    arg4: T4
  ): Function3<T1, T2, T3, R>;
  <T1, T2, T3, T4, R>(func: Function4<T1, T2, T3, T4, R>, arg1: T1, plc2: __, plc3: __, arg4: T4): Function2<T2, T3, R>;
  <T1, T2, T3, T4, R>(func: Function4<T1, T2, T3, T4, R>, plc1: __, arg2: T2, plc3: __, arg4: T4): Function2<T1, T3, R>;
  <T1, T2, T3, T4, R>(func: Function4<T1, T2, T3, T4, R>, arg1: T1, arg2: T2, plc3: __, arg4: T4): Function1<T3, R>;
  <T1, T2, T3, T4, R>(func: Function4<T1, T2, T3, T4, R>, plc1: __, plc2: __, arg3: T3, arg4: T4): Function2<T1, T2, R>;
  <T1, T2, T3, T4, R>(func: Function4<T1, T2, T3, T4, R>, arg1: T1, plc2: __, arg3: T3, arg4: T4): Function1<T2, R>;
  <T1, T2, T3, T4, R>(func: Function4<T1, T2, T3, T4, R>, plc1: __, arg2: T2, arg3: T3, arg4: T4): Function1<T1, R>;
  <TS extends any[], R>(func: (...ts: TS) => R): (...ts: TS) => R;
  <TS extends any[], T1, R>(func: (t1: T1, ...ts: TS) => R, arg1: T1): (...ts: TS) => R;
  <TS extends any[], T1, T2, R>(func: (t1: T1, t2: T2, ...ts: TS) => R, t1: T1, t2: T2): (...ts: TS) => R;
  <TS extends any[], T1, T2, T3, R>(
    func: (t1: T1, t2: T2, t3: T3, ...ts: TS) => R,
    t1: T1,
    t2: T2,
    t3: T3
  ): (...ts: TS) => R;
  <TS extends any[], T1, T2, T3, T4, R>(
    func: (t1: T1, t2: T2, t3: T3, t4: T4, ...ts: TS) => R,
    t1: T1,
    t2: T2,
    t3: T3,
    t4: T4
  ): (...ts: TS) => R;
  placeholder: __;
}

declare interface LoDashStatic {}

declare interface LoDashStatic {
  /**
   * Creates a lodash object which wraps value to enable implicit method chain sequences.
   * Methods that operate on and return arrays, collections, and functions can be chained together.
   * Methods that retrieve a single value or may return a primitive value will automatically end the
   * chain sequence and return the unwrapped value. Otherwise, the value must be unwrapped with value().
   *
   * Explicit chain sequences, which must be unwrapped with value(), may be enabled using _.chain.
   *
   * The execution of chained methods is lazy, that is, it's deferred until value() is
   * implicitly or explicitly called.
   *
   * Lazy evaluation allows several methods to support shortcut fusion. Shortcut fusion
   * is an optimization to merge iteratee calls; this avoids the creation of intermediate
   * arrays and can greatly reduce the number of iteratee executions. Sections of a chain
   * sequence qualify for shortcut fusion if the section is applied to an array and iteratees
   * accept only one argument. The heuristic for whether a section qualifies for shortcut
   * fusion is subject to change.
   *
   * Chaining is supported in custom builds as long as the value() method is directly or
   * indirectly included in the build.
   *
   * In addition to lodash methods, wrappers have Array and String methods.
   * The wrapper Array methods are:
   * concat, join, pop, push, shift, sort, splice, and unshift.
   * The wrapper String methods are:
   * replace and split.
   *
   * The wrapper methods that support shortcut fusion are:
   * at, compact, drop, dropRight, dropWhile, filter, find, findLast, head, initial, last,
   * map, reject, reverse, slice, tail, take, takeRight, takeRightWhile, takeWhile, and toArray
   *
   * The chainable wrapper methods are:
   * after, ary, assign, assignIn, assignInWith, assignWith, at, before, bind, bindAll, bindKey,
   * castArray, chain, chunk, commit, compact, concat, conforms, constant, countBy, create,
   * curry, debounce, defaults, defaultsDeep, defer, delay, difference, differenceBy, differenceWith,
   * drop, dropRight, dropRightWhile, dropWhile, extend, extendWith, fill, filter, flatMap,
   * flatMapDeep, flatMapDepth, flatten, flattenDeep, flattenDepth, flip, flow, flowRight,
   * fromPairs, functions, functionsIn, groupBy, initial, intersection, intersectionBy, intersectionWith,
   * invert, invertBy, invokeMap, iteratee, keyBy, keys, keysIn, map, mapKeys, mapValues,
   * matches, matchesProperty, memoize, merge, mergeWith, method, methodOf, mixin, negate,
   * nthArg, omit, omitBy, once, orderBy, over, overArgs, overEvery, overSome, partial, partialRight,
   * partition, pick, pickBy, plant, property, propertyOf, pull, pullAll, pullAllBy, pullAllWith, pullAt,
   * push, range, rangeRight, rearg, reject, remove, rest, reverse, sampleSize, set, setWith,
   * shuffle, slice, sort, sortBy, sortedUniq, sortedUniqBy, splice, spread, tail, take,
   * takeRight, takeRightWhile, takeWhile, tap, throttle, thru, toArray, toPairs, toPairsIn,
   * toPath, toPlainObject, transform, unary, union, unionBy, unionWith, uniq, uniqBy, uniqWith,
   * unset, unshift, unzip, unzipWith, update, updateWith, values, valuesIn, without, wrap,
   * xor, xorBy, xorWith, zip, zipObject, zipObjectDeep, and zipWith.
   *
   * The wrapper methods that are not chainable by default are:
   * add, attempt, camelCase, capitalize, ceil, clamp, clone, cloneDeep, cloneDeepWith, cloneWith,
   * conformsTo, deburr, defaultTo, divide, each, eachRight, endsWith, eq, escape, escapeRegExp,
   * every, find, findIndex, findKey, findLast, findLastIndex, findLastKey, first, floor, forEach,
   * forEachRight, forIn, forInRight, forOwn, forOwnRight, get, gt, gte, has, hasIn, head,
   * identity, includes, indexOf, inRange, invoke, isArguments, isArray, isArrayBuffer,
   * isArrayLike, isArrayLikeObject, isBoolean, isBuffer, isDate, isElement, isEmpty, isEqual, isEqualWith,
   * isError, isFinite, isFunction, isInteger, isLength, isMap, isMatch, isMatchWith, isNaN,
   * isNative, isNil, isNull, isNumber, isObject, isObjectLike, isPlainObject, isRegExp,
   * isSafeInteger, isSet, isString, isUndefined, isTypedArray, isWeakMap, isWeakSet, join,
   * kebabCase, last, lastIndexOf, lowerCase, lowerFirst, lt, lte, max, maxBy, mean, meanBy,
   * min, minBy, multiply, noConflict, noop, now, nth, pad, padEnd, padStart, parseInt, pop,
   * random, reduce, reduceRight, repeat, result, round, runInContext, sample, shift, size,
   * snakeCase, some, sortedIndex, sortedIndexBy, sortedLastIndex, sortedLastIndexBy, startCase,
   * startsWith, stubArray, stubFalse, stubObject, stubString, stubTrue, subtract, sum, sumBy,
   * template, times, toFinite, toInteger, toJSON, toLength, toLower, toNumber, toSafeInteger,
   * toString, toUpper, trim, trimEnd, trimStart, truncate, unescape, uniqueId, upperCase,
   * upperFirst, value, and words.
   **/
  <TrapAny extends { __trapAny: any }>(
    value: TrapAny
  ): Collection<any> & LoDashFunction<any> & Object_2<any> & Primitive<any> & String_2;
  <T extends null | undefined>(value: T): Primitive<T>;
  (value: string | null | undefined): String_2;
  <T extends (...args: any) => any>(value: T): LoDashFunction<T>;
  <T = any>(value: List<T> | null | undefined): Collection<T>;
  <T extends object>(value: T | null | undefined): Object_2<T>;
  <T>(value: T): Primitive<T>;
  /**
   * The semantic version number.
   **/
  VERSION: string;
  /**
   * By default, the template delimiters used by Lo-Dash are similar to those in embedded Ruby
   * (ERB). Change the following template settings to use alternative delimiters.
   **/
  templateSettings: TemplateSettings;
}

declare interface LoDashStatic {
  /**
   * Creates an array of elements split into groups the length of size. If collection can’t be split evenly, the
   * final chunk will be the remaining elements.
   *
   * @param array The array to process.
   * @param size The length of each chunk.
   * @return Returns the new array containing chunks.
   */
  chunk<T>(array: List<T> | null | undefined, size?: number): T[][];
}

declare interface LoDashStatic {
  /**
   * Creates an array with all falsey values removed. The values false, null, 0, 0n, "", undefined, and NaN are
   * falsey.
   *
   * @param array The array to compact.
   * @return Returns the new array of filtered values.
   */
  compact<T>(array: List<T | Falsey> | null | undefined): T[];
}

declare interface LoDashStatic {
  /**
   * Creates a new array concatenating `array` with any additional arrays
   * and/or values.
   *
   * @category Array
   * @param [values] The array values to concatenate.
   * @returns Returns the new concatenated array.
   * @example
   *
   * var array = [1];
   * var other = _.concat(array, 2, [3], [[4]]);
   *
   * console.log(other);
   * // => [1, 2, 3, [4]]
   *
   * console.log(array);
   * // => [1]
   */
  concat<T>(...values: Array<Many<T>>): T[];
}

declare interface LoDashStatic {
  /**
   * Creates an array of `array` values not included in the other provided arrays using SameValueZero for
   * equality comparisons. The order and references of result values are determined by the first array.
   *
   * @param array The array to inspect.
   * @param values The arrays of values to exclude.
   * @return Returns the new array of filtered values.
   */
  difference<T>(array: List<T> | null | undefined, ...values: Array<List<T>>): T[];
}

declare interface LoDashStatic {
  /**
   * This method is like _.difference except that it accepts iteratee which is invoked for each element
   * of array and values to generate the criterion by which they're compared. The order and references
   * of result values are determined by the first array. The iteratee is invoked with one argument: (value).
   *
   * @param array The array to inspect.
   * @param values The values to exclude.
   * @param iteratee The iteratee invoked per element.
   * @returns Returns the new array of filtered values.
   */
  differenceBy<T1, T2>(array: List<T1> | null | undefined, values: List<T2>, iteratee: ValueIteratee<T1 | T2>): T1[];
  /**
   * @see _.differenceBy
   */
  differenceBy<T1, T2, T3>(
    array: List<T1> | null | undefined,
    values1: List<T2>,
    values2: List<T3>,
    iteratee: ValueIteratee<T1 | T2 | T3>
  ): T1[];
  /**
   * @see _.differenceBy
   */
  differenceBy<T1, T2, T3, T4>(
    array: List<T1> | null | undefined,
    values1: List<T2>,
    values2: List<T3>,
    values3: List<T4>,
    iteratee: ValueIteratee<T1 | T2 | T3 | T4>
  ): T1[];
  /**
   * @see _.differenceBy
   */
  differenceBy<T1, T2, T3, T4, T5>(
    array: List<T1> | null | undefined,
    values1: List<T2>,
    values2: List<T3>,
    values3: List<T4>,
    values4: List<T5>,
    iteratee: ValueIteratee<T1 | T2 | T3 | T4 | T5>
  ): T1[];
  /**
   * @see _.differenceBy
   */
  differenceBy<T1, T2, T3, T4, T5, T6>(
    array: List<T1> | null | undefined,
    values1: List<T2>,
    values2: List<T3>,
    values3: List<T4>,
    values4: List<T5>,
    values5: List<T6>,
    iteratee: ValueIteratee<T1 | T2 | T3 | T4 | T5 | T6>
  ): T1[];
  /**
   * @see _.differenceBy
   */
  differenceBy<T1, T2, T3, T4, T5, T6, T7>(
    array: List<T1> | null | undefined,
    values1: List<T2>,
    values2: List<T3>,
    values3: List<T4>,
    values4: List<T5>,
    values5: List<T6>,
    ...values: Array<List<T7> | ValueIteratee<T1 | T2 | T3 | T4 | T5 | T6 | T7>>
  ): T1[];
  /**
   * @see _.differenceBy
   */
  differenceBy<T>(array: List<T> | null | undefined, ...values: Array<List<T>>): T[];
}

declare interface LoDashStatic {
  /**
     * This method is like _.difference except that it accepts comparator which is invoked to compare elements
     * of array to values. The order and references of result values are determined by the first array. The
     * comparator is invoked with two arguments: (arrVal, othVal).
     *
     * @category Array
     * @param [values] The arrays to inspect.
     * @param [comparator] The comparator invoked per element.
     * @returns Returns the new array of filtered values.
     * @example
     *
     * var objects = [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }];

     * _.differenceWith(objects, [{ 'x': 1, 'y': 2 }], _.isEqual);
     * // => [{ 'x': 2, 'y': 1 }]
     */
  differenceWith<T1, T2>(array: List<T1> | null | undefined, values: List<T2>, comparator: Comparator2<T1, T2>): T1[];
  /**
   * @see _.differenceWith
   */
  differenceWith<T1, T2, T3>(
    array: List<T1> | null | undefined,
    values1: List<T2>,
    values2: List<T3>,
    comparator: Comparator2<T1, T2 | T3>
  ): T1[];
  /**
   * @see _.differenceWith
   */
  differenceWith<T1, T2, T3, T4>(
    array: List<T1> | null | undefined,
    values1: List<T2>,
    values2: List<T3>,
    ...values: Array<List<T4> | Comparator2<T1, T2 | T3 | T4>>
  ): T1[];
  /**
   * @see _.differenceWith
   */
  differenceWith<T>(array: List<T> | null | undefined, ...values: Array<List<T>>): T[];
}

declare interface LoDashStatic {
  /**
   * Creates a slice of array with n elements dropped from the beginning.
   *
   * @param array The array to query.
   * @param n The number of elements to drop.
   * @return Returns the slice of array.
   */
  drop<T>(array: List<T> | null | undefined, n?: number): T[];
}

declare interface LoDashStatic {
  /**
   * Creates a slice of array with n elements dropped from the end.
   *
   * @param array The array to query.
   * @param n The number of elements to drop.
   * @return Returns the slice of array.
   */
  dropRight<T>(array: List<T> | null | undefined, n?: number): T[];
}

declare interface LoDashStatic {
  /**
   * Creates a slice of array excluding elements dropped from the end. Elements are dropped until predicate
   * returns falsey. The predicate is invoked with three arguments: (value, index, array).
   *
   * @param array The array to query.
   * @param predicate The function invoked per iteration.
   * @return Returns the slice of array.
   */
  dropRightWhile<T>(array: List<T> | null | undefined, predicate?: ListIteratee<T>): T[];
}

declare interface LoDashStatic {
  /**
   * Creates a slice of array excluding elements dropped from the beginning. Elements are dropped until predicate
   * returns falsey. The predicate is invoked with three arguments: (value, index, array).
   *
   * @param array The array to query.
   * @param predicate The function invoked per iteration.
   * @return Returns the slice of array.
   */
  dropWhile<T>(array: List<T> | null | undefined, predicate?: ListIteratee<T>): T[];
}

declare interface LoDashStatic {
  /**
   * Fills elements of array with value from start up to, but not including, end.
   *
   * Note: This method mutates array.
   *
   * @param array The array to fill.
   * @param value The value to fill array with.
   * @param start The start position.
   * @param end The end position.
   * @return Returns array.
   */
  fill<T>(array: any[] | null | undefined, value: T): T[];
  /**
   * @see _.fill
   */
  fill<T>(array: List<any> | null | undefined, value: T): List<T>;
  /**
   * @see _.fill
   */
  fill<T, U>(array: U[] | null | undefined, value: T, start?: number, end?: number): Array<T | U>;
  /**
   * @see _.fill
   */
  fill<T, U>(array: List<U> | null | undefined, value: T, start?: number, end?: number): List<T | U>;
}

declare interface LoDashStatic {
  /**
   * This method is like _.find except that it returns the index of the first element predicate returns truthy
   * for instead of the element itself.
   *
   * @param array The array to search.
   * @param predicate The function invoked per iteration.
   * @param fromIndex The index to search from.
   * @return Returns the index of the found element, else -1.
   */
  findIndex<T>(
    array: List<T> | null | undefined,
    predicate?: ListIterateeCustom<T, boolean>,
    fromIndex?: number
  ): number;
}

declare interface LoDashStatic {
  /**
   * This method is like _.findIndex except that it iterates over elements of collection from right to left.
   *
   * @param array The array to search.
   * @param predicate The function invoked per iteration.
   * @param fromIndex The index to search from.
   * @return Returns the index of the found element, else -1.
   */
  findLastIndex<T>(
    array: List<T> | null | undefined,
    predicate?: ListIterateeCustom<T, boolean>,
    fromIndex?: number
  ): number;
}

declare interface LoDashStatic {
  /**
   * @see _.head
   */
  first: LoDashStatic['head'];
}

declare interface LoDashStatic {
  /**
   * Flattens `array` a single level deep.
   *
   * @param array The array to flatten.
   * @return Returns the new flattened array.
   */
  flatten<T>(array: List<Many<T>> | null | undefined): T[];
}

declare interface LoDashStatic {
  /**
   * Recursively flattens a nested array.
   *
   * @param array The array to recursively flatten.
   * @return Returns the new flattened array.
   */
  flattenDeep<T>(array: ListOfRecursiveArraysOrValues<T> | null | undefined): Array<Flat<T>>;
}

declare interface LoDashStatic {
  /**
   * Recursively flatten array up to depth times.
   *
   * @param array The array to recursively flatten.
   * @param number The maximum recursion depth.
   * @return Returns the new flattened array.
   */
  flattenDepth<T>(array: ListOfRecursiveArraysOrValues<T> | null | undefined, depth?: number): T[];
}

declare interface LoDashStatic {
  /**
   * The inverse of `_.toPairs`; this method returns an object composed
   * from key-value `pairs`.
   *
   * @category Array
   * @param pairs The key-value pairs.
   * @returns Returns the new object.
   * @example
   *
   * _.fromPairs([['fred', 30], ['barney', 40]]);
   * // => { 'fred': 30, 'barney': 40 }
   */
  fromPairs<T>(pairs: List<[PropertyName, T]> | null | undefined): Dictionary<T>;
  /**
   * @see _.fromPairs
   */
  fromPairs(pairs: List<any[]> | null | undefined): Dictionary<any>;
}

declare interface LoDashStatic {
  /**
   * Gets the first element of array.
   *
   * @alias _.first
   *
   * @param array The array to query.
   * @return Returns the first element of array.
   */
  head<T>(array: List<T> | null | undefined): T | undefined;
}

declare interface LoDashStatic {
  /**
   * Gets the index at which the first occurrence of `value` is found in `array`
   * using [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
   * for equality comparisons. If `fromIndex` is negative, it's used as the offset
   * from the end of `array`.
   *
   * @category Array
   * @param array The array to search.
   * @param value The value to search for.
   * @param [fromIndex=0] The index to search from.
   * @returns Returns the index of the matched value, else `-1`.
   * @example
   *
   * _.indexOf([1, 2, 1, 2], 2);
   * // => 1
   *
   * // using `fromIndex`
   * _.indexOf([1, 2, 1, 2], 2, 2);
   * // => 3
   */
  indexOf<T>(array: List<T> | null | undefined, value: T, fromIndex?: number): number;
}

declare interface LoDashStatic {
  /**
   * Gets all but the last element of array.
   *
   * @param array The array to query.
   * @return Returns the slice of array.
   */
  initial<T>(array: List<T> | null | undefined): T[];
}

declare interface LoDashStatic {
  /**
   * Creates an array of unique values that are included in all of the provided arrays using SameValueZero for
   * equality comparisons.
   *
   * @param arrays The arrays to inspect.
   * @return Returns the new array of shared values.
   */
  intersection<T>(...arrays: Array<List<T> | null | undefined>): T[];
}

declare interface LoDashStatic {
  /**
   * This method is like `_.intersection` except that it accepts `iteratee`
   * which is invoked for each element of each `arrays` to generate the criterion
   * by which uniqueness is computed. The iteratee is invoked with one argument: (value).
   *
   * @category Array
   * @param [arrays] The arrays to inspect.
   * @param [iteratee=_.identity] The iteratee invoked per element.
   * @returns Returns the new array of shared values.
   * @example
   *
   * _.intersectionBy([2.1, 1.2], [4.3, 2.4], Math.floor);
   * // => [2.1]
   *
   * // using the `_.property` iteratee shorthand
   * _.intersectionBy([{ 'x': 1 }], [{ 'x': 2 }, { 'x': 1 }], 'x');
   * // => [{ 'x': 1 }]
   */
  intersectionBy<T1, T2>(array: List<T1> | null, values: List<T2>, iteratee: ValueIteratee<T1 | T2>): T1[];
  /**
   * @see _.intersectionBy
   */
  intersectionBy<T1, T2, T3>(
    array: List<T1> | null,
    values1: List<T2>,
    values2: List<T3>,
    iteratee: ValueIteratee<T1 | T2 | T3>
  ): T1[];
  /**
   * @see _.intersectionBy
   */
  intersectionBy<T1, T2, T3, T4>(
    array: List<T1> | null | undefined,
    values1: List<T2>,
    values2: List<T3>,
    ...values: Array<List<T4> | ValueIteratee<T1 | T2 | T3 | T4>>
  ): T1[];
  /**
   * @see _.intersectionBy
   */
  intersectionBy<T>(array?: List<T> | null, ...values: Array<List<T>>): T[];
  /**
   * @see _.intersectionBy
   */
  intersectionBy<T>(...values: Array<List<T> | ValueIteratee<T>>): T[];
}

declare interface LoDashStatic {
  /**
     * Creates an array of unique `array` values not included in the other
     * provided arrays using [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
     * for equality comparisons.
     *
     * @category Array
     * @param [values] The arrays to inspect.
     * @param [comparator] The comparator invoked per element.
     * @returns Returns the new array of filtered values.
     * @example
     *
     * var objects = [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }];
     * var others = [{ 'x': 1, 'y': 1 }, { 'x': 1, 'y': 2 }];

     * _.intersectionWith(objects, others, _.isEqual);
     * // => [{ 'x': 1, 'y': 2 }]
     */
  intersectionWith<T1, T2>(array: List<T1> | null | undefined, values: List<T2>, comparator: Comparator2<T1, T2>): T1[];
  /**
   * @see _.intersectionWith
   */
  intersectionWith<T1, T2, T3>(
    array: List<T1> | null | undefined,
    values1: List<T2>,
    values2: List<T3>,
    comparator: Comparator2<T1, T2 | T3>
  ): T1[];
  /**
   * @see _.intersectionWith
   */
  intersectionWith<T1, T2, T3, T4>(
    array: List<T1> | null | undefined,
    values1: List<T2>,
    values2: List<T3>,
    ...values: Array<List<T4> | Comparator2<T1, T2 | T3 | T4>>
  ): T1[];
  /**
   * @see _.intersectionWith
   */
  intersectionWith<T>(array?: List<T> | null, ...values: Array<List<T> | Comparator2<T, never>>): T[];
}

declare interface LoDashStatic {
  /**
   * Converts all elements in `array` into a string separated by `separator`.
   *
   * @param array The array to convert.
   * @param separator The element separator.
   * @returns Returns the joined string.
   */
  join(array: List<any> | null | undefined, separator?: string): string;
}

declare interface LoDashStatic {
  /**
   * Gets the last element of array.
   *
   * @param array The array to query.
   * @return Returns the last element of array.
   */
  last<T>(array: List<T> | null | undefined): T | undefined;
}

declare interface LoDashStatic {
  /**
   * This method is like _.indexOf except that it iterates over elements of array from right to left.
   *
   * @param array The array to search.
   * @param value The value to search for.
   * @param fromIndex The index to search from or true to perform a binary search on a sorted array.
   * @return Returns the index of the matched value, else -1.
   */
  lastIndexOf<T>(array: List<T> | null | undefined, value: T, fromIndex?: true | number): number;
}

declare interface LoDashStatic {
  /**
   * Gets the element at index `n` of `array`. If `n` is negative, the nth element from the end is returned.
   *
   * @param array array The array to query.
   * @param value The index of the element to return.
   * @return Returns the nth element of `array`.
   */
  nth<T>(array: List<T> | null | undefined, n?: number): T | undefined;
}

declare interface LoDashStatic {
  /**
   * Removes all provided values from array using SameValueZero for equality comparisons.
   *
   * Note: Unlike _.without, this method mutates array.
   *
   * @param array The array to modify.
   * @param values The values to remove.
   * @return Returns array.
   */
  pull<T>(array: T[], ...values: T[]): T[];
  /**
   * @see _.pull
   */
  pull<T>(array: List<T>, ...values: T[]): List<T>;
}

declare interface LoDashStatic {
  /**
   * This method is like `_.pull` except that it accepts an array of values to remove.
   *
   * **Note:** Unlike `_.difference`, this method mutates `array`.
   *
   * @category Array
   * @param array The array to modify.
   * @param values The values to remove.
   * @returns Returns `array`.
   * @example
   *
   * var array = [1, 2, 3, 1, 2, 3];
   *
   * _.pull(array, [2, 3]);
   * console.log(array);
   * // => [1, 1]
   */
  pullAll<T>(array: T[], values?: List<T>): T[];
  /**
   * @see _.pullAll
   */
  pullAll<T>(array: List<T>, values?: List<T>): List<T>;
}

declare interface LoDashStatic {
  /**
   * This method is like `_.pullAll` except that it accepts `iteratee` which is
   * invoked for each element of `array` and `values` to to generate the criterion
   * by which uniqueness is computed. The iteratee is invoked with one argument: (value).
   *
   * **Note:** Unlike `_.differenceBy`, this method mutates `array`.
   *
   * @category Array
   * @param array The array to modify.
   * @param values The values to remove.
   * @param [iteratee=_.identity] The iteratee invoked per element.
   * @returns Returns `array`.
   * @example
   *
   * var array = [{ 'x': 1 }, { 'x': 2 }, { 'x': 3 }, { 'x': 1 }];
   *
   * _.pullAllBy(array, [{ 'x': 1 }, { 'x': 3 }], 'x');
   * console.log(array);
   * // => [{ 'x': 2 }]
   */
  pullAllBy<T>(array: T[], values?: List<T>, iteratee?: ValueIteratee<T>): T[];
  /**
   * @see _.pullAllBy
   */
  pullAllBy<T>(array: List<T>, values?: List<T>, iteratee?: ValueIteratee<T>): List<T>;
  /**
   * @see _.pullAllBy
   */
  pullAllBy<T1, T2>(array: T1[], values: List<T2>, iteratee: ValueIteratee<T1 | T2>): T1[];
  /**
   * @see _.pullAllBy
   */
  pullAllBy<T1, T2>(array: List<T1>, values: List<T2>, iteratee: ValueIteratee<T1 | T2>): List<T1>;
}

declare interface LoDashStatic {
  /**
   * This method is like `_.pullAll` except that it accepts `comparator` which is
   * invoked to compare elements of array to values. The comparator is invoked with
   * two arguments: (arrVal, othVal).
   *
   * **Note:** Unlike `_.differenceWith`, this method mutates `array`.
   *
   * @category Array
   * @param array The array to modify.
   * @param values The values to remove.
   * @param [iteratee=_.identity] The iteratee invoked per element.
   * @returns Returns `array`.
   * @example
   *
   * var array = [{ 'x': 1, 'y': 2 }, { 'x': 3, 'y': 4 }, { 'x': 5, 'y': 6 }];
   *
   * _.pullAllWith(array, [{ 'x': 3, 'y': 4 }], _.isEqual);
   * console.log(array);
   * // => [{ 'x': 1, 'y': 2 }, { 'x': 5, 'y': 6 }]
   */
  pullAllWith<T>(array: T[], values?: List<T>, comparator?: Comparator<T>): T[];
  /**
   * @see _.pullAllWith
   */
  pullAllWith<T>(array: List<T>, values?: List<T>, comparator?: Comparator<T>): List<T>;
  /**
   * @see _.pullAllWith
   */
  pullAllWith<T1, T2>(array: T1[], values: List<T2>, comparator: Comparator2<T1, T2>): T1[];
  /**
   * @see _.pullAllWith
   */
  pullAllWith<T1, T2>(array: List<T1>, values: List<T2>, comparator: Comparator2<T1, T2>): List<T1>;
}

declare interface LoDashStatic {
  /**
   * Removes elements from array corresponding to the given indexes and returns an array of the removed elements.
   * Indexes may be specified as an array of indexes or as individual arguments.
   *
   * Note: Unlike _.at, this method mutates array.
   *
   * @param array The array to modify.
   * @param indexes The indexes of elements to remove, specified as individual indexes or arrays of indexes.
   * @return Returns the new array of removed elements.
   */
  pullAt<T>(array: T[], ...indexes: Array<Many<number>>): T[];
  /**
   * @see _.pullAt
   */
  pullAt<T>(array: List<T>, ...indexes: Array<Many<number>>): List<T>;
}

declare interface LoDashStatic {
  /**
   * Removes all elements from array that predicate returns truthy for and returns an array of the removed
   * elements. The predicate is invoked with three arguments: (value, index, array).
   *
   * Note: Unlike _.filter, this method mutates array.
   *
   * @param array The array to modify.
   * @param predicate The function invoked per iteration.
   * @return Returns the new array of removed elements.
   */
  remove<T>(array: List<T>, predicate?: ListIteratee<T>): T[];
}

declare interface LoDashStatic {
  /**
   * Reverses `array` so that the first element becomes the last, the second
   * element becomes the second to last, and so on.
   *
   * **Note:** This method mutates `array` and is based on
   * [`Array#reverse`](https://mdn.io/Array/reverse).
   *
   * @category Array
   * @returns Returns `array`.
   * @example
   *
   * var array = [1, 2, 3];
   *
   * _.reverse(array);
   * // => [3, 2, 1]
   *
   * console.log(array);
   * // => [3, 2, 1]
   */
  reverse<TList extends List<any>>(array: TList): TList;
}

declare interface LoDashStatic {
  /**
   * Creates a slice of array from start up to, but not including, end.
   *
   * @param array The array to slice.
   * @param start The start position.
   * @param end The end position.
   * @return Returns the slice of array.
   */
  slice<T>(array: List<T> | null | undefined, start?: number, end?: number): T[];
}

declare interface LoDashStatic {
  /**
   * Uses a binary search to determine the lowest index at which `value` should
   * be inserted into `array` in order to maintain its sort order.
   *
   * @category Array
   * @param array The sorted array to inspect.
   * @param value The value to evaluate.
   * @returns Returns the index at which `value` should be inserted into `array`.
   * @example
   *
   * _.sortedIndex([30, 50], 40);
   * // => 1
   *
   * _.sortedIndex([4, 5], 4);
   * // => 0
   */
  sortedIndex<T>(array: List<T> | null | undefined, value: T): number;
}

declare interface LoDashStatic {
  /**
   * Uses a binary search to determine the lowest index at which `value` should
   * be inserted into `array` in order to maintain its sort order.
   *
   * @category Array
   * @param array The sorted array to inspect.
   * @param value The value to evaluate.
   * @returns Returns the index at which `value` should be inserted into `array`.
   * @example
   *
   * _.sortedIndex([30, 50], 40);
   * // => 1
   *
   * _.sortedIndex([4, 5], 4);
   * // => 0
   */
  sortedIndex<T>(array: List<T> | null | undefined, value: T): number;
}

declare interface LoDashStatic {
  /**
   * This method is like `_.sortedIndex` except that it accepts `iteratee`
   * which is invoked for `value` and each element of `array` to compute their
   * sort ranking. The iteratee is invoked with one argument: (value).
   *
   * @category Array
   * @param array The sorted array to inspect.
   * @param value The value to evaluate.
   * @param [iteratee=_.identity] The iteratee invoked per element.
   * @returns Returns the index at which `value` should be inserted into `array`.
   * @example
   *
   * var dict = { 'thirty': 30, 'forty': 40, 'fifty': 50 };
   *
   * _.sortedIndexBy(['thirty', 'fifty'], 'forty', _.propertyOf(dict));
   * // => 1
   *
   * // using the `_.property` iteratee shorthand
   * _.sortedIndexBy([{ 'x': 4 }, { 'x': 5 }], { 'x': 4 }, 'x');
   * // => 0
   */
  sortedIndexBy<T>(array: List<T> | null | undefined, value: T, iteratee?: ValueIteratee<T>): number;
}

declare interface LoDashStatic {
  /**
   * This method is like `_.indexOf` except that it performs a binary
   * search on a sorted `array`.
   *
   * @category Array
   * @param array The array to search.
   * @param value The value to search for.
   * @returns Returns the index of the matched value, else `-1`.
   * @example
   *
   * _.sortedIndexOf([1, 1, 2, 2], 2);
   * // => 2
   */
  sortedIndexOf<T>(array: List<T> | null | undefined, value: T): number;
}

declare interface LoDashStatic {
  /**
   * This method is like `_.sortedIndex` except that it returns the highest
   * index at which `value` should be inserted into `array` in order to
   * maintain its sort order.
   *
   * @category Array
   * @param array The sorted array to inspect.
   * @param value The value to evaluate.
   * @returns Returns the index at which `value` should be inserted into `array`.
   * @example
   *
   * _.sortedLastIndex([4, 5], 4);
   * // => 1
   */
  sortedLastIndex<T>(array: List<T> | null | undefined, value: T): number;
}

declare interface LoDashStatic {
  /**
   * This method is like `_.sortedLastIndex` except that it accepts `iteratee`
   * which is invoked for `value` and each element of `array` to compute their
   * sort ranking. The iteratee is invoked with one argument: (value).
   *
   * @category Array
   * @param array The sorted array to inspect.
   * @param value The value to evaluate.
   * @param [iteratee=_.identity] The iteratee invoked per element.
   * @returns Returns the index at which `value` should be inserted into `array`.
   * @example
   *
   * // using the `_.property` iteratee shorthand
   * _.sortedLastIndexBy([{ 'x': 4 }, { 'x': 5 }], { 'x': 4 }, 'x');
   * // => 1
   */
  sortedLastIndexBy<T>(array: List<T> | null | undefined, value: T, iteratee: ValueIteratee<T>): number;
}

declare interface LoDashStatic {
  /**
   * This method is like `_.lastIndexOf` except that it performs a binary
   * search on a sorted `array`.
   *
   * @category Array
   * @param array The array to search.
   * @param value The value to search for.
   * @returns Returns the index of the matched value, else `-1`.
   * @example
   *
   * _.sortedLastIndexOf([1, 1, 2, 2], 2);
   * // => 3
   */
  sortedLastIndexOf<T>(array: List<T> | null | undefined, value: T): number;
}

declare interface LoDashStatic {
  /**
   * This method is like `_.uniq` except that it's designed and optimized
   * for sorted arrays.
   *
   * @category Array
   * @param array The array to inspect.
   * @returns Returns the new duplicate free array.
   * @example
   *
   * _.sortedUniq([1, 1, 2]);
   * // => [1, 2]
   */
  sortedUniq<T>(array: List<T> | null | undefined): T[];
}

declare interface LoDashStatic {
  /**
   * This method is like `_.uniqBy` except that it's designed and optimized
   * for sorted arrays.
   *
   * @category Array
   * @param array The array to inspect.
   * @param [iteratee] The iteratee invoked per element.
   * @returns Returns the new duplicate free array.
   * @example
   *
   * _.sortedUniqBy([1.1, 1.2, 2.3, 2.4], Math.floor);
   * // => [1.1, 2.3]
   */
  sortedUniqBy<T>(array: List<T> | null | undefined, iteratee: ValueIteratee<T>): T[];
}

declare interface LoDashStatic {
  /**
   * Gets all but the first element of array.
   *
   * @param array The array to query.
   * @return Returns the slice of array.
   */
  tail<T>(array: List<T> | null | undefined): T[];
}

declare interface LoDashStatic {
  /**
   * Creates a slice of array with n elements taken from the beginning.
   *
   * @param array The array to query.
   * @param n The number of elements to take.
   * @return Returns the slice of array.
   */
  take<T>(array: List<T> | null | undefined, n?: number): T[];
}

declare interface LoDashStatic {
  /**
   * Creates a slice of array with n elements taken from the end.
   *
   * @param array The array to query.
   * @param n The number of elements to take.
   * @return Returns the slice of array.
   */
  takeRight<T>(array: List<T> | null | undefined, n?: number): T[];
}

declare interface LoDashStatic {
  /**
   * Creates a slice of array with elements taken from the end. Elements are taken until predicate returns
   * falsey. The predicate is invoked with three arguments: (value, index, array).
   *
   * @param array The array to query.
   * @param predicate The function invoked per iteration.
   * @return Returns the slice of array.
   */
  takeRightWhile<T>(array: List<T> | null | undefined, predicate?: ListIteratee<T>): T[];
}

declare interface LoDashStatic {
  /**
   * Creates a slice of array with elements taken from the beginning. Elements are taken until predicate returns
   * falsey. The predicate is invoked with three arguments: (value, index, array).
   *
   * @param array The array to query.
   * @param predicate The function invoked per iteration.
   * @return Returns the slice of array.
   */
  takeWhile<T>(array: List<T> | null | undefined, predicate?: ListIteratee<T>): T[];
}

declare interface LoDashStatic {
  /**
   * Creates an array of unique values, in order, from all of the provided arrays using SameValueZero for
   * equality comparisons.
   *
   * @param arrays The arrays to inspect.
   * @return Returns the new array of combined values.
   */
  union<T>(...arrays: Array<List<T> | null | undefined>): T[];
}

declare interface LoDashStatic {
  /**
   * This method is like `_.union` except that it accepts `iteratee` which is
   * invoked for each element of each `arrays` to generate the criterion by which
   * uniqueness is computed. The iteratee is invoked with one argument: (value).
   *
   * @param arrays The arrays to inspect.
   * @param iteratee The iteratee invoked per element.
   * @return Returns the new array of combined values.
   */
  unionBy<T>(arrays: List<T> | null | undefined, iteratee?: ValueIteratee<T>): T[];
  /**
   * @see _.unionBy
   */
  unionBy<T>(
    arrays1: List<T> | null | undefined,
    arrays2: List<T> | null | undefined,
    iteratee?: ValueIteratee<T>
  ): T[];
  /**
   * @see _.unionBy
   */
  unionBy<T>(
    arrays1: List<T> | null | undefined,
    arrays2: List<T> | null | undefined,
    arrays3: List<T> | null | undefined,
    iteratee?: ValueIteratee<T>
  ): T[];
  /**
   * @see _.unionBy
   */
  unionBy<T>(
    arrays1: List<T> | null | undefined,
    arrays2: List<T> | null | undefined,
    arrays3: List<T> | null | undefined,
    arrays4: List<T> | null | undefined,
    iteratee?: ValueIteratee<T>
  ): T[];
  /**
   * @see _.unionBy
   */
  unionBy<T>(
    arrays1: List<T> | null | undefined,
    arrays2: List<T> | null | undefined,
    arrays3: List<T> | null | undefined,
    arrays4: List<T> | null | undefined,
    arrays5: List<T> | null | undefined,
    ...iteratee: Array<ValueIteratee<T> | List<T> | null | undefined>
  ): T[];
}

declare interface LoDashStatic {
  /**
   * This method is like `_.union` except that it accepts `comparator` which
   * is invoked to compare elements of `arrays`. The comparator is invoked
   * with two arguments: (arrVal, othVal).
   *
   * @category Array
   * @param [arrays] The arrays to inspect.
   * @param [comparator] The comparator invoked per element.
   * @returns Returns the new array of combined values.
   * @example
   *
   * var objects = [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }];
   * var others = [{ 'x': 1, 'y': 1 }, { 'x': 1, 'y': 2 }];
   *
   * _.unionWith(objects, others, _.isEqual);
   * // => [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }, { 'x': 1, 'y': 1 }]
   */
  unionWith<T>(arrays: List<T> | null | undefined, comparator?: Comparator<T>): T[];
  /**
   * @see _.unionWith
   */
  unionWith<T>(
    arrays: List<T> | null | undefined,
    arrays2: List<T> | null | undefined,
    comparator?: Comparator<T>
  ): T[];
  /**
   * @see _.unionWith
   */
  unionWith<T>(
    arrays: List<T> | null | undefined,
    arrays2: List<T> | null | undefined,
    arrays3: List<T> | null | undefined,
    ...comparator: Array<Comparator<T> | List<T> | null | undefined>
  ): T[];
}

declare interface LoDashStatic {
  /**
   * Creates a duplicate-free version of an array, using
   * [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
   * for equality comparisons, in which only the first occurrence of each element
   * is kept.
   *
   * @category Array
   * @param array The array to inspect.
   * @returns Returns the new duplicate free array.
   * @example
   *
   * _.uniq([2, 1, 2]);
   * // => [2, 1]
   */
  uniq<T>(array: List<T> | null | undefined): T[];
}

declare interface LoDashStatic {
  /**
   * This method is like `_.uniq` except that it accepts `iteratee` which is
   * invoked for each element in `array` to generate the criterion by which
   * uniqueness is computed. The iteratee is invoked with one argument: (value).
   *
   * @category Array
   * @param array The array to inspect.
   * @param [iteratee=_.identity] The iteratee invoked per element.
   * @returns Returns the new duplicate free array.
   * @example
   *
   * _.uniqBy([2.1, 1.2, 2.3], Math.floor);
   * // => [2.1, 1.2]
   *
   * // using the `_.property` iteratee shorthand
   * _.uniqBy([{ 'x': 1 }, { 'x': 2 }, { 'x': 1 }], 'x');
   * // => [{ 'x': 1 }, { 'x': 2 }]
   */
  uniqBy<T>(array: List<T> | null | undefined, iteratee: ValueIteratee<T>): T[];
}

declare interface LoDashStatic {
  /**
   * This method is like `_.uniq` except that it accepts `comparator` which
   * is invoked to compare elements of `array`. The comparator is invoked with
   * two arguments: (arrVal, othVal).
   *
   * @category Array
   * @param array The array to inspect.
   * @param [comparator] The comparator invoked per element.
   * @returns Returns the new duplicate free array.
   * @example
   *
   * var objects = [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 },  { 'x': 1, 'y': 2 }];
   *
   * _.uniqWith(objects, _.isEqual);
   * // => [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }]
   */
  uniqWith<T>(array: List<T> | null | undefined, comparator?: Comparator<T>): T[];
}

declare interface LoDashStatic {
  /**
   * This method is like _.zip except that it accepts an array of grouped elements and creates an array
   * regrouping the elements to their pre-zip configuration.
   *
   * @param array The array of grouped elements to process.
   * @return Returns the new array of regrouped elements.
   */
  unzip<T>(array: T[][] | List<List<T>> | null | undefined): T[][];
}

declare interface LoDashStatic {
  /**
   * This method is like _.unzip except that it accepts an iteratee to specify how regrouped values should be
   * combined. The iteratee is invoked with four arguments: (accumulator, value, index, group).
   *
   * @param array The array of grouped elements to process.
   * @param iteratee The function to combine regrouped values.
   * @return Returns the new array of regrouped elements.
   */
  unzipWith<T, TResult>(array: List<List<T>> | null | undefined, iteratee: (...values: T[]) => TResult): TResult[];
  /**
   * @see _.unzipWith
   */
  unzipWith<T>(array: List<List<T>> | null | undefined): T[][];
}

declare interface LoDashStatic {
  /**
   * Creates an array excluding all provided values using SameValueZero for equality comparisons.
   *
   * @param array The array to filter.
   * @param values The values to exclude.
   * @return Returns the new array of filtered values.
   */
  without<T>(array: List<T> | null | undefined, ...values: T[]): T[];
}

declare interface LoDashStatic {
  /**
   * Creates an array of unique values that is the symmetric difference of the provided arrays.
   *
   * @param arrays The arrays to inspect.
   * @return Returns the new array of values.
   */
  xor<T>(...arrays: Array<List<T> | null | undefined>): T[];
}

declare interface LoDashStatic {
  /**
   * This method is like `_.xor` except that it accepts `iteratee` which is
   * invoked for each element of each `arrays` to generate the criterion by which
   * uniqueness is computed. The iteratee is invoked with one argument: (value).
   *
   * @category Array
   * @param [arrays] The arrays to inspect.
   * @param [iteratee=_.identity] The iteratee invoked per element.
   * @returns Returns the new array of values.
   * @example
   *
   * _.xorBy([2.1, 1.2], [4.3, 2.4], Math.floor);
   * // => [1.2, 4.3]
   *
   * // using the `_.property` iteratee shorthand
   * _.xorBy([{ 'x': 1 }], [{ 'x': 2 }, { 'x': 1 }], 'x');
   * // => [{ 'x': 2 }]
   */
  xorBy<T>(arrays: List<T> | null | undefined, iteratee?: ValueIteratee<T>): T[];
  /**
   * @see _.xorBy
   */
  xorBy<T>(arrays: List<T> | null | undefined, arrays2: List<T> | null | undefined, iteratee?: ValueIteratee<T>): T[];
  /**
   * @see _.xorBy
   */
  xorBy<T>(
    arrays: List<T> | null | undefined,
    arrays2: List<T> | null | undefined,
    arrays3: List<T> | null | undefined,
    ...iteratee: Array<ValueIteratee<T> | List<T> | null | undefined>
  ): T[];
}

declare interface LoDashStatic {
  /**
   * This method is like `_.xor` except that it accepts `comparator` which is
   * invoked to compare elements of `arrays`. The comparator is invoked with
   * two arguments: (arrVal, othVal).
   *
   * @category Array
   * @param [arrays] The arrays to inspect.
   * @param [comparator] The comparator invoked per element.
   * @returns Returns the new array of values.
   * @example
   *
   * var objects = [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }];
   * var others = [{ 'x': 1, 'y': 1 }, { 'x': 1, 'y': 2 }];
   *
   * _.xorWith(objects, others, _.isEqual);
   * // => [{ 'x': 2, 'y': 1 }, { 'x': 1, 'y': 1 }]
   */
  xorWith<T>(arrays: List<T> | null | undefined, comparator?: Comparator<T>): T[];
  /**
   * @see _.xorWith
   */
  xorWith<T>(arrays: List<T> | null | undefined, arrays2: List<T> | null | undefined, comparator?: Comparator<T>): T[];
  /**
   * @see _.xorWith
   */
  xorWith<T>(
    arrays: List<T> | null | undefined,
    arrays2: List<T> | null | undefined,
    arrays3: List<T> | null | undefined,
    ...comparator: Array<Comparator<T> | List<T> | null | undefined>
  ): T[];
}

declare interface LoDashStatic {
  /**
   * Creates an array of grouped elements, the first of which contains the first elements of the given arrays,
   * the second of which contains the second elements of the given arrays, and so on.
   *
   * @param arrays The arrays to process.
   * @return Returns the new array of grouped elements.
   */
  zip<T1, T2>(arrays1: List<T1>, arrays2: List<T2>): Array<[T1 | undefined, T2 | undefined]>;
  /**
   * @see _.zip
   */
  zip<T1, T2, T3>(
    arrays1: List<T1>,
    arrays2: List<T2>,
    arrays3: List<T3>
  ): Array<[T1 | undefined, T2 | undefined, T3 | undefined]>;
  /**
   * @see _.zip
   */
  zip<T1, T2, T3, T4>(
    arrays1: List<T1>,
    arrays2: List<T2>,
    arrays3: List<T3>,
    arrays4: List<T4>
  ): Array<[T1 | undefined, T2 | undefined, T3 | undefined, T4 | undefined]>;
  /**
   * @see _.zip
   */
  zip<T1, T2, T3, T4, T5>(
    arrays1: List<T1>,
    arrays2: List<T2>,
    arrays3: List<T3>,
    arrays4: List<T4>,
    arrays5: List<T5>
  ): Array<[T1 | undefined, T2 | undefined, T3 | undefined, T4 | undefined, T5 | undefined]>;
  /**
   * @see _.zip
   */
  zip<T>(...arrays: Array<List<T> | null | undefined>): Array<Array<T | undefined>>;
}

declare interface LoDashStatic {
  /**
   * This method is like _.fromPairs except that it accepts two arrays, one of property
   * identifiers and one of corresponding values.
   *
   * @param props The property names.
   * @param values The property values.
   * @return Returns the new object.
   */
  zipObject<T>(props: List<PropertyName>, values: List<T>): Dictionary<T>;
  /**
   * @see _.zipObject
   */
  zipObject(props?: List<PropertyName>): Dictionary<undefined>;
}

declare interface LoDashStatic {
  /**
   * This method is like _.zipObject except that it supports property paths.
   *
   * @param paths The property names.
   * @param values The property values.
   * @return Returns the new object.
   */
  zipObjectDeep(paths?: List<PropertyPath>, values?: List<any>): object;
}

declare interface LoDashStatic {
  /**
   * This method is like _.zip except that it accepts an iteratee to specify how grouped values should be
   * combined. The iteratee is invoked with four arguments: (accumulator, value, index,
   * group).
   * @param arrays The arrays to process.
   * @param iteratee The function to combine grouped values.
   * @return Returns the new array of grouped elements.
   */
  zipWith<T, TResult>(arrays: List<T>, iteratee: (value1: T) => TResult): TResult[];
  /**
   * @see _.zipWith
   */
  zipWith<T1, T2, TResult>(
    arrays1: List<T1>,
    arrays2: List<T2>,
    iteratee: (value1: T1, value2: T2) => TResult
  ): TResult[];
  /**
   * @see _.zipWith
   */
  zipWith<T1, T2, T3, TResult>(
    arrays1: List<T1>,
    arrays2: List<T2>,
    arrays3: List<T3>,
    iteratee: (value1: T1, value2: T2, value3: T3) => TResult
  ): TResult[];
  /**
   * @see _.zipWith
   */
  zipWith<T1, T2, T3, T4, TResult>(
    arrays1: List<T1>,
    arrays2: List<T2>,
    arrays3: List<T3>,
    arrays4: List<T4>,
    iteratee: (value1: T1, value2: T2, value3: T3, value4: T4) => TResult
  ): TResult[];
  /**
   * @see _.zipWith
   */
  zipWith<T1, T2, T3, T4, T5, TResult>(
    arrays1: List<T1>,
    arrays2: List<T2>,
    arrays3: List<T3>,
    arrays4: List<T4>,
    arrays5: List<T5>,
    iteratee: (value1: T1, value2: T2, value3: T3, value4: T4, value5: T5) => TResult
  ): TResult[];
  /**
   * @see _.zipWith
   */
  zipWith<T, TResult>(...iteratee: Array<((...group: T[]) => TResult) | List<T> | null | undefined>): TResult[];
}

declare interface LoDashStatic {
  /**
   * Creates an object composed of keys generated from the results of running each element of collection through
   * iteratee. The corresponding value of each key is the number of times the key was returned by iteratee. The
   * iteratee is invoked with one argument: (value).
   *
   * @param collection The collection to iterate over.
   * @param iteratee The function invoked per iteration.
   * @return Returns the composed aggregate object.
   */
  countBy<T>(collection: List<T> | null | undefined, iteratee?: ValueIteratee<T>): Dictionary<number>;
  /**
   * @see _.countBy
   */
  countBy<T extends object>(collection: T | null | undefined, iteratee?: ValueIteratee<T[keyof T]>): Dictionary<number>;
}

declare interface LoDashStatic {
  /**
   * @see _.forEach
   */
  each: LoDashStatic['forEach'];
}

declare interface LoDashStatic {
  /**
   * @see _.forEachRight
   */
  eachRight: LoDashStatic['forEachRight'];
}

declare interface LoDashStatic {
  /**
   * Checks if predicate returns truthy for all elements of collection. Iteration is stopped once predicate
   * returns falsey. The predicate is invoked with three arguments: (value, index|key, collection).
   *
   * @param collection The collection to iterate over.
   * @param predicate The function invoked per iteration.
   * @return Returns true if all elements pass the predicate check, else false.
   */
  every<T>(collection: List<T> | null | undefined, predicate?: ListIterateeCustom<T, boolean>): boolean;
  /**
   * @see _.every
   */
  every<T extends object>(collection: T | null | undefined, predicate?: ObjectIterateeCustom<T, boolean>): boolean;
}

declare interface LoDashStatic {
  /**
   * Iterates over elements of collection, returning an array of all elements predicate returns truthy for. The
   * predicate is invoked with three arguments: (value, index|key, collection).
   *
   * @param collection The collection to iterate over.
   * @param predicate The function invoked per iteration.
   * @return Returns the new filtered array.
   */
  filter(collection: string | null | undefined, predicate?: StringIterator<boolean>): string[];
  /**
   * @see _.filter
   */
  filter<T, S extends T>(collection: List<T> | null | undefined, predicate: ListIteratorTypeGuard<T, S>): S[];
  /**
   * @see _.filter
   */
  filter<T>(collection: List<T> | null | undefined, predicate?: ListIterateeCustom<T, boolean>): T[];
  /**
   * @see _.filter
   */
  filter<T extends object, S extends T[keyof T]>(
    collection: T | null | undefined,
    predicate: ObjectIteratorTypeGuard<T, S>
  ): S[];
  /**
   * @see _.filter
   */
  filter<T extends object>(
    collection: T | null | undefined,
    predicate?: ObjectIterateeCustom<T, boolean>
  ): Array<T[keyof T]>;
}

declare interface LoDashStatic {
  /**
   * Iterates over elements of collection, returning the first element predicate returns truthy for.
   * The predicate is invoked with three arguments: (value, index|key, collection).
   *
   * @param collection The collection to search.
   * @param predicate The function invoked per iteration.
   * @param fromIndex The index to search from.
   * @return Returns the matched element, else undefined.
   */
  find<T, S extends T>(
    collection: List<T> | null | undefined,
    predicate: ListIteratorTypeGuard<T, S>,
    fromIndex?: number
  ): S | undefined;
  /**
   * @see _.find
   */
  find<T>(
    collection: List<T> | null | undefined,
    predicate?: ListIterateeCustom<T, boolean>,
    fromIndex?: number
  ): T | undefined;
  /**
   * @see _.find
   */
  find<T extends object, S extends T[keyof T]>(
    collection: T | null | undefined,
    predicate: ObjectIteratorTypeGuard<T, S>,
    fromIndex?: number
  ): S | undefined;
  /**
   * @see _.find
   */
  find<T extends object>(
    collection: T | null | undefined,
    predicate?: ObjectIterateeCustom<T, boolean>,
    fromIndex?: number
  ): T[keyof T] | undefined;
}

declare interface LoDashStatic {
  /**
   * This method is like _.find except that it iterates over elements of a collection from
   * right to left.
   * @param collection Searches for a value in this list.
   * @param predicate The function called per iteration.
   * @param fromIndex The index to search from.
   * @return The found element, else undefined.
   */
  findLast<T, S extends T>(
    collection: List<T> | null | undefined,
    predicate: ListIteratorTypeGuard<T, S>,
    fromIndex?: number
  ): S | undefined;
  /**
   * @see _.findLast
   */
  findLast<T>(
    collection: List<T> | null | undefined,
    predicate?: ListIterateeCustom<T, boolean>,
    fromIndex?: number
  ): T | undefined;
  /**
   * @see _.findLast
   */
  findLast<T extends object, S extends T[keyof T]>(
    collection: T | null | undefined,
    predicate: ObjectIteratorTypeGuard<T, S>,
    fromIndex?: number
  ): S | undefined;
  /**
   * @see _.findLast
   */
  findLast<T extends object>(
    collection: T | null | undefined,
    predicate?: ObjectIterateeCustom<T, boolean>,
    fromIndex?: number
  ): T[keyof T] | undefined;
}

declare interface LoDashStatic {
  /**
   * Creates an array of flattened values by running each element in collection through iteratee
   * and concating its result to the other mapped values. The iteratee is invoked with three arguments:
   * (value, index|key, collection).
   *
   * @param collection The collection to iterate over.
   * @param iteratee The function invoked per iteration.
   * @return Returns the new flattened array.
   */
  flatMap<T>(collection: Dictionary<Many<T>> | NumericDictionary<Many<T>> | null | undefined): T[];
  /**
   * @see _.flatMap
   */
  flatMap(collection: object | null | undefined): any[];
  /**
   * @see _.flatMap
   */
  flatMap<T, TResult>(collection: List<T> | null | undefined, iteratee: ListIterator<T, Many<TResult>>): TResult[];
  /**
   * @see _.flatMap
   */
  flatMap<T extends object, TResult>(
    collection: T | null | undefined,
    iteratee: ObjectIterator<T, Many<TResult>>
  ): TResult[];
  /**
   * @see _.flatMap
   */
  flatMap(collection: object | null | undefined, iteratee: string): any[];
  /**
   * @see _.flatMap
   */
  flatMap(collection: object | null | undefined, iteratee: object): boolean[];
}

declare interface LoDashStatic {
  /**
   * This method is like `_.flatMap` except that it recursively flattens the
   * mapped results.
   *
   * @since 4.7.0
   * @category Collection
   * @param collection The collection to iterate over.
   * @param [iteratee=_.identity] The function invoked per iteration.
   * @returns Returns the new flattened array.
   * @example
   *
   * function duplicate(n) {
   *   return [[[n, n]]];
   * }
   *
   * _.flatMapDeep([1, 2], duplicate);
   * // => [1, 1, 2, 2]
   */
  flatMapDeep<T>(
    collection:
      | Dictionary<ListOfRecursiveArraysOrValues<T> | T>
      | NumericDictionary<ListOfRecursiveArraysOrValues<T> | T>
      | null
      | undefined
  ): T[];
  /**
   * @see _.flatMapDeep
   */
  flatMapDeep<T, TResult>(
    collection: List<T> | null | undefined,
    iteratee: ListIterator<T, ListOfRecursiveArraysOrValues<TResult> | TResult>
  ): TResult[];
  /**
   * @see _.flatMapDeep
   */
  flatMapDeep<T extends object, TResult>(
    collection: T | null | undefined,
    iteratee: ObjectIterator<T, ListOfRecursiveArraysOrValues<TResult> | TResult>
  ): TResult[];
  /**
   * @see _.flatMapDeep
   */
  flatMapDeep(collection: object | null | undefined, iteratee: string): any[];
  /**
   * @see _.flatMapDeep
   */
  flatMapDeep(collection: object | null | undefined, iteratee: object): boolean[];
}

declare interface LoDashStatic {
  /**
   * This method is like `_.flatMap` except that it recursively flattens the
   * mapped results up to `depth` times.
   *
   * @since 4.7.0
   * @category Collection
   * @param collection The collection to iterate over.
   * @param [iteratee=_.identity] The function invoked per iteration.
   * @param [depth=1] The maximum recursion depth.
   * @returns Returns the new flattened array.
   * @example
   *
   * function duplicate(n) {
   *   return [[[n, n]]];
   * }
   *
   * _.flatMapDepth([1, 2], duplicate, 2);
   * // => [[1, 1], [2, 2]]
   */
  flatMapDepth<T>(
    collection:
      | Dictionary<ListOfRecursiveArraysOrValues<T> | T>
      | NumericDictionary<ListOfRecursiveArraysOrValues<T> | T>
      | null
      | undefined
  ): T[];
  /**
   * @see _.flatMapDepth
   */
  flatMapDepth<T, TResult>(
    collection: List<T> | null | undefined,
    iteratee: ListIterator<T, ListOfRecursiveArraysOrValues<TResult> | TResult>,
    depth?: number
  ): TResult[];
  /**
   * @see _.flatMapDepth
   */
  flatMapDepth<T extends object, TResult>(
    collection: T | null | undefined,
    iteratee: ObjectIterator<T, ListOfRecursiveArraysOrValues<TResult> | TResult>,
    depth?: number
  ): TResult[];
  /**
   * @see _.flatMapDepth
   */
  flatMapDepth(collection: object | null | undefined, iteratee: string, depth?: number): any[];
  /**
   * @see _.flatMapDepth
   */
  flatMapDepth(collection: object | null | undefined, iteratee: object, depth?: number): boolean[];
}

declare interface LoDashStatic {
  /**
   * Iterates over elements of collection invoking iteratee for each element. The iteratee is invoked with three arguments:
   * (value, index|key, collection). Iteratee functions may exit iteration early by explicitly returning false.
   *
   * Note: As with other "Collections" methods, objects with a "length" property are iterated like arrays. To
   * avoid this behavior _.forIn or _.forOwn may be used for object iteration.
   *
   * @alias _.each
   *
   * @param collection The collection to iterate over.
   * @param iteratee The function invoked per iteration.
   */
  forEach<T>(collection: T[], iteratee?: ArrayIterator<T, any>): T[];
  /**
   * @see _.forEach
   */
  forEach(collection: string, iteratee?: StringIterator<any>): string;
  /**
   * @see _.forEach
   */
  forEach<T>(collection: List<T>, iteratee?: ListIterator<T, any>): List<T>;
  /**
   * @see _.forEach
   */
  forEach<T extends object>(collection: T, iteratee?: ObjectIterator<T, any>): T;
  /**
   * @see _.forEach
   */
  forEach<T, TArray extends T[] | null | undefined>(
    collection: TArray & (T[] | null | undefined),
    iteratee?: ArrayIterator<T, any>
  ): TArray;
  /**
   * @see _.forEach
   */
  forEach<TString extends string | null | undefined>(collection: TString, iteratee?: StringIterator<any>): TString;
  /**
   * @see _.forEach
   */
  forEach<T, TList extends List<T> | null | undefined>(
    collection: TList & (List<T> | null | undefined),
    iteratee?: ListIterator<T, any>
  ): TList;
  /**
   * @see _.forEach
   */
  forEach<T extends object>(collection: T | null | undefined, iteratee?: ObjectIterator<T, any>): T | null | undefined;
}

declare interface LoDashStatic {
  /**
   * This method is like _.forEach except that it iterates over elements of collection from right to left.
   *
   * @alias _.eachRight
   *
   * @param collection The collection to iterate over.
   * @param iteratee The function called per iteration.
   */
  forEachRight<T>(collection: T[], iteratee?: ArrayIterator<T, any>): T[];
  /**
   * @see _.forEachRight
   */
  forEachRight(collection: string, iteratee?: StringIterator<any>): string;
  /**
   * @see _.forEachRight
   */
  forEachRight<T>(collection: List<T>, iteratee?: ListIterator<T, any>): List<T>;
  /**
   * @see _.forEachRight
   */
  forEachRight<T extends object>(collection: T, iteratee?: ObjectIterator<T, any>): T;
  /**
   * @see _.forEachRight
   */
  forEachRight<T, TArray extends T[] | null | undefined>(
    collection: TArray & (T[] | null | undefined),
    iteratee?: ArrayIterator<T, any>
  ): TArray;
  /**
   * @see _.forEachRight
   */
  forEachRight<TString extends string | null | undefined>(collection: TString, iteratee?: StringIterator<any>): TString;
  /**
   * @see _.forEachRight
   */
  forEachRight<T, TList extends List<T> | null | undefined>(
    collection: TList & (List<T> | null | undefined),
    iteratee?: ListIterator<T, any>
  ): TList;
  /**
   * @see _.forEachRight
   */
  forEachRight<T extends object>(
    collection: T | null | undefined,
    iteratee?: ObjectIterator<T, any>
  ): T | null | undefined;
}

declare interface LoDashStatic {
  /**
   * Creates an object composed of keys generated from the results of running each element of collection through
   * iteratee. The corresponding value of each key is an array of the elements responsible for generating the
   * key. The iteratee is invoked with one argument: (value).
   *
   * @param collection The collection to iterate over.
   * @param iteratee The function invoked per iteration.
   * @return Returns the composed aggregate object.
   */
  groupBy<T>(collection: List<T> | null | undefined, iteratee?: ValueIteratee<T>): Dictionary<T[]>;
  /**
   * @see _.groupBy
   */
  groupBy<T extends object>(
    collection: T | null | undefined,
    iteratee?: ValueIteratee<T[keyof T]>
  ): Dictionary<Array<T[keyof T]>>;
}

declare interface LoDashStatic {
  /**
   * Checks if target is in collection using SameValueZero for equality comparisons. If fromIndex is negative,
   * it’s used as the offset from the end of collection.
   *
   * @param collection The collection to search.
   * @param target The value to search for.
   * @param fromIndex The index to search from.
   * @return True if the target element is found, else false.
   */
  includes<T>(
    collection: Dictionary<T> | NumericDictionary<T> | null | undefined,
    target: T,
    fromIndex?: number
  ): boolean;
}

declare interface LoDashStatic {
  /**
   * Invokes the method named by methodName on each element in the collection returning
   * an array of the results of each invoked method. Additional arguments will be provided
   * to each invoked method. If methodName is a function it will be invoked for, and this
   * bound to, each element in the collection.
   * @param collection The collection to iterate over.
   * @param methodName The name of the method to invoke.
   * @param args Arguments to invoke the method with.
   */
  invokeMap(collection: object | null | undefined, methodName: string, ...args: any[]): any[];
  /**
   * @see _.invokeMap
   */
  invokeMap<TResult>(
    collection: object | null | undefined,
    method: (...args: any[]) => TResult,
    ...args: any[]
  ): TResult[];
}

declare interface LoDashStatic {
  /**
   * Creates an object composed of keys generated from the results of running each element of collection through
   * iteratee. The corresponding value of each key is the last element responsible for generating the key. The
   * iteratee function is invoked with one argument: (value).
   *
   * @param collection The collection to iterate over.
   * @param iteratee The function invoked per iteration.
   * @return Returns the composed aggregate object.
   */
  keyBy<T>(collection: List<T> | null | undefined, iteratee?: ValueIterateeCustom<T, PropertyName>): Dictionary<T>;
  /**
   * @see _.keyBy
   */
  keyBy<T extends object>(
    collection: T | null | undefined,
    iteratee?: ValueIterateeCustom<T[keyof T], PropertyName>
  ): Dictionary<T[keyof T]>;
}

declare interface LoDashStatic {
  /**
   * Creates an array of values by running each element in collection through iteratee. The iteratee is
   * invoked with three arguments: (value, index|key, collection).
   *
   * Many lodash methods are guarded to work as iteratees for methods like _.every, _.filter, _.map, _.mapValues,
   * _.reject, and _.some.
   *
   * The guarded methods are:
   * ary, callback, chunk, clone, create, curry, curryRight, drop, dropRight, every, fill, flatten, invert, max,
   * min, parseInt, slice, sortBy, take, takeRight, template, trim, trimLeft, trimRight, trunc, random, range,
   * sample, some, sum, uniq, and words
   *
   * @param collection The collection to iterate over.
   * @param iteratee The function invoked per iteration.
   * @return Returns the new mapped array.
   */
  map<T, TResult>(collection: T[] | null | undefined, iteratee: ArrayIterator<T, TResult>): TResult[];
  /**
   * @see _.map
   */
  map<T, TResult>(collection: List<T> | null | undefined, iteratee: ListIterator<T, TResult>): TResult[];
  /**
   * @see _.map
   */
  map<T>(collection: Dictionary<T> | NumericDictionary<T> | null | undefined): T[];
  /**
   * @see _.map
   */
  map<T extends object, TResult>(collection: T | null | undefined, iteratee: ObjectIterator<T, TResult>): TResult[];
  /**
   * @see _.map
   */
  map<T, K extends keyof T>(
    collection: Dictionary<T> | NumericDictionary<T> | null | undefined,
    iteratee: K
  ): Array<T[K]>;
  /**
   * @see _.map
   */
  map<T>(collection: Dictionary<T> | NumericDictionary<T> | null | undefined, iteratee?: string): any[];
  /**
   * @see _.map
   */
  map<T>(collection: Dictionary<T> | NumericDictionary<T> | null | undefined, iteratee?: object): boolean[];
}

declare interface LoDashStatic {
  /**
   * This method is like `_.sortBy` except that it allows specifying the sort
   * orders of the iteratees to sort by. If `orders` is unspecified, all values
   * are sorted in ascending order. Otherwise, specify an order of "desc" for
   * descending or "asc" for ascending sort order of corresponding values.
   *
   * @category Collection
   * @param collection The collection to iterate over.
   * @param [iteratees=[_.identity]] The iteratees to sort by.
   * @param [orders] The sort orders of `iteratees`.
   * @param [guard] Enables use as an iteratee for functions like `_.reduce`.
   * @returns Returns the new sorted array.
   * @example
   *
   * var users = [
   *   { 'user': 'fred',   'age': 48 },
   *   { 'user': 'barney', 'age': 34 },
   *   { 'user': 'fred',   'age': 42 },
   *   { 'user': 'barney', 'age': 36 }
   * ];
   *
   * // sort by `user` in ascending order and by `age` in descending order
   * _.orderBy(users, ['user', 'age'], ['asc', 'desc']);
   * // => objects for [['barney', 36], ['barney', 34], ['fred', 48], ['fred', 42]]
   */
  orderBy<T>(
    collection: List<T> | null | undefined,
    iteratees?: Many<ListIterator<T, NotVoid>>,
    orders?: Many<boolean | 'asc' | 'desc'>
  ): T[];
  /**
   * @see _.orderBy
   */
  orderBy<T>(
    collection: List<T> | null | undefined,
    iteratees?: Many<ListIteratee<T>>,
    orders?: Many<boolean | 'asc' | 'desc'>
  ): T[];
  /**
   * @see _.orderBy
   */
  orderBy<T extends object>(
    collection: T | null | undefined,
    iteratees?: Many<ObjectIterator<T, NotVoid>>,
    orders?: Many<boolean | 'asc' | 'desc'>
  ): Array<T[keyof T]>;
  /**
   * @see _.orderBy
   */
  orderBy<T extends object>(
    collection: T | null | undefined,
    iteratees?: Many<ObjectIteratee<T>>,
    orders?: Many<boolean | 'asc' | 'desc'>
  ): Array<T[keyof T]>;
}

declare interface LoDashStatic {
  /**
   * Creates an array of elements split into two groups, the first of which contains elements predicate returns truthy for,
   * while the second of which contains elements predicate returns falsey for.
   * The predicate is invoked with three arguments: (value, index|key, collection).
   *
   * @param collection The collection to iterate over.
   * @param callback The function called per iteration.
   * @return Returns the array of grouped elements.
   */
  partition<T, U extends T>(
    collection: List<T> | null | undefined,
    callback: ValueIteratorTypeGuard<T, U>
  ): [U[], Array<Exclude<T, U>>];
  /**
   * @see _.partition
   */
  partition<T>(collection: List<T> | null | undefined, callback: ValueIteratee<T>): [T[], T[]];
  /**
   * @see _.partition
   */
  partition<T extends object>(
    collection: T | null | undefined,
    callback: ValueIteratee<T[keyof T]>
  ): [Array<T[keyof T]>, Array<T[keyof T]>];
}

declare interface LoDashStatic {
  /**
   * Reduces a collection to a value which is the accumulated result of running each
   * element in the collection through the callback, where each successive callback execution
   * consumes the return value of the previous execution. If accumulator is not provided the
   * first element of the collection will be used as the initial accumulator value. The callback
   * is invoked with four arguments: (accumulator, value, index|key, collection).
   * @param collection The collection to iterate over.
   * @param callback The function called per iteration.
   * @param accumulator Initial value of the accumulator.
   * @return Returns the accumulated value.
   */
  reduce<T, TResult>(
    collection: T[] | null | undefined,
    callback: MemoListIterator<T, TResult, T[]>,
    accumulator: TResult
  ): TResult;
  /**
   * @see _.reduce
   */
  reduce<T, TResult>(
    collection: List<T> | null | undefined,
    callback: MemoListIterator<T, TResult, List<T>>,
    accumulator: TResult
  ): TResult;
  /**
   * @see _.reduce
   */
  reduce<T extends object, TResult>(
    collection: T | null | undefined,
    callback: MemoObjectIterator<T[keyof T], TResult, T>,
    accumulator: TResult
  ): TResult;
  /**
   * @see _.reduce
   */
  reduce<T>(collection: T[] | null | undefined, callback: MemoListIterator<T, T, T[]>): T | undefined;
  /**
   * @see _.reduce
   */
  reduce<T>(collection: List<T> | null | undefined, callback: MemoListIterator<T, T, List<T>>): T | undefined;
  /**
   * @see _.reduce
   */
  reduce<T extends object>(
    collection: T | null | undefined,
    callback: MemoObjectIterator<T[keyof T], T[keyof T], T>
  ): T[keyof T] | undefined;
}

declare interface LoDashStatic {
  /**
   * This method is like _.reduce except that it iterates over elements of a collection from
   * right to left.
   * @param collection The collection to iterate over.
   * @param callback The function called per iteration.
   * @param accumulator Initial value of the accumulator.
   * @return The accumulated value.
   */
  reduceRight<T, TResult>(
    collection: T[] | null | undefined,
    callback: MemoListIterator<T, TResult, T[]>,
    accumulator: TResult
  ): TResult;
  /**
   * @see _.reduceRight
   */
  reduceRight<T, TResult>(
    collection: List<T> | null | undefined,
    callback: MemoListIterator<T, TResult, List<T>>,
    accumulator: TResult
  ): TResult;
  /**
   * @see _.reduceRight
   */
  reduceRight<T extends object, TResult>(
    collection: T | null | undefined,
    callback: MemoObjectIterator<T[keyof T], TResult, T>,
    accumulator: TResult
  ): TResult;
  /**
   * @see _.reduceRight
   */
  reduceRight<T>(collection: T[] | null | undefined, callback: MemoListIterator<T, T, T[]>): T | undefined;
  /**
   * @see _.reduceRight
   */
  reduceRight<T>(collection: List<T> | null | undefined, callback: MemoListIterator<T, T, List<T>>): T | undefined;
  /**
   * @see _.reduceRight
   */
  reduceRight<T extends object>(
    collection: T | null | undefined,
    callback: MemoObjectIterator<T[keyof T], T[keyof T], T>
  ): T[keyof T] | undefined;
}

declare interface LoDashStatic {
  /**
   * The opposite of _.filter; this method returns the elements of collection that predicate does not return
   * truthy for.
   *
   * @param collection The collection to iterate over.
   * @param predicate The function invoked per iteration.
   * @return Returns the new filtered array.
   */
  reject(collection: string | null | undefined, predicate?: StringIterator<boolean>): string[];
  /**
   * @see _.reject
   */
  reject<T>(collection: List<T> | null | undefined, predicate?: ListIterateeCustom<T, boolean>): T[];
  /**
   * @see _.reject
   */
  reject<T extends object>(
    collection: T | null | undefined,
    predicate?: ObjectIterateeCustom<T, boolean>
  ): Array<T[keyof T]>;
}

declare interface LoDashStatic {
  /**
   * Gets a random element from collection.
   *
   * @param collection The collection to sample.
   * @return Returns the random element.
   */
  sample<T>(collection: readonly [T, ...T[]]): T;
  /**
   * @see _.sample
   */
  sample<T>(collection: Dictionary<T> | NumericDictionary<T> | null | undefined): T | undefined;
  /**
   * @see _.sample
   */
  sample<T extends object>(collection: T | null | undefined): T[keyof T] | undefined;
}

declare interface LoDashStatic {
  /**
   * Gets n random elements at unique keys from collection up to the size of collection.
   *
   * @param collection The collection to sample.
   * @param n The number of elements to sample.
   * @return Returns the random elements.
   */
  sampleSize<T>(collection: Dictionary<T> | NumericDictionary<T> | null | undefined, n?: number): T[];
  /**
   * @see _.sampleSize
   */
  sampleSize<T extends object>(collection: T | null | undefined, n?: number): Array<T[keyof T]>;
}

declare interface LoDashStatic {
  /**
   * Creates an array of shuffled values, using a version of the Fisher-Yates shuffle.
   *
   * @param collection The collection to shuffle.
   * @return Returns the new shuffled array.
   */
  shuffle<T>(collection: List<T> | null | undefined): T[];
  /**
   * @see _.shuffle
   */
  shuffle<T extends object>(collection: T | null | undefined): Array<T[keyof T]>;
}

declare interface LoDashStatic {
  /**
   * Gets the size of collection by returning its length for array-like values or the number of own enumerable
   * properties for objects.
   *
   * @param collection The collection to inspect.
   * @return Returns the size of collection.
   */
  size(collection: object | string | null | undefined): number;
}

declare interface LoDashStatic {
  /**
   * Checks if predicate returns truthy for any element of collection. Iteration is stopped once predicate
   * returns truthy. The predicate is invoked with three arguments: (value, index|key, collection).
   *
   * @param collection The collection to iterate over.
   * @param predicate The function invoked per iteration.
   * @return Returns true if any element passes the predicate check, else false.
   */
  some<T>(collection: List<T> | null | undefined, predicate?: ListIterateeCustom<T, boolean>): boolean;
  /**
   * @see _.some
   */
  some<T extends object>(collection: T | null | undefined, predicate?: ObjectIterateeCustom<T, boolean>): boolean;
}

declare interface LoDashStatic {
  /**
   * Creates an array of elements, sorted in ascending order by the results of
   * running each element in a collection through each iteratee. This method
   * performs a stable sort, that is, it preserves the original sort order of
   * equal elements. The iteratees are invoked with one argument: (value).
   *
   * @category Collection
   * @param collection The collection to iterate over.
   * @param [iteratees=[_.identity]]
   *  The iteratees to sort by, specified individually or in arrays.
   * @returns Returns the new sorted array.
   * @example
   *
   * var users = [
   *   { 'user': 'fred',   'age': 48 },
   *   { 'user': 'barney', 'age': 36 },
   *   { 'user': 'fred',   'age': 42 },
   *   { 'user': 'barney', 'age': 34 }
   * ];
   *
   * _.sortBy(users, function(o) { return o.user; });
   * // => objects for [['barney', 36], ['barney', 34], ['fred', 48], ['fred', 42]]
   *
   * _.sortBy(users, ['user', 'age']);
   * // => objects for [['barney', 34], ['barney', 36], ['fred', 42], ['fred', 48]]
   *
   * _.sortBy(users, 'user', function(o) {
   *   return Math.floor(o.age / 10);
   * });
   * // => objects for [['barney', 36], ['barney', 34], ['fred', 48], ['fred', 42]]
   */
  sortBy<T>(collection: List<T> | null | undefined, ...iteratees: Array<Many<ListIteratee<T>>>): T[];
  /**
   * @see _.sortBy
   */
  sortBy<T extends object>(
    collection: T | null | undefined,
    ...iteratees: Array<Many<ObjectIteratee<T>>>
  ): Array<T[keyof T]>;
}

declare interface LoDashStatic {
  /*
   * Gets the number of milliseconds that have elapsed since the Unix epoch (1 January 1970 00:00:00 UTC).
   *
   * @return The number of milliseconds.
   */
  now(): number;
}

declare interface LoDashStatic {
  /**
   * The opposite of _.before; this method creates a function that invokes func once it’s called n or more times.
   *
   * @param n The number of calls before func is invoked.
   * @param func The function to restrict.
   * @return Returns the new restricted function.
   */
  after<TFunc extends (...args: any[]) => any>(n: number, func: TFunc): TFunc;
}

declare interface LoDashStatic {
  /**
   * Creates a function that accepts up to n arguments ignoring any additional arguments.
   *
   * @param func The function to cap arguments for.
   * @param n The arity cap.
   * @returns Returns the new function.
   */
  ary(func: (...args: any[]) => any, n?: number): (...args: any[]) => any;
}

declare interface LoDashStatic {
  /**
   * Creates a function that invokes func, with the this binding and arguments of the created function, while
   * it’s called less than n times. Subsequent calls to the created function return the result of the last func
   * invocation.
   *
   * @param n The number of calls at which func is no longer invoked.
   * @param func The function to restrict.
   * @return Returns the new restricted function.
   */
  before<TFunc extends (...args: any[]) => any>(n: number, func: TFunc): TFunc;
}

declare interface LoDashStatic {
  /**
   * Creates a function that invokes func with the this binding of thisArg and prepends any additional _.bind
   * arguments to those provided to the bound function.
   *
   * The _.bind.placeholder value, which defaults to _ in monolithic builds, may be used as a placeholder for
   * partially applied arguments.
   *
   * Note: Unlike native LoDashFunction#bind this method does not set the "length" property of bound functions.
   *
   * @param func The function to bind.
   * @param thisArg The this binding of func.
   * @param partials The arguments to be partially applied.
   * @return Returns the new bound function.
   */
  bind: FunctionBind;
}

declare interface LoDashStatic {
  /**
   * Creates a function that invokes the method at object[key] and prepends any additional _.bindKey arguments
   * to those provided to the bound function.
   *
   * This method differs from _.bind by allowing bound functions to reference methods that may be redefined
   * or don’t yet exist. See Peter Michaux’s article for more details.
   *
   * The _.bindKey.placeholder value, which defaults to _ in monolithic builds, may be used as a placeholder
   * for partially applied arguments.
   *
   * @param object The object the method belongs to.
   * @param key The key of the method.
   * @param partials The arguments to be partially applied.
   * @return Returns the new bound function.
   */
  bindKey: FunctionBindKey;
}

declare interface LoDashStatic {
  curry: Curry;
}

declare interface LoDashStatic {
  curryRight: CurryRight;
}

declare interface LoDashStatic {
  /**
   * Creates a debounced function that delays invoking func until after wait milliseconds have elapsed since
   * the last time the debounced function was invoked. The debounced function comes with a cancel method to
   * cancel delayed invocations and a flush method to immediately invoke them. Provide an options object to
   * indicate that func should be invoked on the leading and/or trailing edge of the wait timeout. Subsequent
   * calls to the debounced function return the result of the last func invocation.
   *
   * Note: If leading and trailing options are true, func is invoked on the trailing edge of the timeout only
   * if the the debounced function is invoked more than once during the wait timeout.
   *
   * See David Corbacho’s article for details over the differences between _.debounce and _.throttle.
   *
   * @param func The function to debounce.
   * @param wait The number of milliseconds to delay.
   * @param options The options object.
   * @param options.leading Specify invoking on the leading edge of the timeout.
   * @param options.maxWait The maximum time func is allowed to be delayed before it’s invoked.
   * @param options.trailing Specify invoking on the trailing edge of the timeout.
   * @return Returns the new debounced function.
   */
  debounce<T extends (...args: any) => any>(
    func: T,
    wait: number | undefined,
    options: DebounceSettingsLeading
  ): DebouncedFuncLeading<T>;
  debounce<T extends (...args: any) => any>(func: T, wait?: number, options?: DebounceSettings): DebouncedFunc<T>;
}

declare interface LoDashStatic {
  /**
   * Defers invoking the func until the current call stack has cleared. Any additional arguments are provided to
   * func when it’s invoked.
   *
   * @param func The function to defer.
   * @param args The arguments to invoke the function with.
   * @return Returns the timer id.
   */
  defer(func: (...args: any[]) => any, ...args: any[]): number;
}

declare interface LoDashStatic {
  /**
   * Invokes func after wait milliseconds. Any additional arguments are provided to func when it’s invoked.
   *
   * @param func The function to delay.
   * @param wait The number of milliseconds to delay invocation.
   * @param args The arguments to invoke the function with.
   * @return Returns the timer id.
   */
  delay(func: (...args: any[]) => any, wait: number, ...args: any[]): number;
}

declare interface LoDashStatic {
  /**
   * Creates a function that invokes `func` with arguments reversed.
   *
   * @category LoDashFunction
   * @param func The function to flip arguments for.
   * @returns Returns the new function.
   * @example
   *
   * var flipped = _.flip(function() {
   *   return _.toArray(arguments);
   * });
   *
   * flipped('a', 'b', 'c', 'd');
   * // => ['d', 'c', 'b', 'a']
   */
  flip<T extends (...args: any) => any>(func: T): T;
}

declare interface LoDashStatic {
  /**
   * Creates a function that memoizes the result of func. If resolver is provided it determines the cache key for
   * storing the result based on the arguments provided to the memoized function. By default, the first argument
   * provided to the memoized function is coerced to a string and used as the cache key. The func is invoked with
   * the this binding of the memoized function.
   *
   * @param func The function to have its output memoized.
   * @param resolver The function to resolve the cache key.
   * @return Returns the new memoizing function.
   */
  memoize: {
    <T extends (...args: any) => any>(func: T, resolver?: (...args: Parameters<T>) => any): T & MemoizedFunction;
    Cache: MapCacheConstructor;
  };
}

declare interface LoDashStatic {
  /**
   * Creates a function that negates the result of the predicate func. The func predicate is invoked with
   * the this binding and arguments of the created function.
   *
   * @param predicate The predicate to negate.
   * @return Returns the new function.
   */
  negate<T extends any[]>(predicate: (...args: T) => boolean): (...args: T) => boolean;
}

declare interface LoDashStatic {
  /**
   * Creates a function that is restricted to invoking func once. Repeat calls to the function return the value
   * of the first call. The func is invoked with the this binding and arguments of the created function.
   *
   * @param func The function to restrict.
   * @return Returns the new restricted function.
   */
  once<T extends (...args: any) => any>(func: T): T;
}

declare interface LoDashStatic {
  /**
   * Creates a function that runs each argument through a corresponding transform function.
   *
   * @param func The function to wrap.
   * @param transforms The functions to transform arguments, specified as individual functions or arrays
   * of functions.
   * @return Returns the new function.
   */
  overArgs(func: (...args: any[]) => any, ...transforms: Array<Many<(...args: any[]) => any>>): (...args: any[]) => any;
}

declare interface LoDashStatic {
  /**
   * Creates a function that, when called, invokes func with any additional partial arguments
   * prepended to those provided to the new function. This method is similar to _.bind except
   * it does not alter the this binding.
   * @param func The function to partially apply arguments to.
   * @param args Arguments to be partially applied.
   * @return The new partially applied function.
   */
  partial: LoDashPartial;
}

declare interface LoDashStatic {
  /**
   * This method is like _.partial except that partial arguments are appended to those provided
   * to the new function.
   * @param func The function to partially apply arguments to.
   * @param args Arguments to be partially applied.
   * @return The new partially applied function.
   */
  partialRight: PartialRight;
}

declare interface LoDashStatic {
  /**
   * Creates a function that invokes func with arguments arranged according to the specified indexes where the
   * argument value at the first index is provided as the first argument, the argument value at the second index
   * is provided as the second argument, and so on.
   * @param func The function to rearrange arguments for.
   * @param indexes The arranged argument indexes, specified as individual indexes or arrays of indexes.
   * @return Returns the new function.
   */
  rearg(func: (...args: any[]) => any, ...indexes: Array<Many<number>>): (...args: any[]) => any;
}

declare interface LoDashStatic {
  /**
   * Creates a function that invokes func with the this binding of the created function and arguments from start
   * and beyond provided as an array.
   *
   * Note: This method is based on the rest parameter.
   *
   * @param func The function to apply a rest parameter to.
   * @param start The start position of the rest parameter.
   * @return Returns the new function.
   */
  rest(func: (...args: any[]) => any, start?: number): (...args: any[]) => any;
}

declare interface LoDashStatic {
  /**
   * Creates a function that invokes func with the this binding of the created function and an array of arguments
   * much like LoDashFunction#apply.
   *
   * Note: This method is based on the spread operator.
   *
   * @param func The function to spread arguments over.
   * @return Returns the new function.
   */
  spread<TResult>(func: (...args: any[]) => TResult, start?: number): (...args: any[]) => TResult;
}

declare interface LoDashStatic {
  /**
   * Creates a throttled function that only invokes func at most once per every wait milliseconds. The throttled
   * function comes with a cancel method to cancel delayed invocations and a flush method to immediately invoke
   * them. Provide an options object to indicate that func should be invoked on the leading and/or trailing edge
   * of the wait timeout. Subsequent calls to the throttled function return the result of the last func call.
   *
   * Note: If leading and trailing options are true, func is invoked on the trailing edge of the timeout only if
   * the the throttled function is invoked more than once during the wait timeout.
   *
   * @param func The function to throttle.
   * @param wait The number of milliseconds to throttle invocations to.
   * @param options The options object.
   * @param options.leading Specify invoking on the leading edge of the timeout.
   * @param options.trailing Specify invoking on the trailing edge of the timeout.
   * @return Returns the new throttled function.
   */
  throttle<T extends (...args: any) => any>(func: T, wait?: number, options?: ThrottleSettings): DebouncedFunc<T>;
}

declare interface LoDashStatic {
  /**
   * Creates a function that accepts up to one argument, ignoring any
   * additional arguments.
   *
   * @category LoDashFunction
   * @param func The function to cap arguments for.
   * @returns Returns the new function.
   * @example
   *
   * _.map(['6', '8', '10'], _.unary(parseInt));
   * // => [6, 8, 10]
   */
  unary<T, TResult>(func: (arg1: T, ...args: any[]) => TResult): (arg1: T) => TResult;
}

declare interface LoDashStatic {
  /**
   * Creates a function that provides value to the wrapper function as its first argument. Any additional
   * arguments provided to the function are appended to those provided to the wrapper function. The wrapper is
   * invoked with the this binding of the created function.
   *
   * @param value The value to wrap.
   * @param wrapper The wrapper function.
   * @return Returns the new function.
   */
  wrap<T, TArgs, TResult>(value: T, wrapper: (value: T, ...args: TArgs[]) => TResult): (...args: TArgs[]) => TResult;
}

declare interface LoDashStatic {
  /**
   * Casts value as an array if it’s not one.
   *
   * @param value The value to inspect.
   * @return Returns the cast array.
   */
  castArray<T>(value?: Many<T>): T[];
}

declare interface LoDashStatic {
  /**
   * Creates a shallow clone of value.
   *
   * Note: This method is loosely based on the structured clone algorithm and supports cloning arrays,
   * array buffers, booleans, date objects, maps, numbers, Object objects, regexes, sets, strings, symbols,
   * and typed arrays. The own enumerable properties of arguments objects are cloned as plain objects. An empty
   * object is returned for uncloneable values such as error objects, functions, DOM nodes, and WeakMaps.
   *
   * @param value The value to clone.
   * @return Returns the cloned value.
   */
  clone<T>(value: T): T;
}

declare interface LoDashStatic {
  /**
   * This method is like _.clone except that it recursively clones value.
   *
   * @param value The value to recursively clone.
   * @return Returns the deep cloned value.
   */
  cloneDeep<T>(value: T): T;
}

declare interface LoDashStatic {
  /**
   * This method is like _.cloneWith except that it recursively clones value.
   *
   * @param value The value to recursively clone.
   * @param customizer The function to customize cloning.
   * @return Returns the deep cloned value.
   */
  cloneDeepWith<T>(value: T, customizer: CloneDeepWithCustomizer<T>): any;
  /**
   * @see _.cloneDeepWith
   */
  cloneDeepWith<T>(value: T): T;
}

declare interface LoDashStatic {
  /**
   * This method is like _.clone except that it accepts customizer which is invoked to produce the cloned value.
   * If customizer returns undefined cloning is handled by the method instead.
   *
   * @param value The value to clone.
   * @param customizer The function to customize cloning.
   * @return Returns the cloned value.
   */
  cloneWith<T, TResult extends object | string | number | boolean | null>(
    value: T,
    customizer: CloneWithCustomizer<T, TResult>
  ): TResult;
  /**
   * @see _.cloneWith
   */
  cloneWith<T, TResult>(value: T, customizer: CloneWithCustomizer<T, TResult | undefined>): TResult | T;
  /**
   * @see _.cloneWith
   */
  cloneWith<T>(value: T): T;
}

declare interface LoDashStatic {
  /**
   * Checks if object conforms to source by invoking the predicate properties of source with the
   * corresponding property values of object.
   *
   * Note: This method is equivalent to _.conforms when source is partially applied.
   */
  conformsTo<T>(object: T, source: ConformsPredicateObject<T>): boolean;
}

declare interface LoDashStatic {
  /**
   * Performs a [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
   * comparison between two values to determine if they are equivalent.
   *
   * @category Lang
   * @param value The value to compare.
   * @param other The other value to compare.
   * @returns Returns `true` if the values are equivalent, else `false`.
   * @example
   *
   * var object = { 'user': 'fred' };
   * var other = { 'user': 'fred' };
   *
   * _.eq(object, object);
   * // => true
   *
   * _.eq(object, other);
   * // => false
   *
   * _.eq('a', 'a');
   * // => true
   *
   * _.eq('a', Object('a'));
   * // => false
   *
   * _.eq(NaN, NaN);
   * // => true
   */
  eq(value: any, other: any): boolean;
}

declare interface LoDashStatic {
  /**
   * Checks if value is greater than other.
   *
   * @param value The value to compare.
   * @param other The other value to compare.
   * @return Returns true if value is greater than other, else false.
   */
  gt(value: any, other: any): boolean;
}

declare interface LoDashStatic {
  /**
   * Checks if value is greater than or equal to other.
   *
   * @param value The value to compare.
   * @param other The other value to compare.
   * @return Returns true if value is greater than or equal to other, else false.
   */
  gte(value: any, other: any): boolean;
}

declare interface LoDashStatic {
  /**
   * Checks if value is classified as an arguments object.
   *
   * @param value The value to check.
   * @return Returns true if value is correctly classified, else false.
   */
  isArguments(value?: any): value is IArguments;
}

declare interface LoDashStatic {
  /**
   * Checks if value is classified as an Array object.
   * @param value The value to check.
   *
   * @return Returns true if value is correctly classified, else false.
   */
  isArray(value?: any): value is any[];
  /**
   * @see _.isArray
   */
  isArray<T>(value?: any): value is any[];
}

declare interface LoDashStatic {
  /**
   * Checks if value is classified as an ArrayBuffer object.
   *
   * @param value The value to check.
   * @return Returns true if value is correctly classified, else false.
   */
  isArrayBuffer(value?: any): value is ArrayBuffer;
}

declare interface LoDashStatic {
  /**
   * Checks if `value` is array-like. A value is considered array-like if it's
   * not a function and has a `value.length` that's an integer greater than or
   * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
   *
   * @category Lang
   * @param value The value to check.
   * @returns Returns `true` if `value` is array-like, else `false`.
   * @example
   *
   * _.isArrayLike([1, 2, 3]);
   * // => true
   *
   * _.isArrayLike(document.body.children);
   * // => true
   *
   * _.isArrayLike('abc');
   * // => true
   *
   * _.isArrayLike(_.noop);
   * // => false
   */
  isArrayLike<T extends { __lodashAnyHack: any }>(t: T): boolean;
  /**
   * @see _.isArrayLike
   */
  isArrayLike(value: ((...args: any[]) => any) | null | undefined): value is never;
  /**
   * @see _.isArrayLike
   */
  isArrayLike(value: any): value is { length: number };
}

declare interface LoDashStatic {
  /**
   * This method is like `_.isArrayLike` except that it also checks if `value`
   * is an object.
   *
   * @category Lang
   * @param value The value to check.
   * @returns Returns `true` if `value` is an array-like object, else `false`.
   * @example
   *
   * _.isArrayLikeObject([1, 2, 3]);
   * // => true
   *
   * _.isArrayLikeObject(document.body.children);
   * // => true
   *
   * _.isArrayLikeObject('abc');
   * // => false
   *
   * _.isArrayLikeObject(_.noop);
   * // => false
   */
  isArrayLikeObject<T extends { __lodashAnyHack: any }>(value: T): boolean;
  /**
   * @see _.isArrayLikeObject
   */
  isArrayLikeObject(
    value: ((...args: any[]) => any) | FunctionBase | string | boolean | number | null | undefined
  ): value is never;
  /**
   * @see _.isArrayLikeObject
   */
  isArrayLikeObject(value: any): value is object & { length: number };
}

declare interface LoDashStatic {
  /**
   * Checks if value is classified as a boolean primitive or object.
   *
   * @param value The value to check.
   * @return Returns true if value is correctly classified, else false.
   */
  isBoolean(value?: any): value is boolean;
}

declare interface LoDashStatic {
  /**
   * Checks if value is a buffer.
   *
   * @param value The value to check.
   * @return Returns true if value is a buffer, else false.
   */
  isBuffer(value?: any): boolean;
}

declare interface LoDashStatic {
  /**
   * Checks if value is classified as a Date object.
   * @param value The value to check.
   *
   * @return Returns true if value is correctly classified, else false.
   */
  isDate(value?: any): value is Date;
}

declare interface LoDashStatic {
  /**
   * Checks if value is a DOM element.
   *
   * @param value The value to check.
   * @return Returns true if value is a DOM element, else false.
   */
  isElement(value?: any): boolean;
}

declare interface LoDashStatic {
  /**
   * Checks if value is empty. A value is considered empty unless it’s an arguments object, array, string, or
   * jQuery-like collection with a length greater than 0 or an object with own enumerable properties.
   *
   * @param value The value to inspect.
   * @return Returns true if value is empty, else false.
   */
  isEmpty<T extends { __trapAny: any }>(value?: T): boolean;
  isEmpty(value: string): value is '';
  isEmpty(value: Map<any, any> | Set<any> | List<any> | null | undefined): boolean;
  isEmpty(value: object): boolean;
  isEmpty<T extends object>(value: T | null | undefined): value is EmptyObjectOf<T> | null | undefined;
  isEmpty(value?: any): boolean;
}

declare interface LoDashStatic {
  /**
   * Performs a deep comparison between two values to determine if they are
   * equivalent.
   *
   * **Note:** This method supports comparing arrays, array buffers, booleans,
   * date objects, error objects, maps, numbers, `Object` objects, regexes,
   * sets, strings, symbols, and typed arrays. `Object` objects are compared
   * by their own, not inherited, enumerable properties. Functions and DOM
   * nodes are **not** supported.
   *
   * @category Lang
   * @param value The value to compare.
   * @param other The other value to compare.
   * @returns Returns `true` if the values are equivalent, else `false`.
   * @example
   *
   * var object = { 'user': 'fred' };
   * var other = { 'user': 'fred' };
   *
   * _.isEqual(object, other);
   * // => true
   *
   * object === other;
   * // => false
   */
  isEqual(value: any, other: any): boolean;
}

declare interface LoDashStatic {
  /**
   * This method is like `_.isEqual` except that it accepts `customizer` which is
   * invoked to compare values. If `customizer` returns `undefined` comparisons are
   * handled by the method instead. The `customizer` is invoked with up to seven arguments:
   * (objValue, othValue [, index|key, object, other, stack]).
   *
   * @category Lang
   * @param value The value to compare.
   * @param other The other value to compare.
   * @param [customizer] The function to customize comparisons.
   * @returns Returns `true` if the values are equivalent, else `false`.
   * @example
   *
   * function isGreeting(value) {
   *   return /^h(?:i|ello)$/.test(value);
   * }
   *
   * function customizer(objValue, othValue) {
   *   if (isGreeting(objValue) && isGreeting(othValue)) {
   *     return true;
   *   }
   * }
   *
   * var array = ['hello', 'goodbye'];
   * var other = ['hi', 'goodbye'];
   *
   * _.isEqualWith(array, other, customizer);
   * // => true
   */
  isEqualWith(value: any, other: any, customizer?: IsEqualCustomizer): boolean;
}

declare interface LoDashStatic {
  /**
   * Checks if value is an Error, EvalError, RangeError, ReferenceError, SyntaxError, TypeError, or URIError
   * object.
   *
   * @param value The value to check.
   * @return Returns true if value is an error object, else false.
   */
  isError(value: any): value is Error;
}

declare interface LoDashStatic {
  /**
   * Checks if value is a finite primitive number.
   *
   * Note: This method is based on Number.isFinite.
   *
   * @param value The value to check.
   * @return Returns true if value is a finite number, else false.
   */
  isFinite(value?: any): boolean;
}

declare interface LoDashStatic {
  /**
   * Checks if value is a callable function.
   *
   * @param value The value to check.
   * @return Returns true if value is correctly classified, else false.
   */
  isFunction(value: any): value is (...args: any[]) => any;
}

declare interface LoDashStatic {
  /**
   * Checks if `value` is an integer.
   *
   * **Note:** This method is based on [`Number.isInteger`](https://mdn.io/Number/isInteger).
   *
   * @category Lang
   * @param value The value to check.
   * @returns Returns `true` if `value` is an integer, else `false`.
   * @example
   *
   * _.isInteger(3);
   * // => true
   *
   * _.isInteger(Number.MIN_VALUE);
   * // => false
   *
   * _.isInteger(Infinity);
   * // => false
   *
   * _.isInteger('3');
   * // => false
   */
  isInteger(value?: any): boolean;
}

declare interface LoDashStatic {
  /**
   * Checks if `value` is a valid array-like length.
   *
   * **Note:** This function is loosely based on [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
   *
   * @category Lang
   * @param value The value to check.
   * @returns Returns `true` if `value` is a valid length, else `false`.
   * @example
   *
   * _.isLength(3);
   * // => true
   *
   * _.isLength(Number.MIN_VALUE);
   * // => false
   *
   * _.isLength(Infinity);
   * // => false
   *
   * _.isLength('3');
   * // => false
   */
  isLength(value?: any): boolean;
}

declare interface LoDashStatic {
  /**
   * Checks if value is classified as a Map object.
   *
   * @param value The value to check.
   * @returns Returns true if value is correctly classified, else false.
   */
  isMap(value?: any): value is Map<any, any>;
}

declare interface LoDashStatic {
  /**
   * Performs a deep comparison between `object` and `source` to determine if
   * `object` contains equivalent property values.
   *
   * **Note:** This method supports comparing the same values as `_.isEqual`.
   *
   * @category Lang
   * @param object The object to inspect.
   * @param source The object of property values to match.
   * @returns Returns `true` if `object` is a match, else `false`.
   * @example
   *
   * var object = { 'user': 'fred', 'age': 40 };
   *
   * _.isMatch(object, { 'age': 40 });
   * // => true
   *
   * _.isMatch(object, { 'age': 36 });
   * // => false
   */
  isMatch(object: object, source: object): boolean;
}

declare interface LoDashStatic {
  /**
   * This method is like `_.isMatch` except that it accepts `customizer` which
   * is invoked to compare values. If `customizer` returns `undefined` comparisons
   * are handled by the method instead. The `customizer` is invoked with three
   * arguments: (objValue, srcValue, index|key, object, source).
   *
   * @category Lang
   * @param object The object to inspect.
   * @param source The object of property values to match.
   * @param [customizer] The function to customize comparisons.
   * @returns Returns `true` if `object` is a match, else `false`.
   * @example
   *
   * function isGreeting(value) {
   *   return /^h(?:i|ello)$/.test(value);
   * }
   *
   * function customizer(objValue, srcValue) {
   *   if (isGreeting(objValue) && isGreeting(srcValue)) {
   *     return true;
   *   }
   * }
   *
   * var object = { 'greeting': 'hello' };
   * var source = { 'greeting': 'hi' };
   *
   * _.isMatchWith(object, source, customizer);
   * // => true
   */
  isMatchWith(object: object, source: object, customizer: isMatchWithCustomizer): boolean;
}

declare interface LoDashStatic {
  /**
   * Checks if value is NaN.
   *
   * Note: This method is not the same as isNaN which returns true for undefined and other non-numeric values.
   *
   * @param value The value to check.
   * @return Returns true if value is NaN, else false.
   */
  isNaN(value?: any): boolean;
}

declare interface LoDashStatic {
  /**
   * Checks if value is a native function.
   * @param value The value to check.
   *
   * @return Returns true if value is a native function, else false.
   */
  isNative(value: any): value is (...args: any[]) => any;
}

declare interface LoDashStatic {
  /**
   * Checks if `value` is `null` or `undefined`.
   *
   * @category Lang
   * @param value The value to check.
   * @returns Returns `true` if `value` is nullish, else `false`.
   * @example
   *
   * _.isNil(null);
   * // => true
   *
   * _.isNil(void 0);
   * // => true
   *
   * _.isNil(NaN);
   * // => false
   */
  isNil(value: any): value is null | undefined;
}

declare interface LoDashStatic {
  /**
   * Checks if value is null.
   *
   * @param value The value to check.
   * @return Returns true if value is null, else false.
   */
  isNull(value: any): value is null;
}

declare interface LoDashStatic {
  /**
   * Checks if value is classified as a Number primitive or object.
   *
   * Note: To exclude Infinity, -Infinity, and NaN, which are classified as numbers, use the _.isFinite method.
   *
   * @param value The value to check.
   * @return Returns true if value is correctly classified, else false.
   */
  isNumber(value?: any): value is number;
}

declare interface LoDashStatic {
  /**
   * Checks if value is the language type of Object. (e.g. arrays, functions, objects, regexes, new Number(0),
   * and new String(''))
   *
   * @param value The value to check.
   * @return Returns true if value is an object, else false.
   */
  isObject(value?: any): value is object;
}

declare interface LoDashStatic {
  /**
   * Checks if `value` is object-like. A value is object-like if it's not `null`
   * and has a `typeof` result of "object".
   *
   * @category Lang
   * @param value The value to check.
   * @returns Returns `true` if `value` is object-like, else `false`.
   * @example
   *
   * _.isObjectLike({});
   * // => true
   *
   * _.isObjectLike([1, 2, 3]);
   * // => true
   *
   * _.isObjectLike(_.noop);
   * // => false
   *
   * _.isObjectLike(null);
   * // => false
   */
  isObjectLike(value?: any): boolean;
}

declare interface LoDashStatic {
  /**
   * Checks if value is a plain object, that is, an object created by the Object constructor or one with a
   * [[Prototype]] of null.
   *
   * Note: This method assumes objects created by the Object constructor have no inherited enumerable properties.
   *
   * @param value The value to check.
   * @return Returns true if value is a plain object, else false.
   */
  isPlainObject(value?: any): boolean;
}

declare interface LoDashStatic {
  /**
   * Checks if value is classified as a RegExp object.
   * @param value The value to check.
   *
   * @return Returns true if value is correctly classified, else false.
   */
  isRegExp(value?: any): value is RegExp;
}

declare interface LoDashStatic {
  /**
   * Checks if `value` is a safe integer. An integer is safe if it's an IEEE-754
   * double precision number which isn't the result of a rounded unsafe integer.
   *
   * **Note:** This method is based on [`Number.isSafeInteger`](https://mdn.io/Number/isSafeInteger).
   *
   * @category Lang
   * @param value The value to check.
   * @returns Returns `true` if `value` is a safe integer, else `false`.
   * @example
   *
   * _.isSafeInteger(3);
   * // => true
   *
   * _.isSafeInteger(Number.MIN_VALUE);
   * // => false
   *
   * _.isSafeInteger(Infinity);
   * // => false
   *
   * _.isSafeInteger('3');
   * // => false
   */
  isSafeInteger(value: any): boolean;
}

declare interface LoDashStatic {
  /**
   * Checks if value is classified as a Set object.
   *
   * @param value The value to check.
   * @returns Returns true if value is correctly classified, else false.
   */
  isSet(value?: any): value is Set<any>;
}

declare interface LoDashStatic {
  /**
   * Checks if value is classified as a String primitive or object.
   *
   * @param value The value to check.
   * @return Returns true if value is correctly classified, else false.
   */
  isString(value?: any): value is string;
}

declare interface LoDashStatic {
  /**
   * Checks if `value` is classified as a `Symbol` primitive or object.
   *
   * @category Lang
   * @param value The value to check.
   * @returns Returns `true` if `value` is correctly classified, else `false`.
   * @example
   *
   * _.isSymbol(Symbol.iterator);
   * // => true
   *
   * _.isSymbol('abc');
   * // => false
   */
  isSymbol(value: any): value is symbol;
}

declare interface LoDashStatic {
  /**
   * Checks if value is classified as a typed array.
   *
   * @param value The value to check.
   * @return Returns true if value is correctly classified, else false.
   */
  isTypedArray(value: any): boolean;
}

declare interface LoDashStatic {
  /**
   * Checks if value is undefined.
   *
   * @param value The value to check.
   * @return Returns true if value is undefined, else false.
   */
  isUndefined(value: any): value is undefined;
}

declare interface LoDashStatic {
  /**
   * Checks if value is classified as a WeakMap object.
   *
   * @param value The value to check.
   * @returns Returns true if value is correctly classified, else false.
   */
  isWeakMap(value?: any): value is WeakMap<object, any>;
}

declare interface LoDashStatic {
  /**
   * Checks if value is classified as a WeakSet object.
   *
   * @param value The value to check.
   * @returns Returns true if value is correctly classified, else false.
   */
  isWeakSet(value?: any): value is WeakSet<object>;
}

declare interface LoDashStatic {
  /**
   * Checks if value is less than other.
   *
   * @param value The value to compare.
   * @param other The other value to compare.
   * @return Returns true if value is less than other, else false.
   */
  lt(value: any, other: any): boolean;
}

declare interface LoDashStatic {
  /**
   * Checks if value is less than or equal to other.
   *
   * @param value The value to compare.
   * @param other The other value to compare.
   * @return Returns true if value is less than or equal to other, else false.
   */
  lte(value: any, other: any): boolean;
}

declare interface LoDashStatic {
  /**
   * Converts value to an array.
   *
   * @param value The value to convert.
   * @return Returns the converted array.
   */
  toArray<T>(value: Dictionary<T> | NumericDictionary<T> | null | undefined): T[];
  /**
   * @see _.toArray
   */
  toArray<T>(value: T): Array<T[keyof T]>;
  /**
   * @see _.toArray
   */
  toArray(): any[];
}

declare interface LoDashStatic {
  /**
   * Converts `value` to a finite number.
   *
   * @since 4.12.0
   * @category Lang
   * @param value The value to convert.
   * @returns Returns the converted number.
   * @example
   *
   * _.toFinite(3.2);
   * // => 3.2
   *
   * _.toFinite(Number.MIN_VALUE);
   * // => 5e-324
   *
   * _.toFinite(Infinity);
   * // => 1.7976931348623157e+308
   *
   * _.toFinite('3.2');
   * // => 3.2
   */
  toFinite(value: any): number;
}

declare interface LoDashStatic {
  /**
   * Converts `value` to an integer.
   *
   * **Note:** This function is loosely based on [`ToInteger`](http://www.ecma-international.org/ecma-262/6.0/#sec-tointeger).
   *
   * @category Lang
   * @param value The value to convert.
   * @returns Returns the converted integer.
   * @example
   *
   * _.toInteger(3);
   * // => 3
   *
   * _.toInteger(Number.MIN_VALUE);
   * // => 0
   *
   * _.toInteger(Infinity);
   * // => 1.7976931348623157e+308
   *
   * _.toInteger('3');
   * // => 3
   */
  toInteger(value: any): number;
}

declare interface LoDashStatic {
  /**
   * Converts `value` to an integer suitable for use as the length of an
   * array-like object.
   *
   * **Note:** This method is based on [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
   *
   * @category Lang
   * @param value The value to convert.
   * @return Returns the converted integer.
   * @example
   *
   * _.toLength(3);
   * // => 3
   *
   * _.toLength(Number.MIN_VALUE);
   * // => 0
   *
   * _.toLength(Infinity);
   * // => 4294967295
   *
   * _.toLength('3');
   * // => 3
   */
  toLength(value: any): number;
}

declare interface LoDashStatic {
  /**
   * Converts `value` to a number.
   *
   * @category Lang
   * @param value The value to process.
   * @returns Returns the number.
   * @example
   *
   * _.toNumber(3);
   * // => 3
   *
   * _.toNumber(Number.MIN_VALUE);
   * // => 5e-324
   *
   * _.toNumber(Infinity);
   * // => Infinity
   *
   * _.toNumber('3');
   * // => 3
   */
  toNumber(value: any): number;
}

declare interface LoDashStatic {
  /**
   * Converts value to a plain object flattening inherited enumerable properties of value to own properties
   * of the plain object.
   *
   * @param value The value to convert.
   * @return Returns the converted plain object.
   */
  toPlainObject(value?: any): any;
}

declare interface LoDashStatic {
  /**
   * Converts `value` to a safe integer. A safe integer can be compared and
   * represented correctly.
   *
   * @category Lang
   * @param value The value to convert.
   * @returns Returns the converted integer.
   * @example
   *
   * _.toSafeInteger(3);
   * // => 3
   *
   * _.toSafeInteger(Number.MIN_VALUE);
   * // => 0
   *
   * _.toSafeInteger(Infinity);
   * // => 9007199254740991
   *
   * _.toSafeInteger('3');
   * // => 3
   */
  toSafeInteger(value: any): number;
}

declare interface LoDashStatic {
  /**
   * Converts `value` to a string if it's not one. An empty string is returned
   * for `null` and `undefined` values. The sign of `-0` is preserved.
   *
   * @category Lang
   * @param value The value to process.
   * @returns Returns the string.
   * @example
   *
   * _.toString(null);
   * // => ''
   *
   * _.toString(-0);
   * // => '-0'
   *
   * _.toString([1, 2, 3]);
   * // => '1,2,3'
   */
  toString(value: any): string;
}

declare interface LoDashStatic {
  /**
   * Adds two numbers.
   *
   * @param augend The first number to add.
   * @param addend The second number to add.
   * @return Returns the sum.
   */
  add(augend: number, addend: number): number;
}

declare interface LoDashStatic {
  /**
   * Calculates n rounded up to precision.
   *
   * @param n The number to round up.
   * @param precision The precision to round up to.
   * @return Returns the rounded up number.
   */
  ceil(n: number, precision?: number): number;
}

declare interface LoDashStatic {
  /**
   * Divide two numbers.
   *
   * @param dividend The first number in a division.
   * @param divisor The second number in a division.
   * @returns Returns the quotient.
   */
  divide(dividend: number, divisor: number): number;
}

declare interface LoDashStatic {
  /**
   * Calculates n rounded down to precision.
   *
   * @param n The number to round down.
   * @param precision The precision to round down to.
   * @return Returns the rounded down number.
   */
  floor(n: number, precision?: number): number;
}

declare interface LoDashStatic {
  /**
   * Computes the maximum value of `array`. If `array` is empty or falsey
   * `undefined` is returned.
   *
   * @category Math
   * @param array The array to iterate over.
   * @returns Returns the maximum value.
   */
  max<T>(collection: List<T> | null | undefined): T | undefined;
}

declare interface LoDashStatic {
  /**
   * This method is like `_.max` except that it accepts `iteratee` which is
   * invoked for each element in `array` to generate the criterion by which
   * the value is ranked. The iteratee is invoked with one argument: (value).
   *
   * @category Math
   * @param array The array to iterate over.
   * @param iteratee The iteratee invoked per element.
   * @returns Returns the maximum value.
   * @example
   *
   * var objects = [{ 'n': 1 }, { 'n': 2 }];
   *
   * _.maxBy(objects, function(o) { return o.n; });
   * // => { 'n': 2 }
   *
   * // using the `_.property` iteratee shorthand
   * _.maxBy(objects, 'n');
   * // => { 'n': 2 }
   */
  maxBy<T>(collection: List<T> | null | undefined, iteratee?: ValueIteratee<T>): T | undefined;
}

declare interface LoDashStatic {
  /**
   * Computes the mean of the values in `array`.
   *
   * @category Math
   * @param array The array to iterate over.
   * @returns Returns the mean.
   * @example
   *
   * _.mean([4, 2, 8, 6]);
   * // => 5
   */
  mean(collection: List<any> | null | undefined): number;
}

declare interface LoDashStatic {
  /**
   * Computes the mean of the provided properties of the objects in the `array`
   *
   * @category Math
   * @param array The array to iterate over.
   * @param iteratee The iteratee invoked per element.
   * @returns Returns the mean.
   * @example
   *
   * _.mean([{ 'n': 4 }, { 'n': 2 }, { 'n': 8 }, { 'n': 6 }], 'n');
   * // => 5
   */
  meanBy<T>(collection: List<T> | null | undefined, iteratee?: ValueIteratee<T>): number;
}

declare interface LoDashStatic {
  /**
   * Computes the minimum value of `array`. If `array` is empty or falsey
   * `undefined` is returned.
   *
   * @category Math
   * @param array The array to iterate over.
   * @returns Returns the minimum value.
   */
  min<T>(collection: List<T> | null | undefined): T | undefined;
}

declare interface LoDashStatic {
  /**
   * This method is like `_.min` except that it accepts `iteratee` which is
   * invoked for each element in `array` to generate the criterion by which
   * the value is ranked. The iteratee is invoked with one argument: (value).
   *
   * @category Math
   * @param array The array to iterate over.
   * @param iteratee The iteratee invoked per element.
   * @returns Returns the minimum value.
   * @example
   *
   * var objects = [{ 'n': 1 }, { 'n': 2 }];
   *
   * _.minBy(objects, function(o) { return o.a; });
   * // => { 'n': 1 }
   *
   * // using the `_.property` iteratee shorthand
   * _.minBy(objects, 'n');
   * // => { 'n': 1 }
   */
  minBy<T>(collection: List<T> | null | undefined, iteratee?: ValueIteratee<T>): T | undefined;
}

declare interface LoDashStatic {
  /**
   * Multiply two numbers.
   * @param multiplier The first number in a multiplication.
   * @param multiplicand The second number in a multiplication.
   * @returns Returns the product.
   */
  multiply(multiplier: number, multiplicand: number): number;
}

declare interface LoDashStatic {
  /**
   * Calculates n rounded to precision.
   *
   * @param n The number to round.
   * @param precision The precision to round to.
   * @return Returns the rounded number.
   */
  round(n: number, precision?: number): number;
}

declare interface LoDashStatic {
  /**
   * Subtract two numbers.
   *
   * @category Math
   * @param minuend The first number in a subtraction.
   * @param subtrahend The second number in a subtraction.
   * @returns Returns the difference.
   * @example
   *
   * _.subtract(6, 4);
   * // => 2
   */
  subtract(minuend: number, subtrahend: number): number;
}

declare interface LoDashStatic {
  /**
   * Computes the sum of the values in `array`.
   *
   * @category Math
   * @param array The array to iterate over.
   * @returns Returns the sum.
   * @example
   *
   * _.sum([4, 2, 8, 6]);
   * // => 20
   */
  sum(collection: List<any> | null | undefined): number;
}

declare interface LoDashStatic {
  /**
   * This method is like `_.sum` except that it accepts `iteratee` which is
   * invoked for each element in `array` to generate the value to be summed.
   * The iteratee is invoked with one argument: (value).
   *
   * @category Math
   * @param array The array to iterate over.
   * @param [iteratee=_.identity] The iteratee invoked per element.
   * @returns Returns the sum.
   * @example
   *
   * var objects = [{ 'n': 4 }, { 'n': 2 }, { 'n': 8 }, { 'n': 6 }];
   *
   * _.sumBy(objects, function(o) { return o.n; });
   * // => 20
   *
   * // using the `_.property` iteratee shorthand
   * _.sumBy(objects, 'n');
   * // => 20
   */
  sumBy<T>(collection: List<T> | null | undefined, iteratee?: ((value: T) => number) | string): number;
}

declare interface LoDashStatic {
  /**
   * Clamps `number` within the inclusive `lower` and `upper` bounds.
   *
   * @category Number
   * @param number The number to clamp.
   * @param [lower] The lower bound.
   * @param upper The upper bound.
   * @returns Returns the clamped number.
   * @example
   *
   * _.clamp(-10, -5, 5);
   * // => -5
   *
   * _.clamp(10, -5, 5);
   * // => 5
   * Clamps `number` within the inclusive `lower` and `upper` bounds.
   *
   * @category Number
   * @param number The number to clamp.
   * @param [lower] The lower bound.
   * @param upper The upper bound.
   * @returns Returns the clamped number.
   * @example
   *
   * _.clamp(-10, -5, 5);
   * // => -5
   *
   * _.clamp(10, -5, 5);
   */
  clamp(number: number, lower: number, upper: number): number;
  /**
   * @see _.clamp
   */
  clamp(number: number, upper: number): number;
}

declare interface LoDashStatic {
  /**
   * Checks if n is between start and up to but not including, end. If end is not specified it’s set to start
   * with start then set to 0.
   *
   * @param n The number to check.
   * @param start The start of the range.
   * @param end The end of the range.
   * @return Returns true if n is in the range, else false.
   */
  inRange(n: number, start: number, end?: number): boolean;
}

declare interface LoDashStatic {
  /**
   * Produces a random number between min and max (inclusive). If only one argument is provided a number between
   * 0 and the given number is returned. If floating is true, or either min or max are floats, a floating-point
   * number is returned instead of an integer.
   *
   * @param min The minimum possible value.
   * @param max The maximum possible value.
   * @param floating Specify returning a floating-point number.
   * @return Returns the random number.
   */
  random(floating?: boolean): number;
  /**
   * @see _.random
   */
  random(max: number, floating?: boolean): number;
  /**
   * @see _.random
   */
  random(min: number, max: number, floating?: boolean): number;
  /**
   * @see _.random
   */
  random(min: number, index: string | number, guard: object): number;
}

declare interface LoDashStatic {
  /**
   * Assigns own enumerable properties of source objects to the destination
   * object. Source objects are applied from left to right. Subsequent sources
   * overwrite property assignments of previous sources.
   *
   * **Note:** This method mutates `object` and is loosely based on
   * [`Object.assign`](https://mdn.io/Object/assign).
   *
   * @category Object
   * @param object The destination object.
   * @param [sources] The source objects.
   * @returns Returns `object`.
   * @example
   *
   * function Foo() {
   *   this.c = 3;
   * }
   *
   * function Bar() {
   *   this.e = 5;
   * }
   *
   * Foo.prototype.d = 4;
   * Bar.prototype.f = 6;
   *
   * _.assign({ 'a': 1 }, new Foo, new Bar);
   * // => { 'a': 1, 'c': 3, 'e': 5 }
   */
  assign<TObject, TSource>(object: TObject, source: TSource): TObject & TSource;
  /**
   * @see _.assign
   */
  assign<TObject, TSource1, TSource2>(
    object: TObject,
    source1: TSource1,
    source2: TSource2
  ): TObject & TSource1 & TSource2;
  /**
   * @see _.assign
   */
  assign<TObject, TSource1, TSource2, TSource3>(
    object: TObject,
    source1: TSource1,
    source2: TSource2,
    source3: TSource3
  ): TObject & TSource1 & TSource2 & TSource3;
  /**
   * @see _.assign
   */
  assign<TObject, TSource1, TSource2, TSource3, TSource4>(
    object: TObject,
    source1: TSource1,
    source2: TSource2,
    source3: TSource3,
    source4: TSource4
  ): TObject & TSource1 & TSource2 & TSource3 & TSource4;
  /**
   * @see _.assign
   */
  assign<TObject>(object: TObject): TObject;
  /**
   * @see _.assign
   */
  assign(object: any, ...otherArgs: any[]): any;
}

declare interface LoDashStatic {
  /**
   * This method is like `_.assign` except that it iterates over own and
   * inherited source properties.
   *
   * **Note:** This method mutates `object`.
   *
   * @alias extend
   * @category Object
   * @param object The destination object.
   * @param [sources] The source objects.
   * @returns Returns `object`.
   * @example
   *
   * function Foo() {
   *   this.b = 2;
   * }
   *
   * function Bar() {
   *   this.d = 4;
   * }
   *
   * Foo.prototype.c = 3;
   * Bar.prototype.e = 5;
   *
   * _.assignIn({ 'a': 1 }, new Foo, new Bar);
   * // => { 'a': 1, 'b': 2, 'c': 3, 'd': 4, 'e': 5 }
   */
  assignIn<TObject, TSource>(object: TObject, source: TSource): TObject & TSource;
  /**
   * @see _.assignIn
   */
  assignIn<TObject, TSource1, TSource2>(
    object: TObject,
    source1: TSource1,
    source2: TSource2
  ): TObject & TSource1 & TSource2;
  /**
   * @see _.assignIn
   */
  assignIn<TObject, TSource1, TSource2, TSource3>(
    object: TObject,
    source1: TSource1,
    source2: TSource2,
    source3: TSource3
  ): TObject & TSource1 & TSource2 & TSource3;
  /**
   * @see _.assignIn
   */
  assignIn<TObject, TSource1, TSource2, TSource3, TSource4>(
    object: TObject,
    source1: TSource1,
    source2: TSource2,
    source3: TSource3,
    source4: TSource4
  ): TObject & TSource1 & TSource2 & TSource3 & TSource4;
  /**
   * @see _.assignIn
   */
  assignIn<TObject>(object: TObject): TObject;
  /**
   * @see _.assignIn
   */
  assignIn<TResult>(object: any, ...otherArgs: any[]): TResult;
}

declare interface LoDashStatic {
  /**
   * This method is like `_.assignIn` except that it accepts `customizer` which
   * is invoked to produce the assigned values. If `customizer` returns `undefined`
   * assignment is handled by the method instead. The `customizer` is invoked
   * with five arguments: (objValue, srcValue, key, object, source).
   *
   * **Note:** This method mutates `object`.
   *
   * @alias extendWith
   * @category Object
   * @param object The destination object.
   * @param sources The source objects.
   * @param [customizer] The function to customize assigned values.
   * @returns Returns `object`.
   * @example
   *
   * function customizer(objValue, srcValue) {
   *   return _.isUndefined(objValue) ? srcValue : objValue;
   * }
   *
   * var defaults = _.partialRight(_.assignInWith, customizer);
   *
   * defaults({ 'a': 1 }, { 'b': 2 }, { 'a': 3 });
   * // => { 'a': 1, 'b': 2 }
   */
  assignInWith<TObject, TSource>(object: TObject, source: TSource, customizer: AssignCustomizer): TObject & TSource;
  /**
   * @see _.assignInWith
   */
  assignInWith<TObject, TSource1, TSource2>(
    object: TObject,
    source1: TSource1,
    source2: TSource2,
    customizer: AssignCustomizer
  ): TObject & TSource1 & TSource2;
  /**
   * @see _.assignInWith
   */
  assignInWith<TObject, TSource1, TSource2, TSource3>(
    object: TObject,
    source1: TSource1,
    source2: TSource2,
    source3: TSource3,
    customizer: AssignCustomizer
  ): TObject & TSource1 & TSource2 & TSource3;
  /**
   * @see _.assignInWith
   */
  assignInWith<TObject, TSource1, TSource2, TSource3, TSource4>(
    object: TObject,
    source1: TSource1,
    source2: TSource2,
    source3: TSource3,
    source4: TSource4,
    customizer: AssignCustomizer
  ): TObject & TSource1 & TSource2 & TSource3 & TSource4;
  /**
   * @see _.assignInWith
   */
  assignInWith<TObject>(object: TObject): TObject;
  /**
   * @see _.assignInWith
   */
  assignInWith<TResult>(object: any, ...otherArgs: any[]): TResult;
}

declare interface LoDashStatic {
  /**
   * This method is like `_.assign` except that it accepts `customizer` which
   * is invoked to produce the assigned values. If `customizer` returns `undefined`
   * assignment is handled by the method instead. The `customizer` is invoked
   * with five arguments: (objValue, srcValue, key, object, source).
   *
   * **Note:** This method mutates `object`.
   *
   * @category Object
   * @param object The destination object.
   * @param sources The source objects.
   * @param [customizer] The function to customize assigned values.
   * @returns Returns `object`.
   * @example
   *
   * function customizer(objValue, srcValue) {
   *   return _.isUndefined(objValue) ? srcValue : objValue;
   * }
   *
   * var defaults = _.partialRight(_.assignWith, customizer);
   *
   * defaults({ 'a': 1 }, { 'b': 2 }, { 'a': 3 });
   * // => { 'a': 1, 'b': 2 }
   */
  assignWith<TObject, TSource>(object: TObject, source: TSource, customizer: AssignCustomizer): TObject & TSource;
  /**
   * @see _.assignWith
   */
  assignWith<TObject, TSource1, TSource2>(
    object: TObject,
    source1: TSource1,
    source2: TSource2,
    customizer: AssignCustomizer
  ): TObject & TSource1 & TSource2;
  /**
   * @see _.assignWith
   */
  assignWith<TObject, TSource1, TSource2, TSource3>(
    object: TObject,
    source1: TSource1,
    source2: TSource2,
    source3: TSource3,
    customizer: AssignCustomizer
  ): TObject & TSource1 & TSource2 & TSource3;
  /**
   * @see _.assignWith
   */
  assignWith<TObject, TSource1, TSource2, TSource3, TSource4>(
    object: TObject,
    source1: TSource1,
    source2: TSource2,
    source3: TSource3,
    source4: TSource4,
    customizer: AssignCustomizer
  ): TObject & TSource1 & TSource2 & TSource3 & TSource4;
  /**
   * @see _.assignWith
   */
  assignWith<TObject>(object: TObject): TObject;
  /**
   * @see _.assignWith
   */
  assignWith<TResult>(object: any, ...otherArgs: any[]): TResult;
}

declare interface LoDashStatic {
  /**
   * Creates an array of elements corresponding to the given keys, or indexes, of collection. Keys may be
   * specified as individual arguments or as arrays of keys.
   *
   * @param object The object to iterate over.
   * @param props The property names or indexes of elements to pick, specified individually or in arrays.
   * @return Returns the new array of picked elements.
   */
  at<T>(object: Dictionary<T> | NumericDictionary<T> | null | undefined, ...props: PropertyPath[]): T[];
  /**
   * @see _.at
   */
  at<T extends object>(object: T | null | undefined, ...props: Array<Many<keyof T>>): Array<T[keyof T]>;
}

declare interface LoDashStatic {
  /**
   * Creates an object that inherits from the given prototype object. If a properties object is provided its own
   * enumerable properties are assigned to the created object.
   *
   * @param prototype The object to inherit from.
   * @param properties The properties to assign to the object.
   * @return Returns the new object.
   */
  create<T extends object, U extends object>(prototype: T, properties?: U): T & U;
}

declare interface LoDashStatic {
  /**
   * Assigns own enumerable properties of source object(s) to the destination object for all destination
   * properties that resolve to undefined. Once a property is set, additional values of the same property are
   * ignored.
   *
   * Note: This method mutates object.
   *
   * @param object The destination object.
   * @param sources The source objects.
   * @return The destination object.
   */
  defaults<TObject, TSource>(object: TObject, source: TSource): NonNullable<TSource & TObject>;
  /**
   * @see _.defaults
   */
  defaults<TObject, TSource1, TSource2>(
    object: TObject,
    source1: TSource1,
    source2: TSource2
  ): NonNullable<TSource2 & TSource1 & TObject>;
  /**
   * @see _.defaults
   */
  defaults<TObject, TSource1, TSource2, TSource3>(
    object: TObject,
    source1: TSource1,
    source2: TSource2,
    source3: TSource3
  ): NonNullable<TSource3 & TSource2 & TSource1 & TObject>;
  /**
   * @see _.defaults
   */
  defaults<TObject, TSource1, TSource2, TSource3, TSource4>(
    object: TObject,
    source1: TSource1,
    source2: TSource2,
    source3: TSource3,
    source4: TSource4
  ): NonNullable<TSource4 & TSource3 & TSource2 & TSource1 & TObject>;
  /**
   * @see _.defaults
   */
  defaults<TObject>(object: TObject): NonNullable<TObject>;
  /**
   * @see _.defaults
   */
  defaults(object: any, ...sources: any[]): any;
}

declare interface LoDashStatic {
  /**
   * This method is like _.defaults except that it recursively assigns default properties.
   * @param object The destination object.
   * @param sources The source objects.
   * @return Returns object.
   */
  defaultsDeep(object: any, ...sources: any[]): any;
}

declare interface LoDashStatic {
  /**
   * @see _.toPairs
   */
  entries<T>(object?: Dictionary<T> | NumericDictionary<T>): Array<[string, T]>;
  /**
   * @see _.entries
   */
  entries(object?: object): Array<[string, any]>;
}

declare interface LoDashStatic {
  /**
   * @see _.entriesIn
   */
  entriesIn<T>(object?: Dictionary<T> | NumericDictionary<T>): Array<[string, T]>;
  /**
   * @see _.entriesIn
   */
  entriesIn(object?: object): Array<[string, any]>;
}

declare interface LoDashStatic {
  /**
   * @see _.extend
   */
  extend<TObject, TSource>(object: TObject, source: TSource): TObject & TSource;
  /**
   * @see _.extend
   */
  extend<TObject, TSource1, TSource2>(
    object: TObject,
    source1: TSource1,
    source2: TSource2
  ): TObject & TSource1 & TSource2;
  /**
   * @see _.extend
   */
  extend<TObject, TSource1, TSource2, TSource3>(
    object: TObject,
    source1: TSource1,
    source2: TSource2,
    source3: TSource3
  ): TObject & TSource1 & TSource2 & TSource3;
  /**
   * @see _.extend
   */
  extend<TObject, TSource1, TSource2, TSource3, TSource4>(
    object: TObject,
    source1: TSource1,
    source2: TSource2,
    source3: TSource3,
    source4: TSource4
  ): TObject & TSource1 & TSource2 & TSource3 & TSource4;
  /**
   * @see _.extend
   */
  extend<TObject>(object: TObject): TObject;
  /**
   * @see _.extend
   */
  extend<TResult>(object: any, ...otherArgs: any[]): TResult;
}

declare interface LoDashStatic {
  /**
   * @see _.extendWith
   */
  extendWith<TObject, TSource>(object: TObject, source: TSource, customizer: AssignCustomizer): TObject & TSource;
  /**
   * @see _.extendWith
   */
  extendWith<TObject, TSource1, TSource2>(
    object: TObject,
    source1: TSource1,
    source2: TSource2,
    customizer: AssignCustomizer
  ): TObject & TSource1 & TSource2;
  /**
   * @see _.extendWith
   */
  extendWith<TObject, TSource1, TSource2, TSource3>(
    object: TObject,
    source1: TSource1,
    source2: TSource2,
    source3: TSource3,
    customizer: AssignCustomizer
  ): TObject & TSource1 & TSource2 & TSource3;
  /**
   * @see _.extendWith
   */
  extendWith<TObject, TSource1, TSource2, TSource3, TSource4>(
    object: TObject,
    source1: TSource1,
    source2: TSource2,
    source3: TSource3,
    source4: TSource4,
    customizer: AssignCustomizer
  ): TObject & TSource1 & TSource2 & TSource3 & TSource4;
  /**
   * @see _.extendWith
   */
  extendWith<TObject>(object: TObject): TObject;
  /**
   * @see _.extendWith
   */
  extendWith<TResult>(object: any, ...otherArgs: any[]): TResult;
}

declare interface LoDashStatic {
  /**
   * This method is like _.find except that it returns the key of the first element predicate returns truthy for
   * instead of the element itself.
   *
   * @param object The object to search.
   * @param predicate The function invoked per iteration.
   * @return Returns the key of the matched element, else undefined.
   */
  findKey<T>(object: T | null | undefined, predicate?: ObjectIteratee<T>): string | undefined;
}

declare interface LoDashStatic {
  /**
   * This method is like _.findKey except that it iterates over elements of a collection in the opposite order.
   *
   * @param object The object to search.
   * @param predicate The function invoked per iteration.
   * @return Returns the key of the matched element, else undefined.
   */
  findLastKey<T>(object: T | null | undefined, predicate?: ObjectIteratee<T>): string | undefined;
}

declare interface LoDashStatic {
  /**
   * Iterates over own and inherited enumerable properties of an object invoking iteratee for each property. The
   * iteratee is invoked with three arguments: (value, key, object). Iteratee functions may
   * exit iteration early by explicitly returning false.
   *
   * @param object The object to iterate over.
   * @param iteratee The function invoked per iteration.
   * @return Returns object.
   */
  forIn<T>(object: T, iteratee?: ObjectIterator<T, any>): T;
  /**
   * @see _.forIn
   */
  forIn<T>(object: T | null | undefined, iteratee?: ObjectIterator<T, any>): T | null | undefined;
}

declare interface LoDashStatic {
  /**
   * This method is like _.forIn except that it iterates over properties of object in the opposite order.
   *
   * @param object The object to iterate over.
   * @param iteratee The function invoked per iteration.
   * @return Returns object.
   */
  forInRight<T>(object: T, iteratee?: ObjectIterator<T, any>): T;
  /**
   * @see _.forInRight
   */
  forInRight<T>(object: T | null | undefined, iteratee?: ObjectIterator<T, any>): T | null | undefined;
}

declare interface LoDashStatic {
  /**
   * Iterates over own enumerable properties of an object invoking iteratee for each property. The iteratee is
   * invoked with three arguments: (value, key, object). Iteratee functions may exit
   * iteration early by explicitly returning false.
   *
   * @param object The object to iterate over.
   * @param iteratee The function invoked per iteration.
   * @return Returns object.
   */
  forOwn<T>(object: T, iteratee?: ObjectIterator<T, any>): T;
  /**
   * @see _.forOwn
   */
  forOwn<T>(object: T | null | undefined, iteratee?: ObjectIterator<T, any>): T | null | undefined;
}

declare interface LoDashStatic {
  /**
   * This method is like _.forOwn except that it iterates over properties of object in the opposite order.
   *
   * @param object The object to iterate over.
   * @param iteratee The function invoked per iteration.
   * @return Returns object.
   */
  forOwnRight<T>(object: T, iteratee?: ObjectIterator<T, any>): T;
  /**
   * @see _.forOwnRight
   */
  forOwnRight<T>(object: T | null | undefined, iteratee?: ObjectIterator<T, any>): T | null | undefined;
}

declare interface LoDashStatic {
  /**
   * Creates an array of function property names from own enumerable properties
   * of `object`.
   *
   * @category Object
   * @param object The object to inspect.
   * @returns Returns the new array of property names.
   * @example
   *
   * function Foo() {
   *   this.a = _.constant('a');
   *   this.b = _.constant('b');
   * }
   *
   * Foo.prototype.c = _.constant('c');
   *
   * _.functions(new Foo);
   * // => ['a', 'b']
   */
  functions(object: any): string[];
}

declare interface LoDashStatic {
  /**
   * Creates an array of function property names from own and inherited
   * enumerable properties of `object`.
   *
   * @category Object
   * @param object The object to inspect.
   * @returns Returns the new array of property names.
   * @example
   *
   * function Foo() {
   *   this.a = _.constant('a');
   *   this.b = _.constant('b');
   * }
   *
   * Foo.prototype.c = _.constant('c');
   *
   * _.functionsIn(new Foo);
   * // => ['a', 'b', 'c']
   */
  functionsIn<T extends {}>(object: any): string[];
}

declare interface LoDashStatic {
  /**
   * Gets the property value at path of object. If the resolved value is undefined the defaultValue is used
   * in its place.
   *
   * @param object The object to query.
   * @param path The path of the property to get.
   * @param defaultValue The value returned if the resolved value is undefined.
   * @return Returns the resolved value.
   */
  get<TObject extends object, TKey extends keyof TObject>(object: TObject, path: TKey | [TKey]): TObject[TKey];
  /**
   * @see _.get
   */
  get<TObject extends object, TKey extends keyof TObject>(
    object: TObject | null | undefined,
    path: TKey | [TKey]
  ): TObject[TKey] | undefined;
  /**
   * @see _.get
   */
  get<TObject extends object, TKey extends keyof TObject, TDefault>(
    object: TObject | null | undefined,
    path: TKey | [TKey],
    defaultValue: TDefault
  ): Exclude<TObject[TKey], undefined> | TDefault;
  /**
   * @see _.get
   */
  get<TObject extends object, TKey1 extends keyof TObject, TKey2 extends keyof TObject[TKey1]>(
    object: TObject,
    path: [TKey1, TKey2]
  ): TObject[TKey1][TKey2];
  /**
   * @see _.get
   */
  get<TObject extends object, TKey1 extends keyof TObject, TKey2 extends keyof TObject[TKey1]>(
    object: TObject | null | undefined,
    path: [TKey1, TKey2]
  ): TObject[TKey1][TKey2] | undefined;
  /**
   * @see _.get
   */
  get<TObject extends object, TKey1 extends keyof TObject, TKey2 extends keyof TObject[TKey1], TDefault>(
    object: TObject | null | undefined,
    path: [TKey1, TKey2],
    defaultValue: TDefault
  ): Exclude<TObject[TKey1][TKey2], undefined> | TDefault;
  /**
   * @see _.get
   */
  get<
    TObject extends object,
    TKey1 extends keyof TObject,
    TKey2 extends keyof TObject[TKey1],
    TKey3 extends keyof TObject[TKey1][TKey2]
  >(
    object: TObject,
    path: [TKey1, TKey2, TKey3]
  ): TObject[TKey1][TKey2][TKey3];
  /**
   * @see _.get
   */
  get<
    TObject extends object,
    TKey1 extends keyof TObject,
    TKey2 extends keyof TObject[TKey1],
    TKey3 extends keyof TObject[TKey1][TKey2]
  >(
    object: TObject | null | undefined,
    path: [TKey1, TKey2, TKey3]
  ): TObject[TKey1][TKey2][TKey3] | undefined;
  /**
   * @see _.get
   */
  get<
    TObject extends object,
    TKey1 extends keyof TObject,
    TKey2 extends keyof TObject[TKey1],
    TKey3 extends keyof TObject[TKey1][TKey2],
    TDefault
  >(
    object: TObject | null | undefined,
    path: [TKey1, TKey2, TKey3],
    defaultValue: TDefault
  ): Exclude<TObject[TKey1][TKey2][TKey3], undefined> | TDefault;
  /**
   * @see _.get
   */
  get<
    TObject extends object,
    TKey1 extends keyof TObject,
    TKey2 extends keyof TObject[TKey1],
    TKey3 extends keyof TObject[TKey1][TKey2],
    TKey4 extends keyof TObject[TKey1][TKey2][TKey3]
  >(
    object: TObject,
    path: [TKey1, TKey2, TKey3, TKey4]
  ): TObject[TKey1][TKey2][TKey3][TKey4];
  /**
   * @see _.get
   */
  get<
    TObject extends object,
    TKey1 extends keyof TObject,
    TKey2 extends keyof TObject[TKey1],
    TKey3 extends keyof TObject[TKey1][TKey2],
    TKey4 extends keyof TObject[TKey1][TKey2][TKey3]
  >(
    object: TObject | null | undefined,
    path: [TKey1, TKey2, TKey3, TKey4]
  ): TObject[TKey1][TKey2][TKey3][TKey4] | undefined;
  /**
   * @see _.get
   */
  get<
    TObject extends object,
    TKey1 extends keyof TObject,
    TKey2 extends keyof TObject[TKey1],
    TKey3 extends keyof TObject[TKey1][TKey2],
    TKey4 extends keyof TObject[TKey1][TKey2][TKey3],
    TDefault
  >(
    object: TObject | null | undefined,
    path: [TKey1, TKey2, TKey3, TKey4],
    defaultValue: TDefault
  ): Exclude<TObject[TKey1][TKey2][TKey3][TKey4], undefined> | TDefault;
  /**
   * @see _.get
   */
  get<T>(object: NumericDictionary<T>, path: number): T;
  /**
   * @see _.get
   */
  get<T>(object: NumericDictionary<T> | null | undefined, path: number): T | undefined;
  /**
   * @see _.get
   */
  get<T, TDefault>(object: NumericDictionary<T> | null | undefined, path: number, defaultValue: TDefault): T | TDefault;
  /**
   * @see _.get
   */
  get<TDefault>(object: null | undefined, path: PropertyPath, defaultValue: TDefault): TDefault;
  /**
   * @see _.get
   */
  get(object: null | undefined, path: PropertyPath): undefined;
  /**
   * @see _.get
   */
  get<TObject, TPath extends string>(
    data: TObject,
    path: TPath
  ): string extends TPath ? any : GetFieldType<TObject, TPath>;
  /**
   * @see _.get
   */
  get<TObject, TPath extends string, TDefault = GetFieldType<TObject, TPath>>(
    data: TObject,
    path: TPath,
    defaultValue: TDefault
  ): Exclude<GetFieldType<TObject, TPath>, null | undefined> | TDefault;
  /**
   * @see _.get
   */
  get(object: any, path: PropertyPath, defaultValue?: any): any;
}

declare interface LoDashStatic {
  /**
   * Checks if `path` is a direct property of `object`.
   *
   * @category Object
   * @param object The object to query.
   * @param path The path to check.
   * @returns Returns `true` if `path` exists, else `false`.
   * @example
   *
   * var object = { 'a': { 'b': { 'c': 3 } } };
   * var other = _.create({ 'a': _.create({ 'b': _.create({ 'c': 3 }) }) });
   *
   * _.has(object, 'a');
   * // => true
   *
   * _.has(object, 'a.b.c');
   * // => true
   *
   * _.has(object, ['a', 'b', 'c']);
   * // => true
   *
   * _.has(other, 'a');
   * // => false
   */
  has<T, K extends PropertyName>(
    object: T,
    path: K
  ): object is T & { [P in K]: P extends keyof T ? T[P] : Record<string, unknown> extends T ? T[keyof T] : unknown };
  has<T>(object: T, path: PropertyPath): boolean;
}

declare interface LoDashStatic {
  /**
   * Checks if `path` is a direct or inherited property of `object`.
   *
   * @category Object
   * @param object The object to query.
   * @param path The path to check.
   * @returns Returns `true` if `path` exists, else `false`.
   * @example
   *
   * var object = _.create({ 'a': _.create({ 'b': _.create({ 'c': 3 }) }) });
   *
   * _.hasIn(object, 'a');
   * // => true
   *
   * _.hasIn(object, 'a.b.c');
   * // => true
   *
   * _.hasIn(object, ['a', 'b', 'c']);
   * // => true
   *
   * _.hasIn(object, 'b');
   * // => false
   */
  hasIn<T>(object: T, path: PropertyPath): boolean;
}

declare interface LoDashStatic {
  /**
   * Creates an object composed of the inverted keys and values of object. If object contains duplicate values,
   * subsequent values overwrite property assignments of previous values unless multiValue is true.
   *
   * @param object The object to invert.
   * @param multiValue Allow multiple values per key.
   * @return Returns the new inverted object.
   */
  invert(object: object): Dictionary<string>;
}

declare interface LoDashStatic {
  /**
   * This method is like _.invert except that the inverted object is generated from the results of running each
   * element of object through iteratee. The corresponding inverted value of each inverted key is an array of
   * keys responsible for generating the inverted value. The iteratee is invoked with one argument: (value).
   *
   * @param object The object to invert.
   * @param interatee The iteratee invoked per element.
   * @return Returns the new inverted object.
   */
  invertBy<T>(
    object: Dictionary<T> | NumericDictionary<T> | null | undefined,
    interatee?: ValueIteratee<T>
  ): Dictionary<string[]>;
  /**
   * @see _.invertBy
   */
  invertBy<T extends object>(object: T | null | undefined, interatee?: ValueIteratee<T[keyof T]>): Dictionary<string[]>;
}

declare interface LoDashStatic {
  /**
   * Invokes the method at path of object.
   * @param object The object to query.
   * @param path The path of the method to invoke.
   * @param args The arguments to invoke the method with.
   */
  invoke(object: any, path: PropertyPath, ...args: any[]): any;
}

declare interface LoDashStatic {
  /**
   * Creates an array of the own enumerable property names of object.
   *
   * Note: Non-object values are coerced to objects. See the ES spec for more details.
   *
   * @param object The object to query.
   * @return Returns the array of property names.
   */
  keys(object?: any): string[];
}

declare interface LoDashStatic {
  /**
   * Creates an array of the own and inherited enumerable property names of object.
   *
   * Note: Non-object values are coerced to objects.
   *
   * @param object The object to query.
   * @return An array of property names.
   */
  keysIn(object?: any): string[];
}

declare interface LoDashStatic {
  /**
   * The opposite of _.mapValues; this method creates an object with the same values as object and keys generated
   * by running each own enumerable property of object through iteratee.
   *
   * @param object The object to iterate over.
   * @param iteratee The function invoked per iteration.
   * @return Returns the new mapped object.
   */
  mapKeys<T>(object: List<T> | null | undefined, iteratee?: ListIteratee<T>): Dictionary<T>;
  /**
   * @see _.mapKeys
   */
  mapKeys<T extends object>(object: T | null | undefined, iteratee?: ObjectIteratee<T>): Dictionary<T[keyof T]>;
}

declare interface LoDashStatic {
  /**
   * Creates an object with the same keys as object and values generated by running each own
   * enumerable property of object through iteratee. The iteratee function is
   * invoked with three arguments: (value, key, object).
   *
   * @param object The object to iterate over.
   * @param iteratee  The function invoked per iteration.
   * @return Returns the new mapped object.
   */
  mapValues<TResult>(obj: string | null | undefined, callback: StringIterator<TResult>): NumericDictionary<TResult>;
  /**
   * @see _.mapValues
   */
  mapValues<T extends object, TResult>(
    obj: T | null | undefined,
    callback: ObjectIterator<T, TResult>
  ): { [P in keyof T]: TResult };
  /**
   * @see _.mapValues
   */
  mapValues<T>(obj: Dictionary<T> | NumericDictionary<T> | null | undefined, iteratee: object): Dictionary<boolean>;
  /**
   * @see _.mapValues
   */
  mapValues<T extends object>(obj: T | null | undefined, iteratee: object): { [P in keyof T]: boolean };
  /**
   * @see _.mapValues
   */
  mapValues<T, TKey extends keyof T>(
    obj: Dictionary<T> | NumericDictionary<T> | null | undefined,
    iteratee: TKey
  ): Dictionary<T[TKey]>;
  /**
   * @see _.mapValues
   */
  mapValues<T>(obj: Dictionary<T> | NumericDictionary<T> | null | undefined, iteratee: string): Dictionary<any>;
  /**
   * @see _.mapValues
   */
  mapValues<T extends object>(obj: T | null | undefined, iteratee: string): { [P in keyof T]: any };
  /**
   * @see _.mapValues
   */
  mapValues(obj: string | null | undefined): NumericDictionary<string>;
  /**
   * @see _.mapValues
   */
  mapValues<T>(obj: Dictionary<T> | NumericDictionary<T> | null | undefined): Dictionary<T>;
  /**
   * @see _.mapValues
   */
  mapValues<T extends object>(obj: T): T;
  /**
   * @see _.mapValues
   */
  mapValues<T extends object>(obj: T | null | undefined): PartialObject<T>;
}

declare interface LoDashStatic {
  /**
   * Recursively merges own and inherited enumerable properties of source
   * objects into the destination object, skipping source properties that resolve
   * to `undefined`. Array and plain object properties are merged recursively.
   * Other objects and value types are overridden by assignment. Source objects
   * are applied from left to right. Subsequent sources overwrite property
   * assignments of previous sources.
   *
   * **Note:** This method mutates `object`.
   *
   * @category Object
   * @param object The destination object.
   * @param [sources] The source objects.
   * @returns Returns `object`.
   * @example
   *
   * var users = {
   *   'data': [{ 'user': 'barney' }, { 'user': 'fred' }]
   * };
   *
   * var ages = {
   *   'data': [{ 'age': 36 }, { 'age': 40 }]
   * };
   *
   * _.merge(users, ages);
   * // => { 'data': [{ 'user': 'barney', 'age': 36 }, { 'user': 'fred', 'age': 40 }] }
   */
  merge<TObject, TSource>(object: TObject, source: TSource): TObject & TSource;
  /**
   * @see _.merge
   */
  merge<TObject, TSource1, TSource2>(
    object: TObject,
    source1: TSource1,
    source2: TSource2
  ): TObject & TSource1 & TSource2;
  /**
   * @see _.merge
   */
  merge<TObject, TSource1, TSource2, TSource3>(
    object: TObject,
    source1: TSource1,
    source2: TSource2,
    source3: TSource3
  ): TObject & TSource1 & TSource2 & TSource3;
  /**
   * @see _.merge
   */
  merge<TObject, TSource1, TSource2, TSource3, TSource4>(
    object: TObject,
    source1: TSource1,
    source2: TSource2,
    source3: TSource3,
    source4: TSource4
  ): TObject & TSource1 & TSource2 & TSource3 & TSource4;
  /**
   * @see _.merge
   */
  merge(object: any, ...otherArgs: any[]): any;
}

declare interface LoDashStatic {
  /**
   * This method is like `_.merge` except that it accepts `customizer` which
   * is invoked to produce the merged values of the destination and source
   * properties. If `customizer` returns `undefined` merging is handled by the
   * method instead. The `customizer` is invoked with seven arguments:
   * (objValue, srcValue, key, object, source, stack).
   *
   * @category Object
   * @param object The destination object.
   * @param sources The source objects.
   * @param customizer The function to customize assigned values.
   * @returns Returns `object`.
   * @example
   *
   * function customizer(objValue, srcValue) {
   *   if (_.isArray(objValue)) {
   *     return objValue.concat(srcValue);
   *   }
   * }
   *
   * var object = {
   *   'fruits': ['apple'],
   *   'vegetables': ['beet']
   * };
   *
   * var other = {
   *   'fruits': ['banana'],
   *   'vegetables': ['carrot']
   * };
   *
   * _.mergeWith(object, other, customizer);
   * // => { 'fruits': ['apple', 'banana'], 'vegetables': ['beet', 'carrot'] }
   */
  mergeWith<TObject, TSource>(object: TObject, source: TSource, customizer: MergeWithCustomizer): TObject & TSource;
  /**
   * @see _.mergeWith
   */
  mergeWith<TObject, TSource1, TSource2>(
    object: TObject,
    source1: TSource1,
    source2: TSource2,
    customizer: MergeWithCustomizer
  ): TObject & TSource1 & TSource2;
  /**
   * @see _.mergeWith
   */
  mergeWith<TObject, TSource1, TSource2, TSource3>(
    object: TObject,
    source1: TSource1,
    source2: TSource2,
    source3: TSource3,
    customizer: MergeWithCustomizer
  ): TObject & TSource1 & TSource2 & TSource3;
  /**
   * @see _.mergeWith
   */
  mergeWith<TObject, TSource1, TSource2, TSource3, TSource4>(
    object: TObject,
    source1: TSource1,
    source2: TSource2,
    source3: TSource3,
    source4: TSource4,
    customizer: MergeWithCustomizer
  ): TObject & TSource1 & TSource2 & TSource3 & TSource4;
  /**
   * @see _.mergeWith
   */
  mergeWith(object: any, ...otherArgs: any[]): any;
}

declare interface LoDashStatic {
  /**
   * The opposite of `_.pick`; this method creates an object composed of the
   * own and inherited enumerable properties of `object` that are not omitted.
   *
   * @category Object
   * @param object The source object.
   * @param [paths] The property names to omit, specified
   *  individually or in arrays..
   * @returns Returns the new object.
   * @example
   *
   * var object = { 'a': 1, 'b': '2', 'c': 3 };
   *
   * _.omit(object, ['a', 'c']);
   * // => { 'b': '2' }
   */
  omit<T extends object, K extends PropertyName[]>(
    object: T | null | undefined,
    ...paths: K
  ): Pick<T, Exclude<keyof T, K[number]>>;
  /**
   * @see _.omit
   */
  omit<T extends object, K extends keyof T>(object: T | null | undefined, ...paths: Array<Many<K>>): Omit_2<T, K>;
  /**
   * @see _.omit
   */
  omit<T extends object>(object: T | null | undefined, ...paths: Array<Many<PropertyName>>): PartialObject<T>;
}

declare interface LoDashStatic {
  /**
   * The opposite of `_.pickBy`; this method creates an object composed of the
   * own and inherited enumerable properties of `object` that `predicate`
   * doesn't return truthy for.
   *
   * @category Object
   * @param object The source object.
   * @param [predicate=_.identity] The function invoked per property.
   * @returns Returns the new object.
   * @example
   *
   * var object = { 'a': 1, 'b': '2', 'c': 3 };
   *
   * _.omitBy(object, _.isNumber);
   * // => { 'b': '2' }
   */
  omitBy<T>(object: Dictionary<T> | null | undefined, predicate?: ValueKeyIteratee<T>): Dictionary<T>;
  /**
   * @see _.omitBy
   */
  omitBy<T>(object: NumericDictionary<T> | null | undefined, predicate?: ValueKeyIteratee<T>): NumericDictionary<T>;
  /**
   * @see _.omitBy
   */
  omitBy<T extends object>(object: T | null | undefined, predicate: ValueKeyIteratee<T[keyof T]>): PartialObject<T>;
}

declare interface LoDashStatic {
  /**
   * Creates an object composed of the picked `object` properties.
   *
   * @category Object
   * @param object The source object.
   * @param [props] The property names to pick, specified
   *  individually or in arrays.
   * @returns Returns the new object.
   * @example
   *
   * var object = { 'a': 1, 'b': '2', 'c': 3 };
   *
   * _.pick(object, ['a', 'c']);
   * // => { 'a': 1, 'c': 3 }
   */
  pick<T extends object, U extends keyof T>(object: T, ...props: Array<Many<U>>): Pick<T, U>;
  /**
   * @see _.pick
   */
  pick<T>(object: T | null | undefined, ...props: Array<Many<PropertyPath>>): PartialObject<T>;
}

declare interface LoDashStatic {
  /**
   * Creates an object composed of the `object` properties `predicate` returns
   * truthy for. The predicate is invoked with two arguments: (value, key).
   *
   * @category Object
   * @param object The source object.
   * @param [predicate=_.identity] The function invoked per property.
   * @returns Returns the new object.
   * @example
   *
   * var object = { 'a': 1, 'b': '2', 'c': 3 };
   *
   * _.pickBy(object, _.isNumber);
   * // => { 'a': 1, 'c': 3 }
   */
  pickBy<T, S extends T>(
    object: Dictionary<T> | null | undefined,
    predicate: ValueKeyIterateeTypeGuard<T, S>
  ): Dictionary<S>;
  /**
   * @see _.pickBy
   */
  pickBy<T, S extends T>(
    object: NumericDictionary<T> | null | undefined,
    predicate: ValueKeyIterateeTypeGuard<T, S>
  ): NumericDictionary<S>;
  /**
   * @see _.pickBy
   */
  pickBy<T>(object: Dictionary<T> | null | undefined, predicate?: ValueKeyIteratee<T>): Dictionary<T>;
  /**
   * @see _.pickBy
   */
  pickBy<T>(object: NumericDictionary<T> | null | undefined, predicate?: ValueKeyIteratee<T>): NumericDictionary<T>;
  /**
   * @see _.pickBy
   */
  pickBy<T extends object>(object: T | null | undefined, predicate?: ValueKeyIteratee<T[keyof T]>): PartialObject<T>;
}

declare interface LoDashStatic {
  /**
   * This method is like _.get except that if the resolved value is a function it’s invoked with the this binding
   * of its parent object and its result is returned.
   *
   * @param object The object to query.
   * @param path The path of the property to resolve.
   * @param defaultValue The value returned if the resolved value is undefined.
   * @return Returns the resolved value.
   */
  result<TResult>(object: any, path: PropertyPath, defaultValue?: TResult | ((...args: any[]) => TResult)): TResult;
}

declare interface LoDashStatic {
  /**
   * Sets the value at path of object. If a portion of path doesn’t exist it’s created. Arrays are created for
   * missing index properties while objects are created for all other missing properties. Use _.setWith to
   * customize path creation.
   *
   * @param object The object to modify.
   * @param path The path of the property to set.
   * @param value The value to set.
   * @return Returns object.
   */
  set<T extends object>(object: T, path: PropertyPath, value: any): T;
  /**
   * @see _.set
   */
  set<TResult>(object: object, path: PropertyPath, value: any): TResult;
}

declare interface LoDashStatic {
  /**
   * This method is like _.set except that it accepts customizer which is invoked to produce the objects of
   * path. If customizer returns undefined path creation is handled by the method instead. The customizer is
   * invoked with three arguments: (nsValue, key, nsObject).
   *
   * @param object The object to modify.
   * @param path The path of the property to set.
   * @param value The value to set.
   * @param customizer The function to customize assigned values.
   * @return Returns object.
   */
  setWith<T extends object>(object: T, path: PropertyPath, value: any, customizer?: SetWithCustomizer<T>): T;
  /**
   * @see _.setWith
   */
  setWith<T extends object, TResult>(
    object: T,
    path: PropertyPath,
    value: any,
    customizer?: SetWithCustomizer<T>
  ): TResult;
}

declare interface LoDashStatic {
  /**
   * Creates an array of own enumerable key-value pairs for object.
   *
   * @param object The object to query.
   * @return Returns the new array of key-value pairs.
   */
  toPairs<T>(object?: Dictionary<T> | NumericDictionary<T>): Array<[string, T]>;
  /**
   * @see _.toPairs
   */
  toPairs(object?: object): Array<[string, any]>;
}

declare interface LoDashStatic {
  /**
   * Creates an array of own and inherited enumerable key-value pairs for object.
   *
   * @param object The object to query.
   * @return Returns the new array of key-value pairs.
   */
  toPairsIn<T>(object?: Dictionary<T> | NumericDictionary<T>): Array<[string, T]>;
  /**
   * @see _.toPairsIn
   */
  toPairsIn(object?: object): Array<[string, any]>;
}

declare interface LoDashStatic {
  /**
   * An alternative to _.reduce; this method transforms object to a new accumulator object which is the result of
   * running each of its own enumerable properties through iteratee, with each invocation potentially mutating
   * the accumulator object. The iteratee is invoked with four arguments: (accumulator,
   * value, key, object). Iteratee functions may exit iteration early by explicitly returning false.
   *
   * @param object The object to iterate over.
   * @param iteratee The function invoked per iteration.
   * @param accumulator The custom accumulator value.
   * @return Returns the accumulated value.
   */
  transform<T, TResult>(
    object: readonly T[],
    iteratee: MemoVoidArrayIterator<T, TResult>,
    accumulator?: TResult
  ): TResult;
  /**
   * @see _.transform
   */
  transform<T, TResult>(
    object: Dictionary<T>,
    iteratee: MemoVoidDictionaryIterator<T, string, TResult>,
    accumulator?: TResult
  ): TResult;
  /**
   * @see _.transform
   */
  transform<T extends object, TResult>(
    object: T,
    iteratee: MemoVoidDictionaryIterator<T[keyof T], keyof T, TResult>,
    accumulator?: TResult
  ): TResult;
  /**
   * @see _.transform
   */
  transform(object: any[]): any[];
  /**
   * @see _.transform
   */
  transform(object: object): Dictionary<any>;
}

declare interface LoDashStatic {
  /**
   * Removes the property at path of object.
   *
   * Note: This method mutates object.
   *
   * @param object The object to modify.
   * @param path The path of the property to unset.
   * @return Returns true if the property is deleted, else false.
   */
  unset(object: any, path: PropertyPath): boolean;
}

declare interface LoDashStatic {
  /**
   * This method is like _.set except that accepts updater to produce the value to set. Use _.updateWith to
   * customize path creation. The updater is invoked with one argument: (value).
   *
   * @param object The object to modify.
   * @param path The path of the property to set.
   * @param updater The function to produce the updated value.
   * @return Returns object.
   */
  update(object: object, path: PropertyPath, updater: (value: any) => any): any;
}

declare interface LoDashStatic {
  /**
   * This method is like `_.update` except that it accepts `customizer` which is
   * invoked to produce the objects of `path`.  If `customizer` returns `undefined`
   * path creation is handled by the method instead. The `customizer` is invoked
   * with three arguments: (nsValue, key, nsObject).
   *
   * **Note:** This method mutates `object`.
   *
   * @since 4.6.0
   * @category Object
   * @param object The object to modify.
   * @param path The path of the property to set.
   * @param updater The function to produce the updated value.
   * @param [customizer] The function to customize assigned values.
   * @returns Returns `object`.
   * @example
   *
   * var object = {};
   *
   * _.updateWith(object, '[0][1]', _.constant('a'), Object);
   * // => { '0': { '1': 'a' } }
   */
  updateWith<T extends object>(
    object: T,
    path: PropertyPath,
    updater: (oldValue: any) => any,
    customizer?: SetWithCustomizer<T>
  ): T;
  /**
   * @see _.updateWith
   */
  updateWith<T extends object, TResult>(
    object: T,
    path: PropertyPath,
    updater: (oldValue: any) => any,
    customizer?: SetWithCustomizer<T>
  ): TResult;
}

declare interface LoDashStatic {
  /**
   * Creates an array of the own enumerable property values of object.
   *
   * @param object The object to query.
   * @return Returns an array of property values.
   */
  values<T>(object: Dictionary<T> | NumericDictionary<T> | List<T> | null | undefined): T[];
  /**
   * @see _.values
   */
  values<T extends object>(object: T | null | undefined): Array<T[keyof T]>;
  /**
   * @see _.values
   */
  values(object: any): any[];
}

declare interface LoDashStatic {
  /**
   * Creates an array of the own and inherited enumerable property values of object.
   *
   * @param object The object to query.
   * @return Returns the array of property values.
   */
  valuesIn<T>(object: Dictionary<T> | NumericDictionary<T> | List<T> | null | undefined): T[];
  /**
   * @see _.valuesIn
   */
  valuesIn<T extends object>(object: T | null | undefined): Array<T[keyof T]>;
}

declare interface LoDashStatic {
  /**
   * Creates a lodash object that wraps value with explicit method chaining enabled.
   *
   * @param value The value to wrap.
   * @return Returns the new lodash wrapper instance.
   */
  chain<TrapAny extends { __lodashAnyHack: any }>(
    value: TrapAny
  ): CollectionChain<any> & FunctionChain<any> & ObjectChain<any> & PrimitiveChain<any> & StringChain;
  /**
   * @see _.chain
   */
  chain<T extends null | undefined>(value: T): PrimitiveChain<T>;
  /**
   * @see _.chain
   */
  chain(value: string): StringChain;
  /**
   * @see _.chain
   */
  chain(value: string | null | undefined): StringNullableChain;
  /**
   * @see _.chain
   */
  chain<T extends (...args: any[]) => any>(value: T): FunctionChain<T>;
  /**
   * @see _.chain
   */
  chain<T = any>(value: List<T> | null | undefined): CollectionChain<T>;
  /**
   * @see _.chain
   */
  chain<T extends object>(value: T | null | undefined): ObjectChain<T>;
  /**
   * @see _.chain
   */
  chain<T>(value: T): PrimitiveChain<T>;
}

declare interface LoDashStatic {
  /**
   * This method invokes interceptor and returns value. The interceptor is invoked with one
   * argument; (value). The purpose of this method is to "tap into" a method chain in order to perform operations
   * on intermediate results within the chain.
   *
   * @param value The value to provide to interceptor.
   * @param interceptor The function to invoke.
   * @return Returns value.
   */
  tap<T>(value: T, interceptor: (value: T) => void): T;
}

declare interface LoDashStatic {
  /**
   * This method is like _.tap except that it returns the result of interceptor.
   *
   * @param value The value to provide to interceptor.
   * @param interceptor The function to invoke.
   * @return Returns the result of interceptor.
   */
  thru<T, TResult>(value: T, interceptor: (value: T) => TResult): TResult;
}

declare interface LoDashStatic {
  /**
   * Converts string to camel case.
   *
   * @param string The string to convert.
   * @return Returns the camel cased string.
   */
  camelCase(string?: string): string;
}

declare interface LoDashStatic {
  /**
   * Converts the first character of string to upper case and the remaining to lower case.
   *
   * @param string The string to capitalize.
   * @return Returns the capitalized string.
   */
  capitalize(string?: string): string;
}

declare interface LoDashStatic {
  /**
   * Deburrs string by converting latin-1 supplementary letters to basic latin letters and removing combining
   * diacritical marks.
   *
   * @param string The string to deburr.
   * @return Returns the deburred string.
   */
  deburr(string?: string): string;
}

declare interface LoDashStatic {
  /**
   * Checks if string ends with the given target string.
   *
   * @param string The string to search.
   * @param target The string to search for.
   * @param position The position to search from.
   * @return Returns true if string ends with target, else false.
   */
  endsWith(string?: string, target?: string, position?: number): boolean;
}

declare interface LoDashStatic {
  /**
   * Converts the characters "&", "<", ">", '"', "'", and "`" in string to their corresponding HTML entities.
   *
   * Note: No other characters are escaped. To escape additional characters use a third-party library like he.
   *
   * Though the ">" character is escaped for symmetry, characters like ">" and "/" don’t need escaping in HTML
   * and have no special meaning unless they're part of a tag or unquoted attribute value. See Mathias Bynens’s
   * article (under "semi-related fun fact") for more details.
   *
   * Backticks are escaped because in IE < 9, they can break out of attribute values or HTML comments. See #59,
   * #102, #108, and #133 of the HTML5 Security Cheatsheet for more details.
   *
   * When working with HTML you should always quote attribute values to reduce XSS vectors.
   *
   * @param string The string to escape.
   * @return Returns the escaped string.
   */
  escape(string?: string): string;
}

declare interface LoDashStatic {
  /**
   * Escapes the RegExp special characters "^", "$", "\", ".", "*", "+", "?", "(", ")", "[", "]",
   * "{", "}", and "|" in string.
   *
   * @param string The string to escape.
   * @return Returns the escaped string.
   */
  escapeRegExp(string?: string): string;
}

declare interface LoDashStatic {
  /**
   * Converts string to kebab case.
   *
   * @param string The string to convert.
   * @return Returns the kebab cased string.
   */
  kebabCase(string?: string): string;
}

declare interface LoDashStatic {
  /**
   * Converts `string`, as space separated words, to lower case.
   *
   * @param string The string to convert.
   * @return Returns the lower cased string.
   */
  lowerCase(string?: string): string;
}

declare interface LoDashStatic {
  /**
   * Converts the first character of `string` to lower case.
   *
   * @param string The string to convert.
   * @return Returns the converted string.
   */
  lowerFirst(string?: string): string;
}

declare interface LoDashStatic {
  /**
   * Pads string on the left and right sides if it’s shorter than length. Padding characters are truncated if
   * they can’t be evenly divided by length.
   *
   * @param string The string to pad.
   * @param length The padding length.
   * @param chars The string used as padding.
   * @return Returns the padded string.
   */
  pad(string?: string, length?: number, chars?: string): string;
}

declare interface LoDashStatic {
  /**
   * Pads string on the right side if it’s shorter than length. Padding characters are truncated if they exceed
   * length.
   *
   * @param string The string to pad.
   * @param length The padding length.
   * @param chars The string used as padding.
   * @return Returns the padded string.
   */
  padEnd(string?: string, length?: number, chars?: string): string;
}

declare interface LoDashStatic {
  /**
   * Pads string on the left side if it’s shorter than length. Padding characters are truncated if they exceed
   * length.
   *
   * @param string The string to pad.
   * @param length The padding length.
   * @param chars The string used as padding.
   * @return Returns the padded string.
   */
  padStart(string?: string, length?: number, chars?: string): string;
}

declare interface LoDashStatic {
  /**
   * Converts string to an integer of the specified radix. If radix is undefined or 0, a radix of 10 is used
   * unless value is a hexadecimal, in which case a radix of 16 is used.
   *
   * Note: This method aligns with the ES5 implementation of parseInt.
   *
   * @param string The string to convert.
   * @param radix The radix to interpret value by.
   * @return Returns the converted integer.
   */
  parseInt(string: string, radix?: number): number;
}

declare interface LoDashStatic {
  /**
   * Repeats the given string n times.
   *
   * @param string The string to repeat.
   * @param n The number of times to repeat the string.
   * @return Returns the repeated string.
   */
  repeat(string?: string, n?: number): string;
}

declare interface LoDashStatic {
  /**
   * Replaces matches for pattern in string with replacement.
   *
   * Note: This method is based on String#replace.
   *
   * @return Returns the modified string.
   */
  replace(string: string, pattern: RegExp | string, replacement: ReplaceFunction | string): string;
  /**
   * @see _.replace
   */
  replace(pattern: RegExp | string, replacement: ReplaceFunction | string): string;
}

declare interface LoDashStatic {
  /**
   * Converts string to snake case.
   *
   * @param string The string to convert.
   * @return Returns the snake cased string.
   */
  snakeCase(string?: string): string;
}

declare interface LoDashStatic {
  /**
   * Splits string by separator.
   *
   * Note: This method is based on String#split.
   *
   * @param string The string to split.
   * @param separator The separator pattern to split by.
   * @param limit The length to truncate results to.
   * @return Returns the new array of string segments.
   */
  split(string: string | null | undefined, separator?: RegExp | string, limit?: number): string[];
  /**
   * @see _.split
   */
  split(string: string | null | undefined, index: string | number, guard: object): string[];
}

declare interface LoDashStatic {
  /**
   * Converts string to start case.
   *
   * @param string The string to convert.
   * @return Returns the start cased string.
   */
  startCase(string?: string): string;
}

declare interface LoDashStatic {
  /**
   * Checks if string starts with the given target string.
   *
   * @param string The string to search.
   * @param target The string to search for.
   * @param position The position to search from.
   * @return Returns true if string starts with target, else false.
   */
  startsWith(string?: string, target?: string, position?: number): boolean;
}

declare interface LoDashStatic {
  /**
   * Creates a compiled template function that can interpolate data properties in "interpolate" delimiters,
   * HTML-escape interpolated data properties in "escape" delimiters, and execute JavaScript in "evaluate"
   * delimiters. Data properties may be accessed as free variables in the template. If a setting object is
   * provided it takes precedence over _.templateSettings values.
   *
   * Note: In the development build _.template utilizes
   * [sourceURLs](http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl) for easier
   * debugging.
   *
   * For more information on precompiling templates see
   * [lodash's custom builds documentation](https://lodash.com/custom-builds).
   *
   * For more information on Chrome extension sandboxes see
   * [Chrome's extensions documentation](https://developer.chrome.com/extensions/sandboxingEval).
   *
   * @param string The template string.
   * @param options The options object.
   * @param options.escape The HTML "escape" delimiter.
   * @param options.evaluate The "evaluate" delimiter.
   * @param options.imports An object to import into the template as free variables.
   * @param options.interpolate The "interpolate" delimiter.
   * @param options.sourceURL The sourceURL of the template's compiled source.
   * @param options.variable The data object variable name.
   * @return Returns the compiled template function.
   */
  template(string?: string, options?: TemplateOptions): TemplateExecutor;
}

declare interface LoDashStatic {
  /**
   * Converts `string`, as a whole, to lower case.
   *
   * @param string The string to convert.
   * @return Returns the lower cased string.
   */
  toLower(string?: string): string;
}

declare interface LoDashStatic {
  /**
   * Converts `string`, as a whole, to upper case.
   *
   * @param string The string to convert.
   * @return Returns the upper cased string.
   */
  toUpper(string?: string): string;
}

declare interface LoDashStatic {
  /**
   * Removes leading and trailing whitespace or specified characters from string.
   *
   * @param string The string to trim.
   * @param chars The characters to trim.
   * @return Returns the trimmed string.
   */
  trim(string?: string, chars?: string): string;
  /**
   * @see _.trim
   */
  trim(string: string, index: string | number, guard: object): string;
}

declare interface LoDashStatic {
  /**
   * Removes trailing whitespace or specified characters from string.
   *
   * @param string The string to trim.
   * @param chars The characters to trim.
   * @return Returns the trimmed string.
   */
  trimEnd(string?: string, chars?: string): string;
  /**
   * @see _.trimEnd
   */
  trimEnd(string: string, index: string | number, guard: object): string;
}

declare interface LoDashStatic {
  /**
   * Removes leading whitespace or specified characters from string.
   *
   * @param string The string to trim.
   * @param chars The characters to trim.
   * @return Returns the trimmed string.
   */
  trimStart(string?: string, chars?: string): string;
  /**
   * @see _.trimStart
   */
  trimStart(string: string, index: string | number, guard: object): string;
}

declare interface LoDashStatic {
  /**
   * Truncates string if it’s longer than the given maximum string length. The last characters of the truncated
   * string are replaced with the omission string which defaults to "…".
   *
   * @param string The string to truncate.
   * @param options The options object or maximum string length.
   * @return Returns the truncated string.
   */
  truncate(string?: string, options?: TruncateOptions): string;
}

declare interface LoDashStatic {
  /**
   * The inverse of _.escape; this method converts the HTML entities &amp;, &lt;, &gt;, &quot;, &#39;, and &#96;
   * in string to their corresponding characters.
   *
   * Note: No other HTML entities are unescaped. To unescape additional HTML entities use a third-party library
   * like he.
   *
   * @param string The string to unescape.
   * @return Returns the unescaped string.
   */
  unescape(string?: string): string;
}

declare interface LoDashStatic {
  /**
   * Converts `string`, as space separated words, to upper case.
   *
   * @param string The string to convert.
   * @return Returns the upper cased string.
   */
  upperCase(string?: string): string;
}

declare interface LoDashStatic {
  /**
   * Converts the first character of `string` to upper case.
   *
   * @param string The string to convert.
   * @return Returns the converted string.
   */
  upperFirst(string?: string): string;
}

declare interface LoDashStatic {
  /**
   * Splits `string` into an array of its words.
   *
   * @param string The string to inspect.
   * @param pattern The pattern to match words.
   * @return Returns the words of `string`.
   */
  words(string?: string, pattern?: string | RegExp): string[];
  /**
   * @see _.words
   */
  words(string: string, index: string | number, guard: object): string[];
}

declare interface LoDashStatic {
  /**
   * Attempts to invoke func, returning either the result or the caught error object. Any additional arguments
   * are provided to func when it’s invoked.
   *
   * @param func The function to attempt.
   * @return Returns the func result or error object.
   */
  attempt<TResult>(func: (...args: any[]) => TResult, ...args: any[]): TResult | Error;
}

declare interface LoDashStatic {
  /**
   * Binds methods of an object to the object itself, overwriting the existing method. Method names may be
   * specified as individual arguments or as arrays of method names. If no method names are provided all
   * enumerable function properties, own and inherited, of object are bound.
   *
   * Note: This method does not set the "length" property of bound functions.
   *
   * @param object The object to bind and assign the bound methods to.
   * @param methodNames The object method names to bind, specified as individual method names or arrays of
   * method names.
   * @return Returns object.
   */
  bindAll<T>(object: T, ...methodNames: Array<Many<string>>): T;
}

declare interface LoDashStatic {
  /**
   * Creates a function that iterates over `pairs` and invokes the corresponding
   * function of the first predicate to return truthy. The predicate-function
   * pairs are invoked with the `this` binding and arguments of the created
   * function.
   *
   * @since 4.0.0
   * @category Util
   * @param pairs The predicate-function pairs.
   * @returns Returns the new composite function.
   * @example
   *
   * var func = _.cond([
   *   [_.matches({ 'a': 1 }),           _.constant('matches A')],
   *   [_.conforms({ 'b': _.isNumber }), _.constant('matches B')],
   *   [_.stubTrue,                      _.constant('no match')]
   * ]);
   *
   * func({ 'a': 1, 'b': 2 });
   * // => 'matches A'
   *
   * func({ 'a': 0, 'b': 1 });
   * // => 'matches B'
   *
   * func({ 'a': '1', 'b': '2' });
   * // => 'no match'
   */
  cond<R>(pairs: Array<CondPairNullary<R>>): () => R;
  cond<T, R>(pairs: Array<CondPairUnary<T, R>>): (Target: T) => R;
}

declare interface LoDashStatic {
  /**
   * Creates a function that invokes the predicate properties of `source` with the corresponding
   * property values of a given object, returning true if all predicates return truthy, else false.
   */
  conforms<T>(source: ConformsPredicateObject<T>): (value: T) => boolean;
}

declare interface LoDashStatic {
  /**
   * Creates a function that returns value.
   *
   * @param value The value to return from the new function.
   * @return Returns the new function.
   */
  constant<T>(value: T): () => T;
}

declare interface LoDashStatic {
  /**
   * Checks `value` to determine whether a default value should be returned in
   * its place. The `defaultValue` is returned if `value` is `NaN`, `null`,
   * or `undefined`.
   *
   * @param value The value to check.
   * @param defaultValue The default value.
   * @returns Returns the resolved value.
   */
  defaultTo<T>(value: T | null | undefined, defaultValue: T): T;
  /**
   * @see _.defaultTo
   */
  defaultTo<T, TDefault>(value: T | null | undefined, defaultValue: TDefault): T | TDefault;
}

declare interface LoDashStatic {
  /**
   * Creates a function that returns the result of invoking the provided functions with the this binding of the
   * created function, where each successive invocation is supplied the return value of the previous.
   *
   * @param funcs Functions to invoke.
   * @return Returns the new function.
   */
  flow<A extends any[], R1, R2, R3, R4, R5, R6, R7>(
    f1: (...args: A) => R1,
    f2: (a: R1) => R2,
    f3: (a: R2) => R3,
    f4: (a: R3) => R4,
    f5: (a: R4) => R5,
    f6: (a: R5) => R6,
    f7: (a: R6) => R7
  ): (...args: A) => R7;
  /**
   * @see _.flow
   */
  flow<A extends any[], R1, R2, R3, R4, R5, R6, R7>(
    f1: (...args: A) => R1,
    f2: (a: R1) => R2,
    f3: (a: R2) => R3,
    f4: (a: R3) => R4,
    f5: (a: R4) => R5,
    f6: (a: R5) => R6,
    f7: (a: R6) => R7,
    ...func: Array<Many<(a: any) => any>>
  ): (...args: A) => any;
  /**
   * @see _.flow
   */
  flow<A extends any[], R1, R2, R3, R4, R5, R6>(
    f1: (...args: A) => R1,
    f2: (a: R1) => R2,
    f3: (a: R2) => R3,
    f4: (a: R3) => R4,
    f5: (a: R4) => R5,
    f6: (a: R5) => R6
  ): (...args: A) => R6;
  /**
   * @see _.flow
   */
  flow<A extends any[], R1, R2, R3, R4, R5>(
    f1: (...args: A) => R1,
    f2: (a: R1) => R2,
    f3: (a: R2) => R3,
    f4: (a: R3) => R4,
    f5: (a: R4) => R5
  ): (...args: A) => R5;
  /**
   * @see _.flow
   */
  flow<A extends any[], R1, R2, R3, R4>(
    f1: (...args: A) => R1,
    f2: (a: R1) => R2,
    f3: (a: R2) => R3,
    f4: (a: R3) => R4
  ): (...args: A) => R4;
  /**
   * @see _.flow
   */
  flow<A extends any[], R1, R2, R3>(f1: (...args: A) => R1, f2: (a: R1) => R2, f3: (a: R2) => R3): (...args: A) => R3;
  /**
   * @see _.flow
   */
  flow<A extends any[], R1, R2>(f1: (...args: A) => R1, f2: (a: R1) => R2): (...args: A) => R2;
  /**
   * @see _.flow
   */
  flow(...func: Array<Many<(...args: any[]) => any>>): (...args: any[]) => any;
}

declare interface LoDashStatic {
  /**
   * This method is like _.flow except that it creates a function that invokes the provided functions from right
   * to left.
   *
   * @param funcs Functions to invoke.
   * @return Returns the new function.
   */
  flowRight<A extends any[], R1, R2, R3, R4, R5, R6, R7>(
    f7: (a: R6) => R7,
    f6: (a: R5) => R6,
    f5: (a: R4) => R5,
    f4: (a: R3) => R4,
    f3: (a: R2) => R3,
    f2: (a: R1) => R2,
    f1: (...args: A) => R1
  ): (...args: A) => R7;
  /**
   * @see _.flowRight
   */
  flowRight<A extends any[], R1, R2, R3, R4, R5, R6>(
    f6: (a: R5) => R6,
    f5: (a: R4) => R5,
    f4: (a: R3) => R4,
    f3: (a: R2) => R3,
    f2: (a: R1) => R2,
    f1: (...args: A) => R1
  ): (...args: A) => R6;
  /**
   * @see _.flowRight
   */
  flowRight<A extends any[], R1, R2, R3, R4, R5>(
    f5: (a: R4) => R5,
    f4: (a: R3) => R4,
    f3: (a: R2) => R3,
    f2: (a: R1) => R2,
    f1: (...args: A) => R1
  ): (...args: A) => R5;
  /**
   * @see _.flowRight
   */
  flowRight<A extends any[], R1, R2, R3, R4>(
    f4: (a: R3) => R4,
    f3: (a: R2) => R3,
    f2: (a: R1) => R2,
    f1: (...args: A) => R1
  ): (...args: A) => R4;
  /**
   * @see _.flowRight
   */
  flowRight<A extends any[], R1, R2, R3>(
    f3: (a: R2) => R3,
    f2: (a: R1) => R2,
    f1: (...args: A) => R1
  ): (...args: A) => R3;
  /**
   * @see _.flowRight
   */
  flowRight<A extends any[], R1, R2>(f2: (a: R1) => R2, f1: (...args: A) => R1): (...args: A) => R2;
  /**
   * @see _.flowRight
   */
  flowRight(...func: Array<Many<(...args: any[]) => any>>): (...args: any[]) => any;
}

declare interface LoDashStatic {
  /**
   * This method returns the first argument provided to it.
   *
   * @param value Any value.
   * @return Returns value.
   */
  identity<T>(value: T): T;
  /**
   * @see _.identity
   */
  identity(): undefined;
}

declare interface LoDashStatic {
  /**
   * Creates a function that invokes `func` with the arguments of the created
   * function. If `func` is a property name the created callback returns the
   * property value for a given element. If `func` is an object the created
   * callback returns `true` for elements that contain the equivalent object properties, otherwise it returns `false`.
   *
   * @category Util
   * @param [func=_.identity] The value to convert to a callback.
   * @returns Returns the callback.
   * @example
   *
   * var users = [
   *   { 'user': 'barney', 'age': 36 },
   *   { 'user': 'fred',   'age': 40 }
   * ];
   *
   * // create custom iteratee shorthands
   * _.iteratee = _.wrap(_.iteratee, function(callback, func) {
   *   var p = /^(\S+)\s*([<>])\s*(\S+)$/.exec(func);
   *   return !p ? callback(func) : function(object) {
   *     return (p[2] == '>' ? object[p[1]] > p[3] : object[p[1]] < p[3]);
   *   };
   * });
   *
   * _.filter(users, 'age > 36');
   * // => [{ 'user': 'fred', 'age': 40 }]
   */
  iteratee<TFunction extends (...args: any[]) => any>(func: TFunction): TFunction;
  /**
   * @see _.iteratee
   */
  iteratee(func: symbol | number | string | object): (...args: any[]) => any;
}

declare interface LoDashStatic {
  /**
   * Creates a function that performs a deep comparison between a given object and source, returning true if the
   * given object has equivalent property values, else false.
   *
   * Note: This method supports comparing arrays, booleans, Date objects, numbers, Object objects, regexes, and
   * strings. Objects are compared by their own, not inherited, enumerable properties. For comparing a single own
   * or inherited property value see _.matchesProperty.
   *
   * @param source The object of property values to match.
   * @return Returns the new function.
   */
  matches<T>(source: T): (value: any) => boolean;
  /**
   * @see _.matches
   */
  matches<T, V>(source: T): (value: V) => boolean;
}

declare interface LoDashStatic {
  /**
   * Creates a function that compares the property value of path on a given object to value.
   *
   * Note: This method supports comparing arrays, booleans, Date objects, numbers, Object objects, regexes, and
   * strings. Objects are compared by their own, not inherited, enumerable properties.
   *
   * @param path The path of the property to get.
   * @param srcValue The value to match.
   * @return Returns the new function.
   */
  matchesProperty<T>(path: PropertyPath, srcValue: T): (value: any) => boolean;
  /**
   * @see _.matchesProperty
   */
  matchesProperty<T, V>(path: PropertyPath, srcValue: T): (value: V) => boolean;
}

declare interface LoDashStatic {
  /**
   * Creates a function that invokes the method at path on a given object. Any additional arguments are provided
   * to the invoked method.
   *
   * @param path The path of the method to invoke.
   * @param args The arguments to invoke the method with.
   * @return Returns the new function.
   */
  method(path: PropertyPath, ...args: any[]): (object: any) => any;
}

declare interface LoDashStatic {
  /**
   * The opposite of _.method; this method creates a function that invokes the method at a given path on object.
   * Any additional arguments are provided to the invoked method.
   *
   * @param object The object to query.
   * @param args The arguments to invoke the method with.
   * @return Returns the new function.
   */
  methodOf(object: object, ...args: any[]): (path: PropertyPath) => any;
}

declare interface LoDashStatic {
  /**
   * Adds all own enumerable function properties of a source object to the destination object. If object is a
   * function then methods are added to its prototype as well.
   *
   * Note: Use _.runInContext to create a pristine lodash function to avoid conflicts caused by modifying
   * the original.
   *
   * @param object The destination object.
   * @param source The object of functions to add.
   * @param options The options object.
   * @param options.chain Specify whether the functions added are chainable.
   * @return Returns object.
   */
  mixin<TObject>(object: TObject, source: Dictionary<(...args: any[]) => any>, options?: MixinOptions): TObject;
  /**
   * @see _.mixin
   */
  mixin<TResult>(source: Dictionary<(...args: any[]) => any>, options?: MixinOptions): LoDashStatic;
}

declare interface LoDashStatic {
  /**
   * Reverts the _ variable to its previous value and returns a reference to the lodash function.
   *
   * @return Returns the lodash function.
   */
  noConflict(): typeof _;
}

declare interface LoDashStatic {
  /**
   * A no-operation function that returns undefined regardless of the arguments it receives.
   *
   * @return undefined
   */
  noop(...args: any[]): void;
}

declare interface LoDashStatic {
  /**
   * Creates a function that returns its nth argument.
   *
   * @param n The index of the argument to return.
   * @return Returns the new function.
   */
  nthArg(n?: number): (...args: any[]) => any;
}

declare interface LoDashStatic {
  /**
   * Creates a function that invokes iteratees with the arguments provided to the created function and returns
   * their results.
   *
   * @param iteratees The iteratees to invoke.
   * @return Returns the new function.
   */
  over<TResult>(...iteratees: Array<Many<(...args: any[]) => TResult>>): (...args: any[]) => TResult[];
}

declare interface LoDashStatic {
  /**
   * Creates a function that checks if all of the predicates return truthy when invoked with the arguments
   * provided to the created function.
   *
   * @param predicates The predicates to check.
   * @return Returns the new function.
   */
  overEvery<T, Result1 extends T, Result2 extends T>(
    ...predicates: [(arg: T) => arg is Result1, (arg: T) => arg is Result2]
  ): (arg: T) => arg is Result1 & Result2;
  overEvery<T>(...predicates: Array<Many<(...args: T[]) => boolean>>): (...args: T[]) => boolean;
}

declare interface LoDashStatic {
  /**
   * Creates a function that checks if any of the predicates return truthy when invoked with the arguments
   * provided to the created function.
   *
   * @param predicates The predicates to check.
   * @return Returns the new function.
   */
  overSome<T, Result1 extends T, Result2 extends T>(
    ...predicates: [(arg: T) => arg is Result1, (arg: T) => arg is Result2]
  ): (arg: T) => arg is Result1 | Result2;
  overSome<T>(...predicates: Array<Many<(...args: T[]) => boolean>>): (...args: T[]) => boolean;
}

declare interface LoDashStatic {
  /**
   * Creates a function that returns the property value at path on a given object.
   *
   * @param path The path of the property to get.
   * @return Returns the new function.
   */
  property<TObj, TResult>(path: PropertyPath): (obj: TObj) => TResult;
}

declare interface LoDashStatic {
  /**
   * The opposite of _.property; this method creates a function that returns the property value at a given path
   * on object.
   *
   * @param object The object to query.
   * @return Returns the new function.
   */
  propertyOf<T extends {}>(object: T): (path: PropertyPath) => any;
}

declare interface LoDashStatic {
  /**
   * Creates an array of numbers (positive and/or negative) progressing from start up to, but not including, end.
   * If end is not specified it’s set to start with start then set to 0. If end is less than start a zero-length
   * range is created unless a negative step is specified.
   *
   * @param start The start of the range.
   * @param end The end of the range.
   * @param step The value to increment or decrement by.
   * @return Returns a new range array.
   */
  range(start: number, end?: number, step?: number): number[];
  /**
   * @see _.range
   */
  range(end: number, index: string | number, guard: object): number[];
}

declare interface LoDashStatic {
  /**
   * This method is like `_.range` except that it populates values in
   * descending order.
   *
   * @category Util
   * @param start The start of the range.
   * @param end The end of the range.
   * @param step The value to increment or decrement by.
   * @returns Returns the new array of numbers.
   * @example
   *
   * _.rangeRight(4);
   * // => [3, 2, 1, 0]
   *
   * _.rangeRight(-4);
   * // => [-3, -2, -1, 0]
   *
   * _.rangeRight(1, 5);
   * // => [4, 3, 2, 1]
   *
   * _.rangeRight(0, 20, 5);
   * // => [15, 10, 5, 0]
   *
   * _.rangeRight(0, -4, -1);
   * // => [-3, -2, -1, 0]
   *
   * _.rangeRight(1, 4, 0);
   * // => [1, 1, 1]
   *
   * _.rangeRight(0);
   * // => []
   */
  rangeRight(start: number, end?: number, step?: number): number[];
  /**
   * @see _.rangeRight
   */
  rangeRight(end: number, index: string | number, guard: object): number[];
}

declare interface LoDashStatic {
  /**
   * Create a new pristine lodash function using the given context object.
   *
   * @param context The context object.
   * @return Returns a new lodash function.
   */
  runInContext(context?: object): LoDashStatic;
}

declare interface LoDashStatic {
  /**
   * This method returns a new empty array.
   *
   * @returns Returns the new empty array.
   */
  stubArray(): any[];
}

declare interface LoDashStatic {
  /**
   * This method returns `false`.
   *
   * @returns Returns `false`.
   */
  stubFalse(): false;
}

declare interface LoDashStatic {
  /**
   * This method returns a new empty object.
   *
   * @returns Returns the new empty object.
   */
  stubObject(): any;
}

declare interface LoDashStatic {
  /**
   * This method returns an empty string.
   *
   * @returns Returns the empty string.
   */
  stubString(): string;
}

declare interface LoDashStatic {
  /**
   * This method returns `true`.
   *
   * @returns Returns `true`.
   */
  stubTrue(): true;
}

declare interface LoDashStatic {
  /**
   * Invokes the iteratee function n times, returning an array of the results of each invocation. The iteratee
   * is invoked with one argument; (index).
   *
   * @param n The number of times to invoke iteratee.
   * @param iteratee The function invoked per iteration.
   * @return Returns the array of results.
   */
  times<TResult>(n: number, iteratee: (num: number) => TResult): TResult[];
  /**
   * @see _.times
   */
  times(n: number): number[];
}

declare interface LoDashStatic {
  /**
   * Converts `value` to a property path array.
   *
   * @category Util
   * @param value The value to convert.
   * @returns Returns the new property path array.
   * @example
   *
   * _.toPath('a.b.c');
   * // => ['a', 'b', 'c']
   *
   * _.toPath('a[0].b.c');
   * // => ['a', '0', 'b', 'c']
   *
   * var path = ['a', 'b', 'c'],
   *     newPath = _.toPath(path);
   *
   * console.log(newPath);
   * // => ['a', 'b', 'c']
   *
   * console.log(path === newPath);
   * // => false
   */
  toPath(value: any): string[];
}

declare interface LoDashStatic {
  /**
   * Generates a unique ID. If prefix is provided the ID is appended to it.
   *
   * @param prefix The value to prefix the ID with.
   * @return Returns the unique ID.
   */
  uniqueId(prefix?: string): string;
}

declare interface LoDashStatic {
  /**
   * This method returns true.
   *
   * @return Returns true.
   */
  stubTrue(): true;
}

declare interface LoDashStatic {
  /**
   * This method returns false.
   *
   * @return Returns false.
   */
  stubFalse(): false;
}

export declare const lowerCase: (typeof _)['lowerCase'];

export declare const lowerFirst: (typeof _)['lowerFirst'];

export declare const lt: (typeof _)['lt'];

export declare const lte: (typeof _)['lte'];

declare type Many<T> = T | readonly T[];

export declare const map: (typeof _)['map'];

/**
 * Creates a cache object to store key/value pairs.
 */
declare interface MapCache {
  /**
   * Removes `key` and its value from the cache.
   * @param key The key of the value to remove.
   * @return Returns `true` if the entry was removed successfully, else `false`.
   */
  delete(key: any): boolean;
  /**
   * Gets the cached value for `key`.
   * @param key The key of the value to get.
   * @return Returns the cached value.
   */
  get(key: any): any;
  /**
   * Checks if a cached value for `key` exists.
   * @param key The key of the entry to check.
   * @return Returns `true` if an entry for `key` exists, else `false`.
   */
  has(key: any): boolean;
  /**
   * Sets `value` to `key` of the cache.
   * @param key The key of the value to cache.
   * @param value The value to cache.
   * @return Returns the cache object.
   */
  set(key: any, value: any): this;
  /**
   * Removes all key-value entries from the map.
   */
  clear?: (() => void) | undefined;
}

declare interface MapCacheConstructor {
  new (): MapCache;
}

export declare const mapKeys: (typeof _)['mapKeys'];

export declare const mapValues: (typeof _)['mapValues'];

export declare const matches: (typeof _)['matches'];

export declare const matchesProperty: (typeof _)['matchesProperty'];

export declare const max: (typeof _)['max'];

export declare const maxBy: (typeof _)['maxBy'];

export declare const mean: (typeof _)['mean'];

export declare const meanBy: (typeof _)['meanBy'];

export declare const memoize: (typeof _)['memoize'];

declare interface MemoizedFunction {
  /**
   * @see _.cache
   */
  cache: MapCache;
}

declare type MemoListIterator<T, TResult, TList> = (prev: TResult, curr: T, index: number, list: TList) => TResult;

declare type MemoObjectIterator<T, TResult, TList> = (prev: TResult, curr: T, key: string, list: TList) => TResult;

declare type MemoVoidArrayIterator<T, TResult> = (acc: TResult, curr: T, index: number, arr: T[]) => void;

declare type MemoVoidDictionaryIterator<T, K extends string | number | symbol, TResult> = (
  acc: TResult,
  curr: T,
  key: K,
  dict: Record<K, T>
) => void;

export declare const merge: (typeof _)['merge'];

export declare const mergeWith: (typeof _)['mergeWith'];

declare type MergeWithCustomizer = {
  bivariantHack(value: any, srcValue: any, key: string, object: any, source: any): any;
}['bivariantHack'];

export declare const method: (typeof _)['method'];

export declare const methodOf: (typeof _)['methodOf'];

export declare const min: (typeof _)['min'];

export declare const minBy: (typeof _)['minBy'];

export declare const mixin: (typeof _)['mixin'];

declare interface MixinOptions {
  /**
   * @see _.chain
   */
  chain?: boolean | undefined;
}

export declare const multiply: (typeof _)['multiply'];

export declare const negate: (typeof _)['negate'];

export declare const noop: (typeof _)['noop'];

declare type NotVoid = unknown;

export declare const now: (typeof _)['now'];

export declare const nth: (typeof _)['nth'];

export declare const nthArg: (typeof _)['nthArg'];

declare interface NumericDictionary<T> {
  [index: number]: T;
}

declare interface Object_2<T> extends LoDashImplicitWrapper<T> {}

declare interface Object_2<T> {
  /**
   * @see _.concat
   */
  concat(...values: Array<Many<T>>): Collection<T>;
}

declare interface Object_2<T> {
  /**
   * @see _.countBy
   */
  countBy(iteratee?: ValueIteratee<T[keyof T]>): Object_2<Dictionary<number>>;
}

declare interface Object_2<T> {
  /**
   * @see _.each
   */
  each: Object_2<T>['forEach'];
}

declare interface Object_2<T> {
  /**
   * @see _.eachRight
   */
  eachRight: Object_2<T>['forEachRight'];
}

declare interface Object_2<T> {
  /**
   * @see _.every
   */
  every(predicate?: ObjectIterateeCustom<T, boolean>): boolean;
}

declare interface Object_2<T> {
  /**
   * @see _.filter
   */
  filter<S extends T[keyof T]>(predicate: ObjectIteratorTypeGuard<T, S>): Collection<S>;
  /**
   * @see _.filter
   */
  filter(predicate?: ObjectIterateeCustom<T, boolean>): Collection<T[keyof T]>;
}

declare interface Object_2<T> {
  /**
   * @see _.find
   */
  find<S extends T[keyof T]>(predicate: ObjectIteratorTypeGuard<T, S>, fromIndex?: number): S | undefined;
  /**
   * @see _.find
   */
  find(predicate?: ObjectIterateeCustom<T, boolean>, fromIndex?: number): T[keyof T] | undefined;
}

declare interface Object_2<T> {
  /**
   * @see _.findLast
   */
  findLast<S extends T[keyof T]>(predicate: ObjectIteratorTypeGuard<T, S>, fromIndex?: number): S | undefined;
  /**
   * @see _.findLast
   */
  findLast(predicate?: ObjectIterateeCustom<T, boolean>, fromIndex?: number): T[keyof T] | undefined;
}

declare interface Object_2<T> {
  /**
   * @see _.flatMap
   */
  flatMap<TResult = any>(iteratee: ObjectIterator<T, Many<TResult>> | PropertyName): Collection<TResult>;
  /**
   * @see _.flatMap
   */
  flatMap(iteratee: [PropertyName, any] | object): Collection<boolean>;
  /**
   * @see _.flatMap
   */
  flatMap(): Collection<T[keyof T]>;
}

declare interface Object_2<T> {
  /**
   * @see _.flatMapDeep
   */
  flatMapDeep<TResult = any>(
    iteratee: ObjectIterator<T, ListOfRecursiveArraysOrValues<TResult> | TResult> | PropertyName
  ): Collection<TResult>;
  /**
   * @see _.flatMapDeep
   */
  flatMapDeep(iteratee: [PropertyName, any] | object): Collection<boolean>;
  /**
   * @see _.flatMapDeep
   */
  flatMapDeep(): Collection<T[keyof T]>;
}

declare interface Object_2<T> {
  /**
   * @see _.flatMapDepth
   */
  flatMapDepth<TResult = any>(
    iteratee: ObjectIterator<T, ListOfRecursiveArraysOrValues<TResult> | TResult> | PropertyName,
    depth?: number
  ): Collection<TResult>;
  /**
   * @see _.flatMapDepth
   */
  flatMapDepth(iteratee: [PropertyName, any] | object, depth?: number): Collection<boolean>;
  /**
   * @see _.flatMapDepth
   */
  flatMapDepth(depth?: number): Collection<T[keyof T]>;
}

declare interface Object_2<T> {
  /**
   * @see _.forEach
   */
  forEach(iteratee?: ObjectIterator<T, any>): Object_2<T>;
}

declare interface Object_2<T> {
  /**
   * @see _.forEachRight
   */
  forEachRight(iteratee?: ObjectIterator<T, any>): Object_2<T>;
}

declare interface Object_2<T> {
  /**
   * @see _.groupBy
   */
  groupBy(iteratee?: ValueIteratee<T[keyof T]>): Object_2<Dictionary<Array<T[keyof T]>>>;
}

declare interface Object_2<T> {
  /**
   * @see _.includes
   */
  includes(target: T[keyof T], fromIndex?: number): boolean;
}

declare interface Object_2<T> {
  /**
   * @see _.keyBy
   */
  keyBy(iteratee?: ValueIterateeCustom<T[keyof T], PropertyName>): Object_2<Dictionary<T[keyof T]>>;
}

declare interface Object_2<T> {
  /**
   * @see _.map
   */
  map<K extends keyof T[keyof T]>(key: K): Collection<T[keyof T][K]>;
  /**
   * @see _.map
   */
  map<TResult>(iteratee: ObjectIterator<T, TResult>): Collection<TResult>;
  /**
   * @see _.map
   */
  map(iteratee: PropertyName): Collection<any>;
  /**
   * @see _.map
   */
  map(iteratee: [PropertyName, any] | object): Collection<boolean>;
  /**
   * @see _.map
   */
  map(): Collection<T[keyof T]>;
}

declare interface Object_2<T> {
  /**
   * @see _.orderBy
   */
  orderBy(
    iteratees?: Many<ObjectIterator<T, NotVoid>>,
    orders?: Many<boolean | 'asc' | 'desc'>
  ): Collection<T[keyof T]>;
}

declare interface Object_2<T> {
  /**
   * @see _.partition
   */
  partition(callback: ValueIteratee<T[keyof T]>): LoDashImplicitWrapper<[Array<T[keyof T]>, Array<T[keyof T]>]>;
}

declare interface Object_2<T> {
  /**
   * @see _.reduce
   */
  reduce<TResult>(callback: MemoObjectIterator<T[keyof T], TResult, T>, accumulator: TResult): TResult;
  /**
   * @see _.reduce
   */
  reduce(callback: MemoObjectIterator<T[keyof T], T[keyof T], T>): T[keyof T] | undefined;
}

declare interface Object_2<T> {
  /**
   * @see _.reduceRight
   */
  reduceRight<TResult>(callback: MemoObjectIterator<T[keyof T], TResult, T>, accumulator: TResult): TResult;
  /**
   * @see _.reduceRight
   */
  reduceRight(callback: MemoObjectIterator<T[keyof T], T[keyof T], T>): T[keyof T] | undefined;
}

declare interface Object_2<T> {
  /**
   * @see _.reject
   */
  reject(predicate?: ObjectIterateeCustom<T, boolean>): Collection<T[keyof T]>;
}

declare interface Object_2<T> {
  /**
   * @see _.sample
   */
  sample(): T[keyof T] | undefined;
}

declare interface Object_2<T> {
  /**
   * @see _.sampleSize
   */
  sampleSize(n?: number): Collection<T[keyof T]>;
}

declare interface Object_2<T> {
  /**
   * @see _.shuffle
   */
  shuffle(): Collection<T[keyof T]>;
}

declare interface Object_2<T> {
  /**
   * @see _.some
   */
  some(predicate?: ObjectIterateeCustom<T, boolean>): boolean;
}

declare interface Object_2<T> {
  /**
   * @see _.sortBy
   */
  sortBy(...iteratees: Array<Many<ObjectIteratee<T>>>): Collection<T[keyof T]>;
}

declare interface Object_2<T> {
  /**
   * @see _.castArray
   */
  castArray(): Collection<T>;
}

declare interface Object_2<T> {
  /**
   * @see _.toArray
   */
  toArray(): Collection<T[keyof T]>;
}

declare interface Object_2<T> {
  /**
   * @see _.assign
   */
  assign<TSource>(source: TSource): Object_2<T & TSource>;
  /**
   * @see _.assign
   */
  assign<TSource1, TSource2>(source1: TSource1, source2: TSource2): Object_2<T & TSource1 & TSource2>;
  /**
   * @see _.assign
   */
  assign<TSource1, TSource2, TSource3>(
    source1: TSource1,
    source2: TSource2,
    source3: TSource3
  ): Object_2<T & TSource1 & TSource2 & TSource3>;
  /**
   * @see _.assign
   */
  assign<TSource1, TSource2, TSource3, TSource4>(
    source1: TSource1,
    source2: TSource2,
    source3: TSource3,
    source4: TSource4
  ): Object_2<T & TSource1 & TSource2 & TSource3 & TSource4>;
  /**
   * @see _.assign
   */
  assign(): Object_2<T>;
  /**
   * @see _.assign
   */
  assign(...otherArgs: any[]): Object_2<any>;
}

declare interface Object_2<T> {
  /**
   * @see _.assignIn
   */
  assignIn<TSource>(source: TSource): Object_2<T & TSource>;
  /**
   * @see _.assignIn
   */
  assignIn<TSource1, TSource2>(source1: TSource1, source2: TSource2): Object_2<T & TSource1 & TSource2>;
  /**
   * @see _.assignIn
   */
  assignIn<TSource1, TSource2, TSource3>(
    source1: TSource1,
    source2: TSource2,
    source3: TSource3
  ): Object_2<T & TSource1 & TSource2 & TSource3>;
  /**
   * @see _.assignIn
   */
  assignIn<TSource1, TSource2, TSource3, TSource4>(
    source1: TSource1,
    source2: TSource2,
    source3: TSource3,
    source4: TSource4
  ): Object_2<T & TSource1 & TSource2 & TSource3 & TSource4>;
  /**
   * @see _.assignIn
   */
  assignIn(): Object_2<T>;
  /**
   * @see _.assignIn
   */
  assignIn<TResult>(...otherArgs: any[]): Object_2<TResult>;
}

declare interface Object_2<T> {
  /**
   * @see _.assignInWith
   */
  assignInWith<TSource>(source: TSource, customizer: AssignCustomizer): Object_2<T & TSource>;
  /**
   * @see _.assignInWith
   */
  assignInWith<TSource1, TSource2>(
    source1: TSource1,
    source2: TSource2,
    customizer: AssignCustomizer
  ): Object_2<T & TSource1 & TSource2>;
  /**
   * @see _.assignInWith
   */
  assignInWith<TSource1, TSource2, TSource3>(
    source1: TSource1,
    source2: TSource2,
    source3: TSource3,
    customizer: AssignCustomizer
  ): Object_2<T & TSource1 & TSource2 & TSource3>;
  /**
   * @see _.assignInWith
   */
  assignInWith<TSource1, TSource2, TSource3, TSource4>(
    source1: TSource1,
    source2: TSource2,
    source3: TSource3,
    source4: TSource4,
    customizer: AssignCustomizer
  ): Object_2<T & TSource1 & TSource2 & TSource3 & TSource4>;
  /**
   * @see _.assignInWith
   */
  assignInWith(): Object_2<T>;
  /**
   * @see _.assignInWith
   */
  assignInWith<TResult>(...otherArgs: any[]): Object_2<TResult>;
}

declare interface Object_2<T> {
  /**
   * @see _.assignWith
   */
  assignWith<TSource>(source: TSource, customizer: AssignCustomizer): Object_2<T & TSource>;
  /**
   * @see _.assignWith
   */
  assignWith<TSource1, TSource2>(
    source1: TSource1,
    source2: TSource2,
    customizer: AssignCustomizer
  ): Object_2<T & TSource1 & TSource2>;
  /**
   * @see _.assignWith
   */
  assignWith<TSource1, TSource2, TSource3>(
    source1: TSource1,
    source2: TSource2,
    source3: TSource3,
    customizer: AssignCustomizer
  ): Object_2<T & TSource1 & TSource2 & TSource3>;
  /**
   * @see _.assignWith
   */
  assignWith<TSource1, TSource2, TSource3, TSource4>(
    source1: TSource1,
    source2: TSource2,
    source3: TSource3,
    source4: TSource4,
    customizer: AssignCustomizer
  ): Object_2<T & TSource1 & TSource2 & TSource3 & TSource4>;
  /**
   * @see _.assignWith
   */
  assignWith(): Object_2<T>;
  /**
   * @see _.assignWith
   */
  assignWith<TResult>(...otherArgs: any[]): Object_2<TResult>;
}

declare interface Object_2<T> {
  /**
   * @see _.at
   */
  at(...props: Array<Many<keyof T>>): Collection<T[keyof T]>;
}

declare interface Object_2<T> {
  /**
   * @see _.create
   */
  create<U extends object>(properties?: U): Object_2<T & U>;
}

declare interface Object_2<T> {
  /**
   * @see _.defaults
   */
  defaults<TSource>(source: TSource): Object_2<NonNullable<TSource & T>>;
  /**
   * @see _.defaults
   */
  defaults<TSource1, TSource2>(source1: TSource1, source2: TSource2): Object_2<NonNullable<TSource2 & TSource1 & T>>;
  /**
   * @see _.defaults
   */
  defaults<TSource1, TSource2, TSource3>(
    source1: TSource1,
    source2: TSource2,
    source3: TSource3
  ): Object_2<NonNullable<TSource3 & TSource2 & TSource1 & T>>;
  /**
   * @see _.defaults
   */
  defaults<TSource1, TSource2, TSource3, TSource4>(
    source1: TSource1,
    source2: TSource2,
    source3: TSource3,
    source4: TSource4
  ): Object_2<NonNullable<TSource4 & TSource3 & TSource2 & TSource1 & T>>;
  /**
   * @see _.defaults
   */
  defaults(): Object_2<NonNullable<T>>;
  /**
   * @see _.defaults
   */
  defaults(...sources: any[]): Object_2<any>;
}

declare interface Object_2<T> {
  /**
   * @see _.defaultsDeep
   */
  defaultsDeep(...sources: any[]): Object_2<any>;
}

declare interface Object_2<T> {
  /**
   * @see _.entries
   */
  entries(): Collection<[string, T[keyof T]]>;
}

declare interface Object_2<T> {
  /**
   * @see _.entriesIn
   */
  entriesIn(): Collection<[string, T[keyof T]]>;
}

declare interface Object_2<T> {
  /**
   * @see _.extend
   */
  extend<TSource>(source: TSource): Object_2<T & TSource>;
  /**
   * @see _.extend
   */
  extend<TSource1, TSource2>(source1: TSource1, source2: TSource2): Object_2<T & TSource1 & TSource2>;
  /**
   * @see _.extend
   */
  extend<TSource1, TSource2, TSource3>(
    source1: TSource1,
    source2: TSource2,
    source3: TSource3
  ): Object_2<T & TSource1 & TSource2 & TSource3>;
  /**
   * @see _.extend
   */
  extend<TSource1, TSource2, TSource3, TSource4>(
    source1: TSource1,
    source2: TSource2,
    source3: TSource3,
    source4: TSource4
  ): Object_2<T & TSource1 & TSource2 & TSource3 & TSource4>;
  /**
   * @see _.extend
   */
  extend(): Object_2<T>;
  /**
   * @see _.extend
   */
  extend(...otherArgs: any[]): Object_2<any>;
}

declare interface Object_2<T> {
  /**
   * @see _.extendWith
   */
  extendWith<TSource>(source: TSource, customizer: AssignCustomizer): Object_2<T & TSource>;
  /**
   * @see _.extendWith
   */
  extendWith<TSource1, TSource2>(
    source1: TSource1,
    source2: TSource2,
    customizer: AssignCustomizer
  ): Object_2<T & TSource1 & TSource2>;
  /**
   * @see _.extendWith
   */
  extendWith<TSource1, TSource2, TSource3>(
    source1: TSource1,
    source2: TSource2,
    source3: TSource3,
    customizer: AssignCustomizer
  ): Object_2<T & TSource1 & TSource2 & TSource3>;
  /**
   * @see _.extendWith
   */
  extendWith<TSource1, TSource2, TSource3, TSource4>(
    source1: TSource1,
    source2: TSource2,
    source3: TSource3,
    source4: TSource4,
    customizer: AssignCustomizer
  ): Object_2<T & TSource1 & TSource2 & TSource3 & TSource4>;
  /**
   * @see _.extendWith
   */
  extendWith(): Object_2<T>;
  /**
   * @see _.extendWith
   */
  extendWith(...otherArgs: any[]): Object_2<any>;
}

declare interface Object_2<T> {
  /**
   * @see _.get
   */
  get<TKey extends keyof T>(path: TKey | [TKey]): T[TKey];
  /**
   * @see _.get
   */
  get<TKey extends keyof T, TDefault>(
    path: TKey | [TKey],
    defaultValue: TDefault
  ): Exclude<T[TKey], undefined> | TDefault;
  /**
   * @see _.get
   */
  get<TKey1 extends keyof T, TKey2 extends keyof T[TKey1]>(path: [TKey1, TKey2]): T[TKey1][TKey2];
  /**
   * @see _.get
   */
  get<TKey1 extends keyof T, TKey2 extends keyof T[TKey1], TDefault>(
    path: [TKey1, TKey2],
    defaultValue: TDefault
  ): Exclude<T[TKey1][TKey2], undefined> | TDefault;
  /**
   * @see _.get
   */
  get<TKey1 extends keyof T, TKey2 extends keyof T[TKey1], TKey3 extends keyof T[TKey1][TKey2]>(
    path: [TKey1, TKey2, TKey3]
  ): T[TKey1][TKey2][TKey3];
  /**
   * @see _.get
   */
  get<TKey1 extends keyof T, TKey2 extends keyof T[TKey1], TKey3 extends keyof T[TKey1][TKey2], TDefault>(
    path: [TKey1, TKey2, TKey3],
    defaultValue: TDefault
  ): Exclude<T[TKey1][TKey2][TKey3], undefined> | TDefault;
  /**
   * @see _.get
   */
  get<
    TKey1 extends keyof T,
    TKey2 extends keyof T[TKey1],
    TKey3 extends keyof T[TKey1][TKey2],
    TKey4 extends keyof T[TKey1][TKey2][TKey3]
  >(
    path: [TKey1, TKey2, TKey3, TKey4]
  ): T[TKey1][TKey2][TKey3][TKey4];
  /**
   * @see _.get
   */
  get<
    TKey1 extends keyof T,
    TKey2 extends keyof T[TKey1],
    TKey3 extends keyof T[TKey1][TKey2],
    TKey4 extends keyof T[TKey1][TKey2][TKey3],
    TDefault
  >(
    path: [TKey1, TKey2, TKey3, TKey4],
    defaultValue: TDefault
  ): Exclude<T[TKey1][TKey2][TKey3][TKey4], undefined> | TDefault;
  /**
   * @see _.get
   */
  get<TPath extends string>(path: TPath): string extends TPath ? any : GetFieldType<T, TPath>;
  /**
   * @see _.get
   */
  get<TPath extends string, TDefault = GetFieldType<T, TPath>>(
    path: TPath,
    defaultValue: TDefault
  ): Exclude<GetFieldType<T, TPath>, null | undefined> | TDefault;
  /**
   * @see _.get
   */
  get(path: PropertyPath, defaultValue?: any): any;
}

declare interface Object_2<T> {
  /**
   * @see _.invertBy
   */
  invertBy(iteratee?: ValueIteratee<T[keyof T]>): Object_2<Dictionary<string[]>>;
}

declare interface Object_2<T> {
  /**
   * @see _.mapKeys
   */
  mapKeys(iteratee?: ObjectIteratee<T>): Object_2<Dictionary<T[keyof T]>>;
}

declare interface Object_2<T> {
  /**
   * @see _.mapValues
   */
  mapValues<TResult>(callback: ObjectIterator<T, TResult>): Object_2<{ [P in keyof T]: TResult }>;
  /**
   * @see _.mapValues
   */
  mapValues<TResult>(callback: DictionaryIterator<T[keyof T], TResult>): Object_2<Dictionary<TResult>>;
  /**
   * @see _.mapValues
   */
  mapValues(iteratee: object): Object_2<{ [P in keyof T]: boolean }>;
  /**
   * @see _.mapValues
   */
  mapValues<TKey extends keyof T[keyof T]>(iteratee: TKey): Object_2<Dictionary<T[keyof T][TKey]>>;
  /**
   * @see _.mapValues
   */
  mapValues(iteratee: string): Object_2<{ [P in keyof T]: any }>;
  /**
   * @see _.mapValues
   */
  mapValues(): Object_2<T>;
}

declare interface Object_2<T> {
  /**
   * @see _.merge
   */
  merge<TSource>(source: TSource): Object_2<T & TSource>;
  /**
   * @see _.merge
   */
  merge<TSource1, TSource2>(source1: TSource1, source2: TSource2): Object_2<T & TSource1 & TSource2>;
  /**
   * @see _.merge
   */
  merge<TSource1, TSource2, TSource3>(
    source1: TSource1,
    source2: TSource2,
    source3: TSource3
  ): Object_2<T & TSource1 & TSource2 & TSource3>;
  /**
   * @see _.merge
   */
  merge<TSource1, TSource2, TSource3, TSource4>(
    source1: TSource1,
    source2: TSource2,
    source3: TSource3,
    source4: TSource4
  ): Object_2<T & TSource1 & TSource2 & TSource3 & TSource4>;
  /**
   * @see _.merge
   */
  merge(...otherArgs: any[]): Object_2<any>;
}

declare interface Object_2<T> {
  /**
   * @see _.mergeWith
   */
  mergeWith<TSource>(source: TSource, customizer: MergeWithCustomizer): Object_2<T & TSource>;
  /**
   * @see _.mergeWith
   */
  mergeWith<TSource1, TSource2>(
    source1: TSource1,
    source2: TSource2,
    customizer: MergeWithCustomizer
  ): Object_2<T & TSource1 & TSource2>;
  /**
   * @see _.mergeWith
   */
  mergeWith<TSource1, TSource2, TSource3>(
    source1: TSource1,
    source2: TSource2,
    source3: TSource3,
    customizer: MergeWithCustomizer
  ): Object_2<T & TSource1 & TSource2 & TSource3>;
  /**
   * @see _.mergeWith
   */
  mergeWith<TSource1, TSource2, TSource3, TSource4>(
    source1: TSource1,
    source2: TSource2,
    source3: TSource3,
    source4: TSource4,
    customizer: MergeWithCustomizer
  ): Object_2<T & TSource1 & TSource2 & TSource3 & TSource4>;
  /**
   * @see _.mergeWith
   */
  mergeWith(...otherArgs: any[]): Object_2<any>;
}

declare interface Object_2<T> {
  /**
   * @see _.omit
   */
  omit<K extends keyof T>(...paths: Array<Many<K>>): Object_2<Omit_2<T, K>>;
  /**
   * @see _.omit
   */
  omit(...paths: Array<Many<PropertyName | IterateeShorthand<T>>>): Object_2<PartialObject<T>>;
}

declare interface Object_2<T> {
  /**
   * @see _.omitBy
   */
  omitBy(predicate: ValueKeyIteratee<T[keyof T]>): Object_2<PartialObject<T>>;
}

declare interface Object_2<T> {
  /**
   * @see _.pick
   */
  pick<U extends keyof T>(...props: Array<Many<U>>): Object_2<Pick<T, U>>;
  /**
   * @see _.pick
   */
  pick(...props: Array<Many<PropertyPath>>): Object_2<PartialObject<T>>;
}

declare interface Object_2<T> {
  /**
   * @see _.pickBy
   */
  pickBy<S extends T[keyof T]>(
    predicate: ValueKeyIterateeTypeGuard<T[keyof T], S>
  ): Object_2<NumericDictionary<unknown> extends T ? NumericDictionary<S> : Dictionary<S>>;
  /**
   * @see _.pickBy
   */
  pickBy(
    predicate?: ValueKeyIteratee<T[keyof T]>
  ): Object_2<
    T extends Dictionary<unknown>
      ? Dictionary<T[keyof T]>
      : T extends NumericDictionary<unknown>
        ? NumericDictionary<T[keyof T]>
        : PartialObject<T>
  >;
}

declare interface Object_2<T> {
  /**
   * @see _.transform
   */
  transform<TResult>(
    iteratee: MemoVoidDictionaryIterator<T[keyof T], string, TResult>,
    accumulator?: TResult
  ): ImpChain<TResult>;
  /**
   * @see _.transform
   */
  transform<TResult>(
    iteratee: MemoVoidDictionaryIterator<T[keyof T], keyof T, TResult>,
    accumulator?: TResult
  ): ImpChain<TResult>;
  /**
   * @see _.transform
   */
  transform(): ImpChain<T extends Dictionary<unknown> ? Dictionary<any> : T>;
}

declare interface Object_2<T> {
  /**
   * @see _.updateWith
   */
  updateWith(path: PropertyPath, updater: (oldValue: any) => any, customizer?: SetWithCustomizer<T>): this;
  /**
   * @see _.updateWith
   */
  updateWith<TResult>(
    path: PropertyPath,
    updater: (oldValue: any) => any,
    customizer?: SetWithCustomizer<T>
  ): Object_2<TResult>;
}

declare interface Object_2<T> {
  /**
   * @see _.values
   */
  values(): Collection<T[keyof T]>;
}

declare interface Object_2<T> {
  /**
   * @see _.valuesIn
   */
  valuesIn(): Collection<T[keyof T]>;
}

declare interface Object_2<T> {
  /**
   * @see _.chain
   */
  chain(): ObjectChain<T>;
}

declare interface Object_2<T> {
  /**
   * @see _.iteratee
   */
  iteratee(): LoDashFunction<(o: T) => boolean>;
}

declare interface ObjectChain<T> extends LoDashExplicitWrapper<T> {}

declare interface ObjectChain<T> {
  /**
   * @see _.concat
   */
  concat(...values: Array<Many<T>>): CollectionChain<T>;
}

declare interface ObjectChain<T> {
  /**
   * @see _.countBy
   */
  countBy(iteratee?: ValueIteratee<T[keyof T]>): ObjectChain<Dictionary<number>>;
}

declare interface ObjectChain<T> {
  /**
   * @see _.each
   */
  each: ObjectChain<T>['forEach'];
}

declare interface ObjectChain<T> {
  /**
   * @see _.eachRight
   */
  eachRight: ObjectChain<T>['forEachRight'];
}

declare interface ObjectChain<T> {
  /**
   * @see _.every
   */
  every(predicate?: ObjectIterateeCustom<T, boolean>): PrimitiveChain<boolean>;
}

declare interface ObjectChain<T> {
  /**
   * @see _.filter
   */
  filter<S extends T[keyof T]>(predicate: ObjectIteratorTypeGuard<T, S>): CollectionChain<S>;
  /**
   * @see _.filter
   */
  filter(predicate?: ObjectIterateeCustom<T, boolean>): CollectionChain<T[keyof T]>;
}

declare interface ObjectChain<T> {
  /**
   * @see _.find
   */
  find<S extends T[keyof T]>(predicate: ObjectIteratorTypeGuard<T, S>, fromIndex?: number): ExpChain<S | undefined>;
  /**
   * @see _.find
   */
  find(predicate?: ObjectIterateeCustom<T, boolean>, fromIndex?: number): ExpChain<T[keyof T] | undefined>;
}

declare interface ObjectChain<T> {
  /**
   * @see _.findLast
   */
  findLast<S extends T[keyof T]>(predicate: ObjectIteratorTypeGuard<T, S>, fromIndex?: number): ExpChain<S | undefined>;
  /**
   * @see _.findLast
   */
  findLast(predicate?: ObjectIterateeCustom<T, boolean>, fromIndex?: number): ExpChain<T[keyof T] | undefined>;
}

declare interface ObjectChain<T> {
  /**
   * @see _.flatMap
   */
  flatMap<TResult = any>(iteratee: ObjectIterator<T, Many<TResult>> | PropertyName): CollectionChain<TResult>;
  /**
   * @see _.flatMap
   */
  flatMap(iteratee: [PropertyName, any] | object): CollectionChain<boolean>;
  /**
   * @see _.flatMap
   */
  flatMap(): CollectionChain<T[keyof T]>;
}

declare interface ObjectChain<T> {
  /**
   * @see _.flatMapDeep
   */
  flatMapDeep<TResult = any>(
    iteratee: ObjectIterator<T, ListOfRecursiveArraysOrValues<TResult> | TResult> | PropertyName
  ): CollectionChain<TResult>;
  /**
   * @see _.flatMapDeep
   */
  flatMapDeep(iteratee: [PropertyName, any] | object): CollectionChain<boolean>;
  /**
   * @see _.flatMapDeep
   */
  flatMapDeep(): CollectionChain<T[keyof T]>;
}

declare interface ObjectChain<T> {
  /**
   * @see _.flatMapDepth
   */
  flatMapDepth<TResult = any>(
    iteratee: ObjectIterator<T, ListOfRecursiveArraysOrValues<TResult> | TResult> | PropertyName,
    depth?: number
  ): CollectionChain<TResult>;
  /**
   * @see _.flatMapDepth
   */
  flatMapDepth(iteratee: [PropertyName, any] | object, depth?: number): CollectionChain<boolean>;
  /**
   * @see _.flatMapDepth
   */
  flatMapDepth(depth?: number): CollectionChain<T[keyof T]>;
}

declare interface ObjectChain<T> {
  /**
   * @see _.forEach
   */
  forEach(iteratee?: ObjectIterator<T, any>): ObjectChain<T>;
}

declare interface ObjectChain<T> {
  /**
   * @see _.forEachRight
   */
  forEachRight(iteratee?: ObjectIterator<T, any>): ObjectChain<T>;
}

declare interface ObjectChain<T> {
  /**
   * @see _.groupBy
   */
  groupBy(iteratee?: ValueIteratee<T[keyof T]>): ObjectChain<Dictionary<Array<T[keyof T]>>>;
}

declare interface ObjectChain<T> {
  /**
   * @see _.includes
   */
  includes(target: T[keyof T], fromIndex?: number): PrimitiveChain<boolean>;
}

declare interface ObjectChain<T> {
  /**
   * @see _.keyBy
   */
  keyBy(iteratee?: ValueIterateeCustom<T[keyof T], PropertyName>): ObjectChain<Dictionary<T[keyof T]>>;
}

declare interface ObjectChain<T> {
  /**
   * @see _.map
   */
  map<K extends keyof T[keyof T]>(key: K): CollectionChain<T[keyof T][K]>;
  /**
   * @see _.map
   */
  map<TResult>(iteratee: ObjectIterator<T, TResult>): CollectionChain<TResult>;
  /**
   * @see _.map
   */
  map(iteratee: PropertyName): CollectionChain<any>;
  /**
   * @see _.map
   */
  map(iteratee: [PropertyName, any] | object): CollectionChain<boolean>;
  /**
   * @see _.map
   */
  map(): CollectionChain<T[keyof T]>;
}

declare interface ObjectChain<T> {
  /**
   * @see _.orderBy
   */
  orderBy(
    iteratees?: Many<ObjectIterator<T, NotVoid>>,
    orders?: Many<boolean | 'asc' | 'desc'>
  ): CollectionChain<T[keyof T]>;
}

declare interface ObjectChain<T> {
  /**
   * @see _.partition
   */
  partition(callback: ValueIteratee<T[keyof T]>): LoDashExplicitWrapper<[Array<T[keyof T]>, Array<T[keyof T]>]>;
}

declare interface ObjectChain<T> {
  /**
   * @see _.reduce
   */
  reduce<TResult>(callback: MemoObjectIterator<T[keyof T], TResult, T>, accumulator: TResult): ExpChain<TResult>;
  /**
   * @see _.reduce
   */
  reduce(callback: MemoObjectIterator<T[keyof T], T[keyof T], T>): ExpChain<T[keyof T] | undefined>;
}

declare interface ObjectChain<T> {
  /**
   * @see _.reduceRight
   */
  reduceRight<TResult>(callback: MemoObjectIterator<T[keyof T], TResult, T>, accumulator: TResult): ExpChain<TResult>;
  /**
   * @see _.reduceRight
   */
  reduceRight(callback: MemoObjectIterator<T[keyof T], T[keyof T], T>): ExpChain<T[keyof T] | undefined>;
}

declare interface ObjectChain<T> {
  /**
   * @see _.reject
   */
  reject(predicate?: ObjectIterateeCustom<T, boolean>): CollectionChain<T[keyof T]>;
}

declare interface ObjectChain<T> {
  /**
   * @see _.sample
   */
  sample(): ExpChain<T[keyof T] | undefined>;
}

declare interface ObjectChain<T> {
  /**
   * @see _.sampleSize
   */
  sampleSize(n?: number): CollectionChain<T[keyof T]>;
}

declare interface ObjectChain<T> {
  /**
   * @see _.shuffle
   */
  shuffle(): CollectionChain<T[keyof T]>;
}

declare interface ObjectChain<T> {
  /**
   * @see _.some
   */
  some(predicate?: ObjectIterateeCustom<T, boolean>): PrimitiveChain<boolean>;
}

declare interface ObjectChain<T> {
  /**
   * @see _.sortBy
   */
  sortBy(...iteratees: Array<Many<ObjectIteratee<T>>>): CollectionChain<T[keyof T]>;
}

declare interface ObjectChain<T> {
  /**
   * @see _.castArray
   */
  castArray(): CollectionChain<T>;
}

declare interface ObjectChain<T> {
  /**
   * @see _.toArray
   */
  toArray(): CollectionChain<T[keyof T]>;
}

declare interface ObjectChain<T> {
  /**
   * @see _.assign
   */
  assign<TSource>(source: TSource): ObjectChain<T & TSource>;
  /**
   * @see _.assign
   */
  assign<TSource1, TSource2>(source1: TSource1, source2: TSource2): ObjectChain<T & TSource1 & TSource2>;
  /**
   * @see _.assign
   */
  assign<TSource1, TSource2, TSource3>(
    source1: TSource1,
    source2: TSource2,
    source3: TSource3
  ): ObjectChain<T & TSource1 & TSource2 & TSource3>;
  /**
   * @see _.assign
   */
  assign<TSource1, TSource2, TSource3, TSource4>(
    source1: TSource1,
    source2: TSource2,
    source3: TSource3,
    source4: TSource4
  ): ObjectChain<T & TSource1 & TSource2 & TSource3 & TSource4>;
  /**
   * @see _.assign
   */
  assign(): ObjectChain<T>;
  /**
   * @see _.assign
   */
  assign(...otherArgs: any[]): ObjectChain<any>;
}

declare interface ObjectChain<T> {
  /**
   * @see _.assignIn
   */
  assignIn<TSource>(source: TSource): ObjectChain<T & TSource>;
  /**
   * @see _.assignIn
   */
  assignIn<TSource1, TSource2>(source1: TSource1, source2: TSource2): ObjectChain<T & TSource1 & TSource2>;
  /**
   * @see _.assignIn
   */
  assignIn<TSource1, TSource2, TSource3>(
    source1: TSource1,
    source2: TSource2,
    source3: TSource3
  ): ObjectChain<T & TSource1 & TSource2 & TSource3>;
  /**
   * @see _.assignIn
   */
  assignIn<TSource1, TSource2, TSource3, TSource4>(
    source1: TSource1,
    source2: TSource2,
    source3: TSource3,
    source4: TSource4
  ): ObjectChain<T & TSource1 & TSource2 & TSource3 & TSource4>;
  /**
   * @see _.assignIn
   */
  assignIn(): ObjectChain<T>;
  /**
   * @see _.assignIn
   */
  assignIn(...otherArgs: any[]): ObjectChain<any>;
}

declare interface ObjectChain<T> {
  /**
   * @see _.assignInWith
   */
  assignInWith<TSource>(source: TSource, customizer: AssignCustomizer): ObjectChain<T & TSource>;
  /**
   * @see _.assignInWith
   */
  assignInWith<TSource1, TSource2>(
    source1: TSource1,
    source2: TSource2,
    customizer: AssignCustomizer
  ): ObjectChain<T & TSource1 & TSource2>;
  /**
   * @see _.assignInWith
   */
  assignInWith<TSource1, TSource2, TSource3>(
    source1: TSource1,
    source2: TSource2,
    source3: TSource3,
    customizer: AssignCustomizer
  ): ObjectChain<T & TSource1 & TSource2 & TSource3>;
  /**
   * @see _.assignInWith
   */
  assignInWith<TSource1, TSource2, TSource3, TSource4>(
    source1: TSource1,
    source2: TSource2,
    source3: TSource3,
    source4: TSource4,
    customizer: AssignCustomizer
  ): ObjectChain<T & TSource1 & TSource2 & TSource3 & TSource4>;
  /**
   * @see _.assignInWith
   */
  assignInWith(): ObjectChain<T>;
  /**
   * @see _.assignInWith
   */
  assignInWith(...otherArgs: any[]): ObjectChain<any>;
}

declare interface ObjectChain<T> {
  /**
   * @see _.assignWith
   */
  assignWith<TSource>(source: TSource, customizer: AssignCustomizer): ObjectChain<T & TSource>;
  /**
   * @see _.assignWith
   */
  assignWith<TSource1, TSource2>(
    source1: TSource1,
    source2: TSource2,
    customizer: AssignCustomizer
  ): ObjectChain<T & TSource1 & TSource2>;
  /**
   * @see _.assignWith
   */
  assignWith<TSource1, TSource2, TSource3>(
    source1: TSource1,
    source2: TSource2,
    source3: TSource3,
    customizer: AssignCustomizer
  ): ObjectChain<T & TSource1 & TSource2 & TSource3>;
  /**
   * @see _.assignWith
   */
  assignWith<TSource1, TSource2, TSource3, TSource4>(
    source1: TSource1,
    source2: TSource2,
    source3: TSource3,
    source4: TSource4,
    customizer: AssignCustomizer
  ): ObjectChain<T & TSource1 & TSource2 & TSource3 & TSource4>;
  /**
   * @see _.assignWith
   */
  assignWith(): ObjectChain<T>;
  /**
   * @see _.assignWith
   */
  assignWith(...otherArgs: any[]): ObjectChain<any>;
}

declare interface ObjectChain<T> {
  /**
   * @see _.at
   */
  at(...props: Array<Many<keyof T>>): CollectionChain<T[keyof T]>;
}

declare interface ObjectChain<T> {
  /**
   * @see _.create
   */
  create<U extends object>(properties?: U): ObjectChain<T & U>;
}

declare interface ObjectChain<T> {
  /**
   * @see _.defaults
   */
  defaults<TSource>(source: TSource): ObjectChain<NonNullable<TSource & T>>;
  /**
   * @see _.defaults
   */
  defaults<TSource1, TSource2>(source1: TSource1, source2: TSource2): ObjectChain<NonNullable<TSource2 & TSource1 & T>>;
  /**
   * @see _.defaults
   */
  defaults<TSource1, TSource2, TSource3>(
    source1: TSource1,
    source2: TSource2,
    source3: TSource3
  ): ObjectChain<NonNullable<TSource3 & TSource2 & TSource1 & T>>;
  /**
   * @see _.defaults
   */
  defaults<TSource1, TSource2, TSource3, TSource4>(
    source1: TSource1,
    source2: TSource2,
    source3: TSource3,
    source4: TSource4
  ): ObjectChain<NonNullable<TSource4 & TSource3 & TSource2 & TSource1 & T>>;
  /**
   * @see _.defaults
   */
  defaults(): ObjectChain<NonNullable<T>>;
  /**
   * @see _.defaults
   */
  defaults(...sources: any[]): ObjectChain<any>;
}

declare interface ObjectChain<T> {
  /**
   * @see _.defaultsDeep
   */
  defaultsDeep(...sources: any[]): ObjectChain<any>;
}

declare interface ObjectChain<T> {
  /**
   * @see _.entries
   */
  entries(): CollectionChain<[string, T[keyof T]]>;
}

declare interface ObjectChain<T> {
  /**
   * @see _.entriesIn
   */
  entriesIn(): CollectionChain<[string, T[keyof T]]>;
}

declare interface ObjectChain<T> {
  /**
   * @see _.extend
   */
  extend<TSource>(source: TSource): ObjectChain<T & TSource>;
  /**
   * @see _.extend
   */
  extend<TSource1, TSource2>(source1: TSource1, source2: TSource2): ObjectChain<T & TSource1 & TSource2>;
  /**
   * @see _.extend
   */
  extend<TSource1, TSource2, TSource3>(
    source1: TSource1,
    source2: TSource2,
    source3: TSource3
  ): ObjectChain<T & TSource1 & TSource2 & TSource3>;
  /**
   * @see _.extend
   */
  extend<TSource1, TSource2, TSource3, TSource4>(
    source1: TSource1,
    source2: TSource2,
    source3: TSource3,
    source4: TSource4
  ): ObjectChain<T & TSource1 & TSource2 & TSource3 & TSource4>;
  /**
   * @see _.extend
   */
  extend(): ObjectChain<T>;
  /**
   * @see _.extend
   */
  extend(...otherArgs: any[]): ObjectChain<any>;
}

declare interface ObjectChain<T> {
  /**
   * @see _.extendWith
   */
  extendWith<TSource>(source: TSource, customizer: AssignCustomizer): ObjectChain<T & TSource>;
  /**
   * @see _.extendWith
   */
  extendWith<TSource1, TSource2>(
    source1: TSource1,
    source2: TSource2,
    customizer: AssignCustomizer
  ): ObjectChain<T & TSource1 & TSource2>;
  /**
   * @see _.extendWith
   */
  extendWith<TSource1, TSource2, TSource3>(
    source1: TSource1,
    source2: TSource2,
    source3: TSource3,
    customizer: AssignCustomizer
  ): ObjectChain<T & TSource1 & TSource2 & TSource3>;
  /**
   * @see _.extendWith
   */
  extendWith<TSource1, TSource2, TSource3, TSource4>(
    source1: TSource1,
    source2: TSource2,
    source3: TSource3,
    source4: TSource4,
    customizer: AssignCustomizer
  ): ObjectChain<T & TSource1 & TSource2 & TSource3 & TSource4>;
  /**
   * @see _.extendWith
   */
  extendWith(): ObjectChain<T>;
  /**
   * @see _.extendWith
   */
  extendWith(...otherArgs: any[]): ObjectChain<any>;
}

declare interface ObjectChain<T> {
  /**
   * @see _.get
   */
  get<TKey extends keyof T>(path: TKey | [TKey]): ExpChain<T[TKey]>;
  /**
   * @see _.get
   */
  get<TKey extends keyof T>(
    path: TKey | [TKey],
    defaultValue: never[]
  ): T[TKey] extends any[] ? ExpChain<Exclude<T[TKey], undefined>> : ExpChain<Exclude<T[TKey], undefined> | never[]>;
  /**
   * @see _.get
   */
  get<TKey extends keyof T, TDefault>(
    path: TKey | [TKey],
    defaultValue: TDefault
  ): ExpChain<Exclude<T[TKey], undefined> | TDefault>;
  /**
   * @see _.get
   */
  get<TKey1 extends keyof T, TKey2 extends keyof T[TKey1]>(path: [TKey1, TKey2]): ExpChain<T[TKey1][TKey2]>;
  /**
   * @see _.get
   */
  get<TKey1 extends keyof T, TKey2 extends keyof T[TKey1]>(
    path: [TKey1, TKey2],
    defaultValue: never[]
  ): T[TKey1][TKey2] extends any[]
    ? ExpChain<Exclude<T[TKey1][TKey2], undefined>>
    : ExpChain<Exclude<T[TKey1][TKey2], undefined> | never[]>;
  /**
   * @see _.get
   */
  get<TKey1 extends keyof T, TKey2 extends keyof T[TKey1], TDefault>(
    path: [TKey1, TKey2],
    defaultValue: TDefault
  ): ExpChain<Exclude<T[TKey1][TKey2], undefined> | TDefault>;
  /**
   * @see _.get
   */
  get<TKey1 extends keyof T, TKey2 extends keyof T[TKey1], TKey3 extends keyof T[TKey1][TKey2]>(
    path: [TKey1, TKey2, TKey3]
  ): ExpChain<T[TKey1][TKey2][TKey3]>;
  /**
   * @see _.get
   */
  get<TKey1 extends keyof T, TKey2 extends keyof T[TKey1], TKey3 extends keyof T[TKey1][TKey2]>(
    path: [TKey1, TKey2, TKey3],
    defaultValue: never[]
  ): T[TKey1][TKey2][TKey3] extends any[]
    ? ExpChain<Exclude<T[TKey1][TKey2][TKey3], undefined>>
    : ExpChain<Exclude<T[TKey1][TKey2][TKey3], undefined> | never[]>;
  /**
   * @see _.get
   */
  get<TKey1 extends keyof T, TKey2 extends keyof T[TKey1], TKey3 extends keyof T[TKey1][TKey2], TDefault>(
    path: [TKey1, TKey2, TKey3],
    defaultValue: TDefault
  ): ExpChain<Exclude<T[TKey1][TKey2][TKey3], undefined> | TDefault>;
  /**
   * @see _.get
   */
  get<
    TKey1 extends keyof T,
    TKey2 extends keyof T[TKey1],
    TKey3 extends keyof T[TKey1][TKey2],
    TKey4 extends keyof T[TKey1][TKey2][TKey3]
  >(
    path: [TKey1, TKey2, TKey3, TKey4]
  ): ExpChain<T[TKey1][TKey2][TKey3][TKey4]>;
  /**
   * @see _.get
   */
  get<
    TKey1 extends keyof T,
    TKey2 extends keyof T[TKey1],
    TKey3 extends keyof T[TKey1][TKey2],
    TKey4 extends keyof T[TKey1][TKey2][TKey3]
  >(
    path: [TKey1, TKey2, TKey3, TKey4],
    defaultValue: never[]
  ): T[TKey1][TKey2][TKey3][TKey4] extends any[]
    ? ExpChain<Exclude<T[TKey1][TKey2][TKey3][TKey4], undefined>>
    : ExpChain<Exclude<T[TKey1][TKey2][TKey3][TKey4], undefined> | never[]>;
  /**
   * @see _.get
   */
  get<
    TKey1 extends keyof T,
    TKey2 extends keyof T[TKey1],
    TKey3 extends keyof T[TKey1][TKey2],
    TKey4 extends keyof T[TKey1][TKey2][TKey3],
    TDefault
  >(
    path: [TKey1, TKey2, TKey3, TKey4],
    defaultValue: TDefault
  ): ExpChain<Exclude<T[TKey1][TKey2][TKey3][TKey4], undefined> | TDefault>;
  /**
   * @see _.get
   */
  get<TPath extends string>(
    path: TPath
  ): string extends TPath ? LoDashExplicitWrapper<any> : ExpChain<GetFieldType<T, TPath>>;
  /**
   * @see _.get
   */
  get<TPath extends string, TDefault = GetFieldType<T, TPath>>(
    path: TPath,
    defaultValue: TDefault
  ): ExpChain<Exclude<GetFieldType<T, TPath>, null | undefined> | TDefault>;
  /**
   * @see _.get
   */
  get(path: PropertyPath, defaultValue?: any): LoDashExplicitWrapper<any>;
}

declare interface ObjectChain<T> {
  /**
   * @see _.invertBy
   */
  invertBy(iteratee?: ValueIteratee<T[keyof T]>): ObjectChain<Dictionary<string[]>>;
}

declare interface ObjectChain<T> {
  /**
   * @see _.mapKeys
   */
  mapKeys(iteratee?: ObjectIteratee<T>): ObjectChain<Dictionary<T[keyof T]>>;
}

declare interface ObjectChain<T> {
  /**
   * @see _.mapValues
   */
  mapValues<TResult>(callback: ObjectIterator<T, TResult>): ObjectChain<{ [P in keyof T]: TResult }>;
  /**
   * @see _.mapValues
   */
  mapValues<TResult>(callback: DictionaryIterator<T[keyof T], TResult>): ObjectChain<Dictionary<TResult>>;
  /**
   * @see _.mapValues
   */
  mapValues(iteratee: object): ObjectChain<{ [P in keyof T]: boolean }>;
  /**
   * @see _.mapValues
   */
  mapValues<TKey extends keyof T[keyof T]>(iteratee: TKey): ObjectChain<Dictionary<T[keyof T][TKey]>>;
  /**
   * @see _.mapValues
   */
  mapValues(iteratee: string): ObjectChain<{ [P in keyof T]: any }>;
  /**
   * @see _.mapValues
   */
  mapValues(): ObjectChain<T>;
}

declare interface ObjectChain<T> {
  /**
   * @see _.merge
   */
  merge<TSource>(source: TSource): ObjectChain<T & TSource>;
  /**
   * @see _.merge
   */
  merge<TSource1, TSource2>(source1: TSource1, source2: TSource2): ObjectChain<T & TSource1 & TSource2>;
  /**
   * @see _.merge
   */
  merge<TSource1, TSource2, TSource3>(
    source1: TSource1,
    source2: TSource2,
    source3: TSource3
  ): ObjectChain<T & TSource1 & TSource2 & TSource3>;
  /**
   * @see _.merge
   */
  merge<TSource1, TSource2, TSource3, TSource4>(
    source1: TSource1,
    source2: TSource2,
    source3: TSource3,
    source4: TSource4
  ): ObjectChain<T & TSource1 & TSource2 & TSource3 & TSource4>;
  /**
   * @see _.merge
   */
  merge(...otherArgs: any[]): ObjectChain<any>;
}

declare interface ObjectChain<T> {
  /**
   * @see _.mergeWith
   */
  mergeWith<TSource>(source: TSource, customizer: MergeWithCustomizer): ObjectChain<T & TSource>;
  /**
   * @see _.mergeWith
   */
  mergeWith<TSource1, TSource2>(
    source1: TSource1,
    source2: TSource2,
    customizer: MergeWithCustomizer
  ): ObjectChain<T & TSource1 & TSource2>;
  /**
   * @see _.mergeWith
   */
  mergeWith<TSource1, TSource2, TSource3>(
    source1: TSource1,
    source2: TSource2,
    source3: TSource3,
    customizer: MergeWithCustomizer
  ): ObjectChain<T & TSource1 & TSource2 & TSource3>;
  /**
   * @see _.mergeWith
   */
  mergeWith<TSource1, TSource2, TSource3, TSource4>(
    source1: TSource1,
    source2: TSource2,
    source3: TSource3,
    source4: TSource4,
    customizer: MergeWithCustomizer
  ): ObjectChain<T & TSource1 & TSource2 & TSource3 & TSource4>;
  /**
   * @see _.mergeWith
   */
  mergeWith(...otherArgs: any[]): ObjectChain<any>;
}

declare interface ObjectChain<T> {
  /**
   * @see _.omit
   */
  omit<K extends keyof T>(...paths: Array<Many<K>>): ObjectChain<Omit_2<T, K>>;
  /**
   * @see _.omit
   */
  omit(...paths: Array<Many<PropertyName>>): ObjectChain<PartialObject<T>>;
}

declare interface ObjectChain<T> {
  /**
   * @see _.omitBy
   */
  omitBy(predicate: ValueKeyIteratee<T[keyof T]>): ObjectChain<PartialObject<T>>;
}

declare interface ObjectChain<T> {
  /**
   * @see _.pick
   */
  pick<U extends keyof T>(...props: Array<Many<U>>): ObjectChain<Pick<T, U>>;
  /**
   * @see _.pick
   */
  pick(...props: Array<Many<PropertyPath>>): ObjectChain<PartialObject<T>>;
}

declare interface ObjectChain<T> {
  /**
   * @see _.pickBy
   */
  pickBy<S extends T[keyof T]>(
    predicate: ValueKeyIterateeTypeGuard<T[keyof T], S>
  ): ObjectChain<NumericDictionary<unknown> extends T ? NumericDictionary<S> : Dictionary<S>>;
  /**
   * @see _.pickBy
   */
  pickBy(
    predicate?: ValueKeyIteratee<T[keyof T]>
  ): ObjectChain<
    T extends Dictionary<unknown>
      ? Dictionary<T[keyof T]>
      : T extends NumericDictionary<unknown>
        ? NumericDictionary<T[keyof T]>
        : PartialObject<T>
  >;
}

declare interface ObjectChain<T> {
  /**
   * @see _.transform
   */
  transform<TResult>(
    iteratee: MemoVoidDictionaryIterator<T[keyof T], string, TResult>,
    accumulator?: TResult
  ): ExpChain<TResult>;
  /**
   * @see _.transform
   */
  transform<TResult>(
    iteratee: MemoVoidDictionaryIterator<T[keyof T], keyof T, TResult>,
    accumulator?: TResult
  ): ExpChain<TResult>;
  /**
   * @see _.transform
   */
  transform(): ExpChain<T extends Dictionary<unknown> ? Dictionary<any> : T>;
}

declare interface ObjectChain<T> {
  /**
   * @see _.updateWith
   */
  updateWith(path: PropertyPath, updater: (oldValue: any) => any, customizer?: SetWithCustomizer<T>): this;
  /**
   * @see _.updateWith
   */
  updateWith<TResult>(
    path: PropertyPath,
    updater: (oldValue: any) => any,
    customizer?: SetWithCustomizer<T>
  ): ObjectChain<TResult>;
}

declare interface ObjectChain<T> {
  /**
   * @see _.values
   */
  values(): CollectionChain<T[keyof T]>;
}

declare interface ObjectChain<T> {
  /**
   * @see _.valuesIn
   */
  valuesIn(): CollectionChain<T[keyof T]>;
}

declare interface ObjectChain<T> {
  /**
   * @see _.iteratee
   */
  iteratee(): FunctionChain<(o: T) => boolean>;
}

declare type ObjectIteratee<TObject> = ObjectIterator<TObject, NotVoid> | IterateeShorthand<TObject[keyof TObject]>;

declare type ObjectIterateeCustom<TObject, TResult> =
  | ObjectIterator<TObject, TResult>
  | IterateeShorthand<TObject[keyof TObject]>;

declare type ObjectIterator<TObject, TResult> = (
  value: TObject[keyof TObject],
  key: string,
  collection: TObject
) => TResult;

declare type ObjectIteratorTypeGuard<TObject, S extends TObject[keyof TObject]> = (
  value: TObject[keyof TObject],
  key: string,
  collection: TObject
) => value is S;

export declare const omit: (typeof _)['omit'];

declare type Omit_2<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

export declare const omitBy: (typeof _)['omitBy'];

export declare const once: (typeof _)['once'];

export declare const orderBy: (typeof _)['orderBy'];

export declare const over: (typeof _)['over'];

export declare const overArgs: (typeof _)['overArgs'];

export declare const overEvery: (typeof _)['overEvery'];

export declare const overSome: (typeof _)['overSome'];

export declare const pad: (typeof _)['pad'];

export declare const padEnd: (typeof _)['padEnd'];

export declare const padStart: (typeof _)['padStart'];

declare const parseInt_2: (typeof _)['parseInt'];
export { parseInt_2 as parseInt };

export declare const partial: (typeof _)['partial'];

declare type PartialObject<T> = Partial<T>;

declare interface PartialRight {
  <R>(func: Function0<R>): Function0<R>;
  <T1, R>(func: Function1<T1, R>): Function1<T1, R>;
  <T1, R>(func: Function1<T1, R>, arg1: T1): Function0<R>;
  <T1, T2, R>(func: Function2<T1, T2, R>): Function2<T1, T2, R>;
  <T1, T2, R>(func: Function2<T1, T2, R>, arg1: T1, plc2: __): Function1<T2, R>;
  <T1, T2, R>(func: Function2<T1, T2, R>, arg2: T2): Function1<T1, R>;
  <T1, T2, R>(func: Function2<T1, T2, R>, arg1: T1, arg2: T2): Function0<R>;
  <T1, T2, T3, R>(func: Function3<T1, T2, T3, R>): Function3<T1, T2, T3, R>;
  <T1, T2, T3, R>(func: Function3<T1, T2, T3, R>, arg1: T1, plc2: __, plc3: __): Function2<T2, T3, R>;
  <T1, T2, T3, R>(func: Function3<T1, T2, T3, R>, arg2: T2, plc3: __): Function2<T1, T3, R>;
  <T1, T2, T3, R>(func: Function3<T1, T2, T3, R>, arg1: T1, arg2: T2, plc3: __): Function1<T3, R>;
  <T1, T2, T3, R>(func: Function3<T1, T2, T3, R>, arg3: T3): Function2<T1, T2, R>;
  <T1, T2, T3, R>(func: Function3<T1, T2, T3, R>, arg1: T1, plc2: __, arg3: T3): Function1<T2, R>;
  <T1, T2, T3, R>(func: Function3<T1, T2, T3, R>, arg2: T2, arg3: T3): Function1<T1, R>;
  <T1, T2, T3, R>(func: Function3<T1, T2, T3, R>, arg1: T1, arg2: T2, arg3: T3): Function0<R>;
  <T1, T2, T3, T4, R>(func: Function4<T1, T2, T3, T4, R>): Function4<T1, T2, T3, T4, R>;
  <T1, T2, T3, T4, R>(
    func: Function4<T1, T2, T3, T4, R>,
    arg1: T1,
    plc2: __,
    plc3: __,
    plc4: __
  ): Function3<T2, T3, T4, R>;
  <T1, T2, T3, T4, R>(func: Function4<T1, T2, T3, T4, R>, arg2: T2, plc3: __, plc4: __): Function3<T1, T3, T4, R>;
  <T1, T2, T3, T4, R>(func: Function4<T1, T2, T3, T4, R>, arg1: T1, arg2: T2, plc3: __, plc4: __): Function2<T3, T4, R>;
  <T1, T2, T3, T4, R>(func: Function4<T1, T2, T3, T4, R>, arg3: T3, plc4: __): Function3<T1, T2, T4, R>;
  <T1, T2, T3, T4, R>(func: Function4<T1, T2, T3, T4, R>, arg1: T1, plc2: __, arg3: T3, plc4: __): Function2<T2, T4, R>;
  <T1, T2, T3, T4, R>(func: Function4<T1, T2, T3, T4, R>, arg2: T2, arg3: T3, plc4: __): Function2<T1, T4, R>;
  <T1, T2, T3, T4, R>(func: Function4<T1, T2, T3, T4, R>, arg1: T1, arg2: T2, arg3: T3, plc4: __): Function1<T4, R>;
  <T1, T2, T3, T4, R>(func: Function4<T1, T2, T3, T4, R>, arg4: T4): Function3<T1, T2, T3, R>;
  <T1, T2, T3, T4, R>(func: Function4<T1, T2, T3, T4, R>, arg1: T1, plc2: __, plc3: __, arg4: T4): Function2<T2, T3, R>;
  <T1, T2, T3, T4, R>(func: Function4<T1, T2, T3, T4, R>, arg2: T2, plc3: __, arg4: T4): Function2<T1, T3, R>;
  <T1, T2, T3, T4, R>(func: Function4<T1, T2, T3, T4, R>, arg1: T1, arg2: T2, plc3: __, arg4: T4): Function1<T3, R>;
  <T1, T2, T3, T4, R>(func: Function4<T1, T2, T3, T4, R>, arg3: T3, arg4: T4): Function2<T1, T2, R>;
  <T1, T2, T3, T4, R>(func: Function4<T1, T2, T3, T4, R>, arg1: T1, plc2: __, arg3: T3, arg4: T4): Function1<T2, R>;
  <T1, T2, T3, T4, R>(func: Function4<T1, T2, T3, T4, R>, arg2: T2, arg3: T3, arg4: T4): Function1<T1, R>;
  <T1, T2, T3, T4, R>(func: Function4<T1, T2, T3, T4, R>, arg1: T1, arg2: T2, arg3: T3, arg4: T4): Function0<R>;
  (func: (...args: any[]) => any, ...args: any[]): (...args: any[]) => any;
  placeholder: __;
}

export declare const partialRight: (typeof _)['partialRight'];

declare type PartialShallow<T> = {
  [P in keyof T]?: T[P] extends object ? object : T[P];
};

export declare const partition: (typeof _)['partition'];

export declare const pick: (typeof _)['pick'];

export declare const pickBy: (typeof _)['pickBy'];

declare interface Primitive<T> extends LoDashImplicitWrapper<T> {}

declare interface Primitive<T> {
  /**
   * @see _.concat
   */
  concat(...values: Array<Many<T>>): Collection<T>;
}

declare interface Primitive<T> {
  /**
   * @see _.after
   */
  after<TFunc extends (...args: any[]) => any>(func: TFunc): LoDashFunction<TFunc>;
}

declare interface Primitive<T> {
  /**
   * @see _.before
   */
  before<TFunc extends (...args: any[]) => any>(func: TFunc): LoDashFunction<TFunc>;
}

declare interface Primitive<T> {
  /**
   * @see _.castArray
   */
  castArray(): Collection<T>;
}

declare interface Primitive<T> {
  /**
   * @see _.chain
   */
  chain(): PrimitiveChain<T>;
}

declare interface PrimitiveChain<T> extends LoDashExplicitWrapper<T> {}

declare interface PrimitiveChain<T> {
  /**
   * @see _.concat
   */
  concat(...values: Array<Many<T>>): CollectionChain<T>;
}

declare interface PrimitiveChain<T> {
  /**
   * @see _.after
   */
  after<TFunc extends (...args: any[]) => any>(func: TFunc): FunctionChain<TFunc>;
}

declare interface PrimitiveChain<T> {
  /**
   * @see _.before
   */
  before<TFunc extends (...args: any[]) => any>(func: TFunc): FunctionChain<TFunc>;
}

declare interface PrimitiveChain<T> {
  /**
   * @see _.castArray
   */
  castArray(): CollectionChain<T>;
}

export declare const property: (typeof _)['property'];

declare type PropertyName = string | number | symbol;

export declare const propertyOf: (typeof _)['propertyOf'];

declare type PropertyPath = Many<PropertyName>;

export declare const pull: (typeof _)['pull'];

export declare const pullAll: (typeof _)['pullAll'];

export declare const pullAllBy: (typeof _)['pullAllBy'];

export declare const pullAllWith: (typeof _)['pullAllWith'];

export declare const pullAt: (typeof _)['pullAt'];

export declare const random: (typeof _)['random'];

export declare const range: (typeof _)['range'];

export declare const rangeRight: (typeof _)['rangeRight'];

export declare const rearg: (typeof _)['rearg'];

declare interface RecursiveArray<T> extends Array<T | RecursiveArray<T>> {}

export declare const reduce: (typeof _)['reduce'];

export declare const reduceRight: (typeof _)['reduceRight'];

export declare const reject: (typeof _)['reject'];

export declare const remove: (typeof _)['remove'];

export declare const repeat: (typeof _)['repeat'];

export declare const replace: (typeof _)['replace'];

declare type ReplaceFunction = (match: string, ...args: any[]) => string;

export declare const rest: (typeof _)['rest'];

export declare const result: (typeof _)['result'];

export declare const reverse: (typeof _)['reverse'];

declare interface RightCurriedFunction1<T1, R> {
  (): RightCurriedFunction1<T1, R>;
  (t1: T1): R;
}

declare interface RightCurriedFunction2<T1, T2, R> {
  (): RightCurriedFunction2<T1, T2, R>;
  (t2: T2): RightCurriedFunction1<T1, R>;
  (t1: T1, t2: __): RightCurriedFunction1<T2, R>;
  (t1: T1, t2: T2): R;
}

declare interface RightCurriedFunction3<T1, T2, T3, R> {
  (): RightCurriedFunction3<T1, T2, T3, R>;
  (t3: T3): RightCurriedFunction2<T1, T2, R>;
  (t2: T2, t3: __): RightCurriedFunction2<T1, T3, R>;
  (t2: T2, t3: T3): RightCurriedFunction1<T1, R>;
  (t1: T1, t2: __, t3: __): RightCurriedFunction2<T2, T3, R>;
  (t1: T1, t2: T2, t3: __): RightCurriedFunction1<T3, R>;
  (t1: T1, t2: __, t3: T3): RightCurriedFunction1<T2, R>;
  (t1: T1, t2: T2, t3: T3): R;
}

declare interface RightCurriedFunction4<T1, T2, T3, T4, R> {
  (): RightCurriedFunction4<T1, T2, T3, T4, R>;
  (t4: T4): RightCurriedFunction3<T1, T2, T3, R>;
  (t3: T3, t4: __): RightCurriedFunction3<T1, T2, T4, R>;
  (t3: T3, t4: T4): RightCurriedFunction2<T1, T2, R>;
  (t2: T2, t3: __, t4: __): RightCurriedFunction3<T1, T3, T4, R>;
  (t2: T2, t3: T3, t4: __): RightCurriedFunction2<T1, T4, R>;
  (t2: T2, t3: __, t4: T4): RightCurriedFunction2<T1, T3, R>;
  (t2: T2, t3: T3, t4: T4): RightCurriedFunction1<T1, R>;
  (t1: T1, t2: __, t3: __, t4: __): RightCurriedFunction3<T2, T3, T4, R>;
  (t1: T1, t2: T2, t3: __, t4: __): RightCurriedFunction2<T3, T4, R>;
  (t1: T1, t2: __, t3: T3, t4: __): RightCurriedFunction2<T2, T4, R>;
  (t1: T1, t2: __, t3: __, t4: T4): RightCurriedFunction2<T2, T3, R>;
  (t1: T1, t2: T2, t3: T3, t4: __): RightCurriedFunction1<T4, R>;
  (t1: T1, t2: T2, t3: __, t4: T4): RightCurriedFunction1<T3, R>;
  (t1: T1, t2: __, t3: T3, t4: T4): RightCurriedFunction1<T2, R>;
  (t1: T1, t2: T2, t3: T3, t4: T4): R;
}

declare interface RightCurriedFunction5<T1, T2, T3, T4, T5, R> {
  (): RightCurriedFunction5<T1, T2, T3, T4, T5, R>;
  (t5: T5): RightCurriedFunction4<T1, T2, T3, T4, R>;
  (t4: T4, t5: __): RightCurriedFunction4<T1, T2, T3, T5, R>;
  (t4: T4, t5: T5): RightCurriedFunction3<T1, T2, T3, R>;
  (t3: T3, t4: __, t5: __): RightCurriedFunction4<T1, T2, T4, T5, R>;
  (t3: T3, t4: T4, t5: __): RightCurriedFunction3<T1, T2, T5, R>;
  (t3: T3, t4: __, t5: T5): RightCurriedFunction3<T1, T2, T4, R>;
  (t3: T3, t4: T4, t5: T5): RightCurriedFunction2<T1, T2, R>;
  (t2: T2, t3: __, t4: __, t5: __): RightCurriedFunction4<T1, T3, T4, T5, R>;
  (t2: T2, t3: T3, t4: __, t5: __): RightCurriedFunction3<T1, T4, T5, R>;
  (t2: T2, t3: __, t4: T4, t5: __): RightCurriedFunction3<T1, T3, T5, R>;
  (t2: T2, t3: __, t4: __, t5: T5): RightCurriedFunction3<T1, T3, T4, R>;
  (t2: T2, t3: T3, t4: T4, t5: __): RightCurriedFunction2<T1, T5, R>;
  (t2: T2, t3: T3, t4: __, t5: T5): RightCurriedFunction2<T1, T4, R>;
  (t2: T2, t3: __, t4: T4, t5: T5): RightCurriedFunction2<T1, T3, R>;
  (t2: T2, t3: T3, t4: T4, t5: T5): RightCurriedFunction1<T1, R>;
  (t1: T1, t2: __, t3: __, t4: __, t5: __): RightCurriedFunction4<T2, T3, T4, T5, R>;
  (t1: T1, t2: T2, t3: __, t4: __, t5: __): RightCurriedFunction3<T3, T4, T5, R>;
  (t1: T1, t2: __, t3: T3, t4: __, t5: __): RightCurriedFunction3<T2, T4, T5, R>;
  (t1: T1, t2: __, t3: __, t4: T4, t5: __): RightCurriedFunction3<T2, T3, T5, R>;
  (t1: T1, t2: __, t3: __, t4: __, t5: T5): RightCurriedFunction3<T2, T3, T4, R>;
  (t1: T1, t2: T2, t3: T3, t4: __, t5: __): RightCurriedFunction2<T4, T5, R>;
  (t1: T1, t2: T2, t3: __, t4: T4, t5: __): RightCurriedFunction2<T3, T5, R>;
  (t1: T1, t2: T2, t3: __, t4: __, t5: T5): RightCurriedFunction2<T3, T4, R>;
  (t1: T1, t2: __, t3: T3, t4: T4, t5: __): RightCurriedFunction2<T2, T5, R>;
  (t1: T1, t2: __, t3: T3, t4: __, t5: T5): RightCurriedFunction2<T2, T4, R>;
  (t1: T1, t2: __, t3: __, t4: T4, t5: T5): RightCurriedFunction2<T2, T3, R>;
  (t1: T1, t2: T2, t3: T3, t4: T4, t5: __): RightCurriedFunction1<T5, R>;
  (t1: T1, t2: T2, t3: T3, t4: __, t5: T5): RightCurriedFunction1<T4, R>;
  (t1: T1, t2: T2, t3: __, t4: T4, t5: T5): RightCurriedFunction1<T3, R>;
  (t1: T1, t2: __, t3: T3, t4: T4, t5: T5): RightCurriedFunction1<T2, R>;
  (t1: T1, t2: T2, t3: T3, t4: T4, t5: T5): R;
}

export declare const round: (typeof _)['round'];

export declare const sample: (typeof _)['sample'];

export declare const sampleSize: (typeof _)['sampleSize'];

export declare const set: (typeof _)['set'];

export declare const setWith: (typeof _)['setWith'];

declare type SetWithCustomizer<T> = (nsValue: any, key: string, nsObject: T) => any;

export declare const shuffle: (typeof _)['shuffle'];

export declare const size: (typeof _)['size'];

export declare const slice: (typeof _)['slice'];

export declare const snakeCase: (typeof _)['snakeCase'];

export declare const some: (typeof _)['some'];

export declare const sortBy: (typeof _)['sortBy'];

export declare const sortedIndex: (typeof _)['sortedIndex'];

export declare const sortedIndexBy: (typeof _)['sortedIndexBy'];

export declare const sortedIndexOf: (typeof _)['sortedIndexOf'];

export declare const sortedLastIndex: (typeof _)['sortedLastIndex'];

export declare const sortedLastIndexBy: (typeof _)['sortedLastIndexBy'];

export declare const sortedLastIndexOf: (typeof _)['sortedLastIndexOf'];

export declare const sortedUniq: (typeof _)['sortedUniq'];

export declare const sortedUniqBy: (typeof _)['sortedUniqBy'];

export declare const split: (typeof _)['split'];

export declare const spread: (typeof _)['spread'];

export declare const startCase: (typeof _)['startCase'];

export declare const startsWith: (typeof _)['startsWith'];

declare interface String_2 extends LoDashImplicitWrapper<string> {}

declare interface String_2 {
  /**
   * @see _.first
   */
  first(): string | undefined;
}

declare interface String_2 {
  /**
   * @see _.flatten
   */
  flatten(): Collection<string>;
}

declare interface String_2 {
  /**
   * @see _.head
   */
  head(): string | undefined;
}

declare interface String_2 {
  /**
   * @see _.join
   */
  join(separator?: string): string;
}

declare interface String_2 {
  /**
   * @see _.last
   */
  last(): string | undefined;
}

declare interface String_2 {
  /**
   * @see _.countBy
   */
  countBy(iteratee?: ValueIteratee<string>): Object_2<Dictionary<number>>;
}

declare interface String_2 {
  /**
   * @see _.each
   */
  each: String_2['forEach'];
}

declare interface String_2 {
  /**
   * @see _.eachRight
   */
  eachRight: String_2['forEachRight'];
}

declare interface String_2 {
  /**
   * @see _.filter
   */
  filter(predicate?: StringIterator<boolean>): Collection<string>;
}

declare interface String_2 {
  /**
   * @see _.flatMap
   */
  flatMap<TResult>(iteratee: StringIterator<Many<TResult>>): Collection<TResult>;
  /**
   * @see _.flatMap
   */
  flatMap(): Collection<string>;
}

declare interface String_2 {
  /**
   * @see _.flatMapDeep
   */
  flatMapDeep<TResult>(iteratee: StringIterator<ListOfRecursiveArraysOrValues<TResult> | TResult>): Collection<TResult>;
  /**
   * @see _.flatMapDeep
   */
  flatMapDeep(): Collection<string>;
}

declare interface String_2 {
  /**
   * @see _.flatMapDepth
   */
  flatMapDepth<TResult>(
    iteratee: StringIterator<ListOfRecursiveArraysOrValues<TResult> | TResult>,
    depth?: number
  ): Collection<TResult>;
  /**
   * @see _.flatMapDepth
   */
  flatMapDepth(depth?: number): Collection<string>;
}

declare interface String_2 {
  /**
   * @see _.forEach
   */
  forEach(iteratee?: StringIterator<any>): String_2;
}

declare interface String_2 {
  /**
   * @see _.forEachRight
   */
  forEachRight(iteratee?: StringIterator<any>): String_2;
}

declare interface String_2 {
  /**
   * @see _.groupBy
   */
  groupBy(iteratee?: ValueIteratee<string>): Object_2<Dictionary<string[]>>;
}

declare interface String_2 {
  /**
   * @see _.includes
   */
  includes(target: string, fromIndex?: number): boolean;
}

declare interface String_2 {
  /**
   * @see _.keyBy
   */
  keyBy(iteratee?: ValueIterateeCustom<string, PropertyName>): Object_2<Dictionary<string>>;
}

declare interface String_2 {
  /**
   * @see _.map
   */
  map<TResult>(iteratee: StringIterator<TResult>): Collection<TResult>;
  /**
   * @see _.map
   */
  map(): Collection<string>;
}

declare interface String_2 {
  /**
   * @see _.partition
   */
  partition(callback: StringIterator<NotVoid>): LoDashImplicitWrapper<[string[], string[]]>;
}

declare interface String_2 {
  /**
   * @see _.reject
   */
  reject(predicate?: StringIterator<boolean>): Collection<string>;
}

declare interface String_2 {
  /**
   * @see _.sample
   */
  sample(): string | undefined;
}

declare interface String_2 {
  /**
   * @see _.sampleSize
   */
  sampleSize(n?: number): Collection<string>;
}

declare interface String_2 {
  /**
   * @see _.shuffle
   */
  shuffle(): Collection<string>;
}

declare interface String_2 {
  /**
   * @see _.castArray
   */
  castArray(): Collection<string>;
}

declare interface String_2 {
  /**
   * @see _.toArray
   */
  toArray(): Collection<string>;
}

declare interface String_2 {
  /**
   * @see _.get
   */
  get(path: number | number[]): string;
  /**
   * @see _.get
   */
  get(path: number | number[], defaultValue: string): string;
}

declare interface String_2 {
  /**
   * @see _.invertBy
   */
  invertBy(iteratee?: ValueIteratee<string>): Object_2<Dictionary<string[]>>;
}

declare interface String_2 {
  /**
   * @see _.mapValues
   */
  mapValues<TResult>(callback: StringIterator<TResult>): Object_2<NumericDictionary<TResult>>;
  /**
   * @see _.mapValues
   */
  mapValues(): Object_2<NumericDictionary<string>>;
}

declare interface String_2 {
  /**
   * @see _.values
   */
  values(): Collection<string>;
}

declare interface String_2 {
  /**
   * @see _.valuesIn
   */
  valuesIn(): Collection<string>;
}

declare interface String_2 {
  /**
   * @see _.chain
   */
  chain(): StringChain;
}

declare interface String_2 {
  /**
   * @see _.iteratee
   */
  iteratee(): LoDashFunction<(o: object) => any>;
}

declare interface StringChain extends LoDashExplicitWrapper<string> {}

declare interface StringChain {
  /**
   * @see _.first
   */
  first(): StringNullableChain;
}

declare interface StringChain {
  /**
   * @see _.flatten
   */
  flatten(): CollectionChain<string>;
}

declare interface StringChain {
  /**
   * @see _.head
   */
  head(): StringNullableChain;
}

declare interface StringChain {
  /**
   * @see _.join
   */
  join(separator?: string): StringChain;
}

declare interface StringChain {
  /**
   * @see _.last
   */
  last(): StringNullableChain;
}

declare interface StringChain {
  /**
   * @see _.countBy
   */
  countBy(iteratee?: ValueIteratee<string>): ObjectChain<Dictionary<number>>;
}

declare interface StringChain {
  /**
   * @see _.each
   */
  each: StringChain['forEach'];
}

declare interface StringChain {
  /**
   * @see _.eachRight
   */
  eachRight: StringChain['forEachRight'];
}

declare interface StringChain {
  /**
   * @see _.filter
   */
  filter(predicate?: StringIterator<boolean>): CollectionChain<string>;
}

declare interface StringChain {
  /**
   * @see _.flatMap
   */
  flatMap<TResult>(iteratee: StringIterator<Many<TResult>>): CollectionChain<TResult>;
  /**
   * @see _.flatMap
   */
  flatMap(): CollectionChain<string>;
}

declare interface StringChain {
  /**
   * @see _.flatMapDeep
   */
  flatMapDeep<TResult>(
    iteratee: StringIterator<ListOfRecursiveArraysOrValues<TResult> | TResult>
  ): CollectionChain<TResult>;
  /**
   * @see _.flatMapDeep
   */
  flatMapDeep(): CollectionChain<string>;
}

declare interface StringChain {
  /**
   * @see _.flatMapDepth
   */
  flatMapDepth<TResult>(
    iteratee: StringIterator<ListOfRecursiveArraysOrValues<TResult> | TResult>,
    depth?: number
  ): CollectionChain<TResult>;
  /**
   * @see _.flatMapDepth
   */
  flatMapDepth(depth?: number): CollectionChain<string>;
}

declare interface StringChain {
  /**
   * @see _.forEach
   */
  forEach(iteratee?: StringIterator<any>): StringChain;
}

declare interface StringChain {
  /**
   * @see _.forEachRight
   */
  forEachRight(iteratee?: StringIterator<any>): StringChain;
}

declare interface StringChain {
  /**
   * @see _.groupBy
   */
  groupBy(iteratee?: ValueIteratee<string>): ObjectChain<Dictionary<string[]>>;
}

declare interface StringChain {
  /**
   * @see _.includes
   */
  includes(target: string, fromIndex?: number): PrimitiveChain<boolean>;
}

declare interface StringChain {
  /**
   * @see _.keyBy
   */
  keyBy(iteratee?: ValueIterateeCustom<string, PropertyName>): ObjectChain<Dictionary<string>>;
}

declare interface StringChain {
  /**
   * @see _.map
   */
  map<TResult>(iteratee: StringIterator<TResult>): CollectionChain<TResult>;
  /**
   * @see _.map
   */
  map(): CollectionChain<string>;
}

declare interface StringChain {
  /**
   * @see _.partition
   */
  partition(callback: StringIterator<NotVoid>): LoDashExplicitWrapper<[string[], string[]]>;
}

declare interface StringChain {
  /**
   * @see _.reject
   */
  reject(predicate?: StringIterator<boolean>): CollectionChain<string>;
}

declare interface StringChain {
  /**
   * @see _.sample
   */
  sample(): StringNullableChain;
}

declare interface StringChain {
  /**
   * @see _.sampleSize
   */
  sampleSize(n?: number): CollectionChain<string>;
}

declare interface StringChain {
  /**
   * @see _.shuffle
   */
  shuffle(): CollectionChain<string>;
}

declare interface StringChain {
  /**
   * @see _.castArray
   */
  castArray(): CollectionChain<string>;
}

declare interface StringChain {
  /**
   * @see _.toArray
   */
  toArray(): CollectionChain<string>;
}

declare interface StringChain {
  /**
   * @see _.get
   */
  get(path: number | number[]): StringChain;
  /**
   * @see _.get
   */
  get(path: number | number[], defaultValue: string): StringChain;
}

declare interface StringChain {
  /**
   * @see _.invertBy
   */
  invertBy(iteratee?: ValueIteratee<string>): ObjectChain<Dictionary<string[]>>;
}

declare interface StringChain {
  /**
   * @see _.mapValues
   */
  mapValues<TResult>(callback: StringIterator<TResult>): ObjectChain<NumericDictionary<TResult>>;
  /**
   * @see _.mapValues
   */
  mapValues(): ObjectChain<NumericDictionary<string>>;
}

declare interface StringChain {
  /**
   * @see _.values
   */
  values(): CollectionChain<string>;
}

declare interface StringChain {
  /**
   * @see _.valuesIn
   */
  valuesIn(): CollectionChain<string>;
}

declare interface StringChain {
  /**
   * @see _.iteratee
   */
  iteratee(): FunctionChain<(o: object) => any>;
}

declare type StringIterator<TResult> = (char: string, index: number, string: string) => TResult;

declare interface StringNullableChain extends LoDashExplicitWrapper<string | undefined> {}

declare interface StringNullableChain {
  /**
   * @see _.first
   */
  first(): StringNullableChain;
}

declare interface StringNullableChain {
  /**
   * @see _.flatten
   */
  flatten(): CollectionChain<string>;
}

declare interface StringNullableChain {
  /**
   * @see _.head
   */
  head(): StringNullableChain;
}

declare interface StringNullableChain {
  /**
   * @see _.join
   */
  join(separator?: string): StringChain;
}

declare interface StringNullableChain {
  /**
   * @see _.last
   */
  last(): StringNullableChain;
}

declare interface StringNullableChain {
  /**
   * @see _.countBy
   */
  countBy(iteratee?: ValueIteratee<string>): ObjectChain<Dictionary<number>>;
}

declare interface StringNullableChain {
  /**
   * @see _.each
   */
  each: StringNullableChain['forEach'];
}

declare interface StringNullableChain {
  /**
   * @see _.eachRight
   */
  eachRight: StringNullableChain['forEachRight'];
}

declare interface StringNullableChain {
  /**
   * @see _.filter
   */
  filter(predicate?: StringIterator<boolean>): CollectionChain<string>;
}

declare interface StringNullableChain {
  /**
   * @see _.flatMap
   */
  flatMap<TResult>(iteratee: StringIterator<Many<TResult>>): CollectionChain<TResult>;
  /**
   * @see _.flatMap
   */
  flatMap(): CollectionChain<string>;
}

declare interface StringNullableChain {
  /**
   * @see _.flatMapDeep
   */
  flatMapDeep<TResult>(
    iteratee: StringIterator<ListOfRecursiveArraysOrValues<TResult> | TResult>
  ): CollectionChain<TResult>;
  /**
   * @see _.flatMapDeep
   */
  flatMapDeep(): CollectionChain<string>;
}

declare interface StringNullableChain {
  /**
   * @see _.flatMapDepth
   */
  flatMapDepth<TResult>(
    iteratee: StringIterator<ListOfRecursiveArraysOrValues<TResult> | TResult>,
    depth?: number
  ): CollectionChain<TResult>;
  /**
   * @see _.flatMapDepth
   */
  flatMapDepth(depth?: number): CollectionChain<string>;
}

declare interface StringNullableChain {
  /**
   * @see _.forEach
   */
  forEach(iteratee?: StringIterator<any>): StringNullableChain;
}

declare interface StringNullableChain {
  /**
   * @see _.forEachRight
   */
  forEachRight(iteratee?: StringIterator<any>): StringNullableChain;
}

declare interface StringNullableChain {
  /**
   * @see _.groupBy
   */
  groupBy(iteratee?: ValueIteratee<string>): ObjectChain<Dictionary<string[]>>;
}

declare interface StringNullableChain {
  /**
   * @see _.keyBy
   */
  keyBy(iteratee?: ValueIterateeCustom<string, PropertyName>): ObjectChain<Dictionary<string>>;
}

declare interface StringNullableChain {
  /**
   * @see _.map
   */
  map<TResult>(iteratee: StringIterator<TResult>): CollectionChain<TResult>;
  /**
   * @see _.map
   */
  map(): CollectionChain<string>;
}

declare interface StringNullableChain {
  /**
   * @see _.partition
   */
  partition(callback: StringIterator<NotVoid>): LoDashExplicitWrapper<[string[], string[]]>;
}

declare interface StringNullableChain {
  /**
   * @see _.reject
   */
  reject(predicate?: StringIterator<boolean>): CollectionChain<string>;
}

declare interface StringNullableChain {
  /**
   * @see _.sample
   */
  sample(): StringNullableChain;
}

declare interface StringNullableChain {
  /**
   * @see _.sampleSize
   */
  sampleSize(n?: number): CollectionChain<string>;
}

declare interface StringNullableChain {
  /**
   * @see _.shuffle
   */
  shuffle(): CollectionChain<string>;
}

declare interface StringNullableChain {
  /**
   * @see _.castArray
   */
  castArray(): CollectionChain<string | undefined>;
}

declare interface StringNullableChain {
  /**
   * @see _.toArray
   */
  toArray(): CollectionChain<string>;
}

declare interface StringNullableChain {
  /**
   * @see _.get
   */
  get(path: number | number[]): StringNullableChain;
  /**
   * @see _.get
   */
  get(path: number | number[], defaultValue: string): StringChain;
}

declare interface StringNullableChain {
  /**
   * @see _.invertBy
   */
  invertBy(iteratee?: ValueIteratee<string>): ObjectChain<Dictionary<string[]>>;
}

declare interface StringNullableChain {
  /**
   * @see _.mapValues
   */
  mapValues<TResult>(callback: StringIterator<TResult>): ObjectChain<NumericDictionary<TResult>>;
  /**
   * @see _.mapValues
   */
  mapValues(): ObjectChain<NumericDictionary<string>>;
}

declare interface StringNullableChain {
  /**
   * @see _.values
   */
  values(): CollectionChain<string>;
}

declare interface StringNullableChain {
  /**
   * @see _.valuesIn
   */
  valuesIn(): CollectionChain<string>;
}

declare interface StringNullableChain {
  /**
   * @see _.iteratee
   */
  iteratee(): FunctionChain<(o: object) => any>;
}

export declare const stubArray: (typeof _)['stubArray'];

export declare const stubFalse: (typeof _)['stubFalse'];

export declare const stubObject: (typeof _)['stubObject'];

export declare const stubString: (typeof _)['stubString'];

export declare const stubTrue: (typeof _)['stubTrue'];

export declare const subtract: (typeof _)['subtract'];

export declare const sum: (typeof _)['sum'];

export declare const sumBy: (typeof _)['sumBy'];

export declare const tail: (typeof _)['tail'];

export declare const take: (typeof _)['take'];

export declare const takeRight: (typeof _)['takeRight'];

export declare const takeRightWhile: (typeof _)['takeRightWhile'];

export declare const takeWhile: (typeof _)['takeWhile'];

export declare const tap: (typeof _)['tap'];

export declare const template: (typeof _)['template'];

declare interface TemplateExecutor {
  (data?: object): string;
  /**
   * @see _.source
   */
  source: string;
}

declare interface TemplateOptions extends TemplateSettings {
  /**
   * @see _.sourceURL
   */
  sourceURL?: string | undefined;
}

/**
 * By default, the template delimiters used by Lo-Dash are similar to those in embedded Ruby
 * (ERB). Change the following template settings to use alternative delimiters.
 **/
declare interface TemplateSettings {
  /**
   * The "escape" delimiter.
   **/
  escape?: RegExp | undefined;
  /**
   * The "evaluate" delimiter.
   **/
  evaluate?: RegExp | undefined;
  /**
   * An object to import into the template as local variables.
   */
  imports?: Dictionary<any> | undefined;
  /**
   * The "interpolate" delimiter.
   */
  interpolate?: RegExp | undefined;
  /**
   * Used to reference the data object in the template text.
   */
  variable?: string | undefined;
}

export declare const templateSettings: (typeof _)['templateSettings'];

export declare const throttle: (typeof _)['throttle'];

declare interface ThrottleSettings {
  /**
   * @see _.leading
   */
  leading?: boolean | undefined;
  /**
   * @see _.trailing
   */
  trailing?: boolean | undefined;
}

export declare const thru: (typeof _)['thru'];

export declare const times: (typeof _)['times'];

export declare const toArray: (typeof _)['toArray'];

export declare const toFinite: (typeof _)['toFinite'];

export declare const toInteger: (typeof _)['toInteger'];

export declare const toLength: (typeof _)['toLength'];

export declare const toLower: (typeof _)['toLower'];

export declare const toNumber: (typeof _)['toNumber'];

export declare const toPairs: (typeof _)['toPairs'];

export declare const toPairsIn: (typeof _)['toPairsIn'];

export declare const toPath: (typeof _)['toPath'];

export declare const toPlainObject: (typeof _)['toPlainObject'];

export declare const toSafeInteger: (typeof _)['toSafeInteger'];

declare const toString_2: (typeof _)['toString'];
export { toString_2 as toString };

export declare const toUpper: (typeof _)['toUpper'];

export declare const transform: (typeof _)['transform'];

export declare const trim: (typeof _)['trim'];

export declare const trimEnd: (typeof _)['trimEnd'];

export declare const trimStart: (typeof _)['trimStart'];

export declare const truncate: (typeof _)['truncate'];

declare interface TruncateOptions {
  /**
   * @see _.length
   */
  length?: number | undefined;
  /**
   * @see _.omission
   */
  omission?: string | undefined;
  /**
   * @see _.separator
   */
  separator?: string | RegExp | undefined;
}

declare type Truthy<T> = T extends Falsey ? never : T;

export declare const unary: (typeof _)['unary'];

declare const unescape_2: (typeof _)['unescape'];
export { unescape_2 as unescape };

export declare const union: (typeof _)['union'];

export declare const unionBy: (typeof _)['unionBy'];

export declare const unionWith: (typeof _)['unionWith'];

export declare const uniq: (typeof _)['uniq'];

export declare const uniqBy: (typeof _)['uniqBy'];

export declare const uniqueId: (typeof _)['uniqueId'];

export declare const uniqWith: (typeof _)['uniqWith'];

export declare const unset: (typeof _)['unset'];

export declare const unzip: (typeof _)['unzip'];

export declare const unzipWith: (typeof _)['unzipWith'];

export declare const update: (typeof _)['update'];

export declare const updateWith: (typeof _)['updateWith'];

export declare const upperCase: (typeof _)['upperCase'];

export declare const upperFirst: (typeof _)['upperFirst'];

declare type ValueIteratee<T> = ((value: T) => NotVoid) | IterateeShorthand<T>;

declare type ValueIterateeCustom<T, TResult> = ((value: T) => TResult) | IterateeShorthand<T>;

declare type ValueIteratorTypeGuard<T, S extends T> = (value: T) => value is S;

declare type ValueKeyIteratee<T> = ((value: T, key: string) => NotVoid) | IterateeShorthand<T>;

declare type ValueKeyIterateeTypeGuard<T, S extends T> = (value: T, key: string) => value is S;

export declare const values: (typeof _)['values'];

export declare const valuesIn: (typeof _)['valuesIn'];

export declare const without: (typeof _)['without'];

export declare const words: (typeof _)['words'];

export declare const wrap: (typeof _)['wrap'];

export declare const xor: (typeof _)['xor'];

export declare const xorBy: (typeof _)['xorBy'];

export declare const xorWith: (typeof _)['xorWith'];

export declare const zip: (typeof _)['zip'];

export declare const zipObject: (typeof _)['zipObject'];

export declare const zipObjectDeep: (typeof _)['zipObjectDeep'];

export declare const zipWith: (typeof _)['zipWith'];
