export declare function addIssueToContext(ctx: ParseContext, issueData: IssueData): void;

declare type allKeys<T> = T extends any ? keyof T : never;

export declare const any: (params?: RawCreateParams) => ZodAny;

export declare type AnyZodObject = ZodObject<any, any, any>;

export declare type AnyZodTuple = ZodTuple<[ZodTypeAny, ...ZodTypeAny[]] | [], ZodTypeAny | null>;

export declare const array: <El extends ZodTypeAny>(schema: El, params?: RawCreateParams) => ZodArray<El>;

export declare type ArrayCardinality = 'many' | 'atleastone';

export declare type ArrayKeys = keyof any[];

export declare type arrayOutputType<
  T extends ZodTypeAny,
  Cardinality extends ArrayCardinality = 'many'
> = Cardinality extends 'atleastone' ? [T['_output'], ...T['_output'][]] : T['_output'][];

export declare type AssertArray<T> = T extends any[] ? T : never;

export declare type AsyncParseReturnType<T> = Promise<SyncParseReturnType<T>>;

export declare type baseObjectInputType<Shape extends ZodRawShape> = objectUtil.addQuestionMarks<{
  [k in keyof Shape]: Shape[k]['_input'];
}>;

export declare type baseObjectOutputType<Shape extends ZodRawShape> = {
  [k in keyof Shape]: Shape[k]['_output'];
};

export declare const bigint: (
  params?: RawCreateParams & {
    coerce?: boolean;
  }
) => ZodBigInt;

export declare const boolean: (
  params?: RawCreateParams & {
    coerce?: boolean;
  }
) => ZodBoolean;

export declare const BRAND: unique symbol;

export declare type BRAND<T extends string | number | symbol> = {
  [BRAND]: {
    [k in T]: true;
  };
};

declare type BuiltIn =
  | (((...args: any[]) => any) | (new (...args: any[]) => any))
  | {
      readonly [Symbol.toStringTag]: string;
    }
  | Date
  | Error
  | Generator
  | Promise<unknown>
  | RegExp;

export declare type CatchallInput<T extends ZodType> = ZodType extends T
  ? unknown
  : {
      [k: string]: T['_input'];
    };

export declare type CatchallOutput<T extends ZodType> = ZodType extends T
  ? unknown
  : {
      [k: string]: T['_output'];
    };

declare abstract class Class {
  constructor(..._: any[]);
}

export declare const coerce: {
  string: (typeof ZodString)['create'];
  number: (typeof ZodNumber)['create'];
  boolean: (typeof ZodBoolean)['create'];
  bigint: (typeof ZodBigInt)['create'];
  date: (typeof ZodDate)['create'];
};

declare function createZodEnum<U extends string, T extends Readonly<[U, ...U[]]>>(
  values: T,
  params?: RawCreateParams
): ZodEnum<Writeable<T>>;

declare function createZodEnum<U extends string, T extends [U, ...U[]]>(
  values: T,
  params?: RawCreateParams
): ZodEnum<T>;

export declare function custom<T>(
  check?: (data: any) => any,
  _params?: string | CustomParams | ((input: any) => CustomParams),
  /**
   * @deprecated
   *
   * Pass `fatal` into the params object instead:
   *
   * ```ts
   * z.string().custom((val) => val.length > 5, { fatal: false })
   * ```
   *
   */
  fatal?: boolean
): ZodType<T, ZodTypeDef, T>;

export declare type CustomErrorParams = Partial<util.Omit<ZodCustomIssue, 'code'>>;

declare type CustomParams = CustomErrorParams & {
  fatal?: boolean;
};

export declare const date: (
  params?: RawCreateParams & {
    coerce?: boolean;
  }
) => ZodDate;

export declare function datetimeRegex(args: { precision?: number | null; offset?: boolean; local?: boolean }): RegExp;

export declare const defaultErrorMap: ZodErrorMap;

export declare type DenormalizedError = {
  [k: string]: DenormalizedError | string[];
};

export declare type deoptional<T extends ZodTypeAny> =
  T extends ZodOptional<infer U> ? deoptional<U> : T extends ZodNullable<infer U> ? ZodNullable<deoptional<U>> : T;

export declare type DIRTY<T> = {
  status: 'dirty';
  value: T;
};

export declare const DIRTY: <T>(value: T) => DIRTY<T>;

export declare const discriminatedUnion: typeof ZodDiscriminatedUnion.create;

export declare type Effect<T> = RefinementEffect<T> | TransformEffect<T> | PreprocessEffect<T>;

declare const effectsType: <I extends ZodTypeAny>(
  schema: I,
  effect: Effect<I['_output']>,
  params?: RawCreateParams
) => ZodEffects<I, I['_output']>;
export { effectsType as effect };
export { effectsType as transformer };

export declare const EMPTY_PATH: ParsePath;

declare const enumType: typeof createZodEnum;

export { enumType as enum };

export declare type EnumLike = {
  [k: string]: string | number;
  [nu: number]: string;
};

declare namespace enumUtil {
  type UnionToIntersectionFn<T> = (T extends unknown ? (k: () => T) => void : never) extends (
    k: infer Intersection
  ) => void
    ? Intersection
    : never;
  type GetUnionLast<T> = UnionToIntersectionFn<T> extends () => infer Last ? Last : never;
  type UnionToTuple<T, Tuple extends unknown[] = []> = [T] extends [never]
    ? Tuple
    : UnionToTuple<Exclude<T, GetUnionLast<T>>, [GetUnionLast<T>, ...Tuple]>;
  type CastToStringTuple<T> = T extends [string, ...string[]] ? T : never;
  type UnionToTupleString<T> = CastToStringTuple<UnionToTuple<T>>;
}

export declare type EnumValues<T extends string = string> = readonly [T, ...T[]];

export declare type ErrorMapCtx = {
  defaultError: string;
  data: any;
};

declare namespace errorUtil {
  type ErrMessage =
    | string
    | {
        message?: string | undefined;
      };
  const errToObj: (message?: ErrMessage) => {
    message?: string | undefined;
  };
  const toString: (message?: ErrMessage) => string | undefined;
}

export declare type FilterEnum<Values, ToExclude> = Values extends []
  ? []
  : Values extends [infer Head, ...infer Rest]
    ? Head extends ToExclude
      ? FilterEnum<Rest, ToExclude>
      : [Head, ...FilterEnum<Rest, ToExclude>]
    : never;

declare const functionType: typeof ZodFunction.create;

export { functionType as function };

export declare function getErrorMap(): ZodErrorMap;

export declare const getParsedType: (data: any) => ZodParsedType;

export declare type Indices<T> = Exclude<keyof T, ArrayKeys>;

export declare type inferFlattenedErrors<T extends ZodType<any, any, any>, U = string> = typeToFlattenedError<
  TypeOf<T>,
  U
>;

export declare type inferFormattedError<T extends ZodType<any, any, any>, U = string> = ZodFormattedError<TypeOf<T>, U>;

export declare type InnerTypeOfFunction<Args extends ZodTuple<any, any>, Returns extends ZodTypeAny> =
  Args['_output'] extends Array<any> ? (...args: Args['_output']) => Returns['_input'] : never;

export declare type input<T extends ZodType<any, any, any>> = T['_input'];

export declare type InputTypeOfTuple<T extends ZodTupleItems | []> = AssertArray<{
  [k in keyof T]: T[k] extends ZodType<any, any, any> ? T[k]['_input'] : never;
}>;

export declare type InputTypeOfTupleWithRest<
  T extends ZodTupleItems | [],
  Rest extends ZodTypeAny | null = null
> = Rest extends ZodTypeAny ? [...InputTypeOfTuple<T>, ...Rest['_input'][]] : InputTypeOfTuple<T>;

declare const instanceofType: <T extends typeof Class>(
  cls: T,
  params?: CustomParams
) => ZodType<InstanceType<T>, ZodTypeDef, InstanceType<T>>;

export { instanceofType as instanceof };

export declare const intersection: <TSchema extends ZodTypeAny, USchema extends ZodTypeAny>(
  left: TSchema,
  right: USchema,
  params?: RawCreateParams
) => ZodIntersection<TSchema, USchema>;

export declare type INVALID = {
  status: 'aborted';
};

export declare const INVALID: INVALID;

export declare type IpVersion = 'v4' | 'v6';

export declare const isAborted: (x: ParseReturnType<any>) => x is INVALID;

export declare const isAsync: <T>(x: ParseReturnType<T>) => x is AsyncParseReturnType<T>;

export declare const isDirty: <T>(x: ParseReturnType<T>) => x is OK<T> | DIRTY<T>;

export declare type IssueData = stripPath<ZodIssueOptionalMessage> & {
  path?: (string | number)[];
  fatal?: boolean | undefined;
};

export declare const isValid: <T>(x: ParseReturnType<T>) => x is OK<T>;

export declare type KeySchema = ZodType<string | number | symbol, any, any>;

export declare const late: {
  object: <Shape extends ZodRawShape>(shape: () => Shape, params?: RawCreateParams) => ZodObject<Shape, 'strip'>;
};

export declare const lazy: <Inner extends ZodTypeAny>(getter: () => Inner, params?: RawCreateParams) => ZodLazy<Inner>;

export declare const literal: <Value extends Primitive>(value: Value, params?: RawCreateParams) => ZodLiteral<Value>;

export declare const makeIssue: (params: {
  data: any;
  path: (string | number)[];
  errorMaps: ZodErrorMap[];
  issueData: IssueData;
}) => ZodIssue;

declare type MakeReadonly<T> =
  T extends Map<infer K, infer V>
    ? ReadonlyMap<K, V>
    : T extends Set<infer V>
      ? ReadonlySet<V>
      : T extends [infer Head, ...infer Tail]
        ? readonly [Head, ...Tail]
        : T extends Array<infer V>
          ? ReadonlyArray<V>
          : T extends BuiltIn
            ? T
            : Readonly<T>;

export declare const map: <KeySchema extends ZodTypeAny = ZodTypeAny, ValueSchema extends ZodTypeAny = ZodTypeAny>(
  keyType: KeySchema,
  valueType: ValueSchema,
  params?: RawCreateParams
) => ZodMap<KeySchema, ValueSchema>;

export declare type mergeTypes<A, B> = {
  [k in keyof A | keyof B]: k extends keyof B ? B[k] : k extends keyof A ? A[k] : never;
};

export declare const nan: (params?: RawCreateParams) => ZodNaN;

export declare const nativeEnum: <Elements extends EnumLike>(
  values: Elements,
  params?: RawCreateParams
) => ZodNativeEnum<Elements>;

export declare const NEVER: never;

export declare const never: (params?: RawCreateParams) => ZodNever;

export declare type noUnrecognized<Obj extends object, Shape extends object> = {
  [k in keyof Obj]: k extends keyof Shape ? Obj[k] : never;
};

declare const nullType: (params?: RawCreateParams) => ZodNull;

export { nullType as null };

export declare const nullable: <Inner extends ZodTypeAny>(type: Inner, params?: RawCreateParams) => ZodNullable<Inner>;

export declare const number: (
  params?: RawCreateParams & {
    coerce?: boolean;
  }
) => ZodNumber;

export declare const object: <Shape extends ZodRawShape>(
  shape: Shape,
  params?: RawCreateParams
) => ZodObject<
  Shape,
  'strip',
  ZodTypeAny,
  objectOutputType<Shape, ZodTypeAny, 'strip'>,
  objectInputType<Shape, ZodTypeAny, 'strip'>
>;

export declare type objectInputType<
  Shape extends ZodRawShape,
  Catchall extends ZodTypeAny,
  UnknownKeys extends UnknownKeysParam = UnknownKeysParam
> = objectUtil.flatten<baseObjectInputType<Shape>> & CatchallInput<Catchall> & PassthroughType<UnknownKeys>;

export declare type objectOutputType<
  Shape extends ZodRawShape,
  Catchall extends ZodTypeAny,
  UnknownKeys extends UnknownKeysParam = UnknownKeysParam
> = objectUtil.flatten<objectUtil.addQuestionMarks<baseObjectOutputType<Shape>>> &
  CatchallOutput<Catchall> &
  PassthroughType<UnknownKeys>;

export declare type ObjectPair = {
  key: SyncParseReturnType<any>;
  value: SyncParseReturnType<any>;
};

export declare namespace objectUtil {
  export type MergeShapes<U, V> = keyof U & keyof V extends never
    ? U & V
    : {
        [k in Exclude<keyof U, keyof V>]: U[k];
      } & V;
  export type optionalKeys<T extends object> = {
    [k in keyof T]: undefined extends T[k] ? k : never;
  }[keyof T];
  export type requiredKeys<T extends object> = {
    [k in keyof T]: undefined extends T[k] ? never : k;
  }[keyof T];
  export type addQuestionMarks<T extends object, _O = any> = {
    [K in requiredKeys<T>]: T[K];
  } & {
    [K in optionalKeys<T>]?: T[K];
  } & {
    [k in keyof T]?: unknown;
  };
  export type identity<T> = T;
  export type flatten<T> = identity<{
    [k in keyof T]: T[k];
  }>;
  export type noNeverKeys<T> = {
    [k in keyof T]: [T[k]] extends [never] ? never : k;
  }[keyof T];
  export type noNever<T> = identity<{
    [k in noNeverKeys<T>]: k extends keyof T ? T[k] : never;
  }>;
  const mergeShapes: <U, T>(first: U, second: T) => T & U;
  export type extendShape<A extends object, B extends object> = keyof A & keyof B extends never
    ? A & B
    : {
        [K in keyof A as K extends keyof B ? never : K]: A[K];
      } & {
        [K in keyof B]: B[K];
      };
}

export declare const oboolean: () => ZodOptional<ZodBoolean>;

export declare type OK<T> = {
  status: 'valid';
  value: T;
};

export declare const OK: <T>(value: T) => OK<T>;

export declare const onumber: () => ZodOptional<ZodNumber>;

export declare const optional: <Inner extends ZodTypeAny>(type: Inner, params?: RawCreateParams) => ZodOptional<Inner>;

export declare const ostring: () => ZodOptional<ZodString>;

export declare type OuterTypeOfFunction<Args extends ZodTuple<any, any>, Returns extends ZodTypeAny> =
  Args['_input'] extends Array<any> ? (...args: Args['_input']) => Returns['_output'] : never;

export declare type output<T extends ZodType<any, any, any>> = T['_output'];

export declare type OutputTypeOfTuple<T extends ZodTupleItems | []> = AssertArray<{
  [k in keyof T]: T[k] extends ZodType<any, any, any> ? T[k]['_output'] : never;
}>;

export declare type OutputTypeOfTupleWithRest<
  T extends ZodTupleItems | [],
  Rest extends ZodTypeAny | null = null
> = Rest extends ZodTypeAny ? [...OutputTypeOfTuple<T>, ...Rest['_output'][]] : OutputTypeOfTuple<T>;

export declare interface ParseContext {
  readonly common: {
    readonly issues: ZodIssue[];
    readonly contextualErrorMap?: ZodErrorMap | undefined;
    readonly async: boolean;
  };
  readonly path: ParsePath;
  readonly schemaErrorMap?: ZodErrorMap | undefined;
  readonly parent: ParseContext | null;
  readonly data: any;
  readonly parsedType: ZodParsedType;
}

export declare type ParseInput = {
  data: any;
  path: (string | number)[];
  parent: ParseContext;
};

export declare type ParseParams = {
  path: (string | number)[];
  errorMap: ZodErrorMap;
  async: boolean;
};

export declare type ParsePath = ParsePathComponent[];

export declare type ParsePathComponent = string | number;

export declare interface ParseResult {
  status: 'aborted' | 'dirty' | 'valid';
  data: any;
}

export declare type ParseReturnType<T> = SyncParseReturnType<T> | AsyncParseReturnType<T>;

export declare class ParseStatus {
  value: 'aborted' | 'dirty' | 'valid';
  dirty(): void;
  abort(): void;
  static mergeArray(status: ParseStatus, results: SyncParseReturnType<any>[]): SyncParseReturnType;
  static mergeObjectAsync(
    status: ParseStatus,
    pairs: {
      key: ParseReturnType<any>;
      value: ParseReturnType<any>;
    }[]
  ): Promise<SyncParseReturnType<any>>;
  static mergeObjectSync(
    status: ParseStatus,
    pairs: {
      key: SyncParseReturnType<any>;
      value: SyncParseReturnType<any>;
      alwaysSet?: boolean;
    }[]
  ): SyncParseReturnType;
}

declare namespace partialUtil {
  type DeepPartial<T extends ZodTypeAny> =
    T extends ZodObject<ZodRawShape>
      ? ZodObject<
          {
            [k in keyof T['shape']]: ZodOptional<DeepPartial<T['shape'][k]>>;
          },
          T['_def']['unknownKeys'],
          T['_def']['catchall']
        >
      : T extends ZodArray<infer Type, infer Card>
        ? ZodArray<DeepPartial<Type>, Card>
        : T extends ZodOptional<infer Type>
          ? ZodOptional<DeepPartial<Type>>
          : T extends ZodNullable<infer Type>
            ? ZodNullable<DeepPartial<Type>>
            : T extends ZodTuple<infer Items>
              ? {
                  [k in keyof Items]: Items[k] extends ZodTypeAny ? DeepPartial<Items[k]> : never;
                } extends infer PI
                ? PI extends ZodTupleItems
                  ? ZodTuple<PI>
                  : never
                : never
              : T;
}

export declare type PassthroughType<T extends UnknownKeysParam> = T extends 'passthrough'
  ? {
      [k: string]: unknown;
    }
  : unknown;

export declare const pipeline: typeof ZodPipeline.create;

export declare const preprocess: <I extends ZodTypeAny>(
  preprocess: (arg: unknown, ctx: RefinementCtx) => unknown,
  schema: I,
  params?: RawCreateParams
) => ZodEffects<I, I['_output'], unknown>;

export declare type PreprocessEffect<T> = {
  type: 'preprocess';
  transform: (arg: T, ctx: RefinementCtx) => any;
};

export declare type Primitive = string | number | symbol | bigint | boolean | null | undefined;

export declare type ProcessedCreateParams = {
  errorMap?: ZodErrorMap | undefined;
  description?: string | undefined;
};

export declare const promise: <Inner extends ZodTypeAny>(schema: Inner, params?: RawCreateParams) => ZodPromise<Inner>;

export declare const quotelessJson: (obj: any) => string;

export declare type RawCreateParams =
  | {
      errorMap?: ZodErrorMap | undefined;
      invalid_type_error?: string | undefined;
      required_error?: string | undefined;
      message?: string | undefined;
      description?: string | undefined;
    }
  | undefined;

export declare const record: typeof ZodRecord.create;

export declare type RecordType<K extends string | number | symbol, V> = [string] extends [K]
  ? Record<K, V>
  : [number] extends [K]
    ? Record<K, V>
    : [symbol] extends [K]
      ? Record<K, V>
      : [BRAND<string | number | symbol>] extends [K]
        ? Record<K, V>
        : Partial<Record<K, V>>;

declare type recursiveZodFormattedError<T> = T extends [any, ...any[]]
  ? {
      [K in keyof T]?: ZodFormattedError<T[K]>;
    }
  : T extends any[]
    ? {
        [k: number]: ZodFormattedError<T[number]>;
      }
    : T extends object
      ? {
          [K in keyof T]?: ZodFormattedError<T[K]>;
        }
      : unknown;

export declare type Refinement<T> = (arg: T, ctx: RefinementCtx) => any;

export declare interface RefinementCtx {
  addIssue: (arg: IssueData) => void;
  path: (string | number)[];
}

export declare type RefinementEffect<T> = {
  type: 'refinement';
  refinement: (arg: T, ctx: RefinementCtx) => any;
};

export declare type SafeParseError<Input> = {
  success: false;
  error: ZodError<Input>;
  data?: never;
};

export declare type SafeParseReturnType<Input, Output> = SafeParseSuccess<Output> | SafeParseError<Input>;

export declare type SafeParseSuccess<Output> = {
  success: true;
  data: Output;
  error?: never;
};

export declare type Scalars = Primitive | Primitive[];

export declare const set: <ValueSchema extends ZodTypeAny = ZodTypeAny>(
  valueType: ValueSchema,
  params?: RawCreateParams
) => ZodSet<ValueSchema>;

export declare function setErrorMap(map: ZodErrorMap): void;

export declare type SomeZodObject = ZodObject<ZodRawShape, UnknownKeysParam, ZodTypeAny>;

/**
 * The Standard Schema interface.
 */
declare type StandardSchemaV1<Input = unknown, Output = Input> = {
  /**
   * The Standard Schema properties.
   */
  readonly '~standard': StandardSchemaV1.Props<Input, Output>;
};

declare namespace StandardSchemaV1 {
  /**
   * The Standard Schema properties interface.
   */
  interface Props<Input = unknown, Output = Input> {
    /**
     * The version number of the standard.
     */
    readonly version: 1;
    /**
     * The vendor name of the schema library.
     */
    readonly vendor: string;
    /**
     * Validates unknown input values.
     */
    readonly validate: (value: unknown) => Result<Output> | Promise<Result<Output>>;
    /**
     * Inferred types associated with the schema.
     */
    readonly types?: Types<Input, Output> | undefined;
  }
  /**
   * The result interface of the validate function.
   */
  type Result<Output> = SuccessResult<Output> | FailureResult;
  /**
   * The result interface if validation succeeds.
   */
  interface SuccessResult<Output> {
    /**
     * The typed output value.
     */
    readonly value: Output;
    /**
     * The non-existent issues.
     */
    readonly issues?: undefined;
  }
  /**
   * The result interface if validation fails.
   */
  interface FailureResult {
    /**
     * The issues of failed validation.
     */
    readonly issues: ReadonlyArray<Issue>;
  }
  /**
   * The issue interface of the failure output.
   */
  interface Issue {
    /**
     * The error message of the issue.
     */
    readonly message: string;
    /**
     * The path of the issue, if any.
     */
    readonly path?: ReadonlyArray<PropertyKey | PathSegment> | undefined;
  }
  /**
   * The path segment interface of the issue.
   */
  interface PathSegment {
    /**
     * The key representing a path segment.
     */
    readonly key: PropertyKey;
  }
  /**
   * The Standard Schema types interface.
   */
  interface Types<Input = unknown, Output = Input> {
    /**
     * The input type of the schema.
     */
    readonly input: Input;
    /**
     * The output type of the schema.
     */
    readonly output: Output;
  }
  /**
   * Infers the input type of a Standard Schema.
   */
  type InferInput<Schema extends StandardSchemaV1> = NonNullable<Schema['~standard']['types']>['input'];
  /**
   * Infers the output type of a Standard Schema.
   */
  type InferOutput<Schema extends StandardSchemaV1> = NonNullable<Schema['~standard']['types']>['output'];
}

export declare const strictObject: <Shape extends ZodRawShape>(
  shape: Shape,
  params?: RawCreateParams
) => ZodObject<Shape, 'strict'>;

export declare const string: (
  params?: RawCreateParams & {
    coerce?: true;
  }
) => ZodString;

export declare type StringValidation =
  | 'email'
  | 'url'
  | 'emoji'
  | 'uuid'
  | 'nanoid'
  | 'regex'
  | 'cuid'
  | 'cuid2'
  | 'ulid'
  | 'datetime'
  | 'date'
  | 'time'
  | 'duration'
  | 'ip'
  | 'cidr'
  | 'base64'
  | 'jwt'
  | 'base64url'
  | {
      includes: string;
      position?: number | undefined;
    }
  | {
      startsWith: string;
    }
  | {
      endsWith: string;
    };

declare type stripPath<T extends object> = T extends any ? util.OmitKeys<T, 'path'> : never;

export declare type SuperRefinement<T> = (arg: T, ctx: RefinementCtx) => void | Promise<void>;

export declare const symbol: (params?: RawCreateParams) => ZodSymbol;

export declare type SyncParseReturnType<T = any> = OK<T> | DIRTY<T> | INVALID;

export declare type TransformEffect<T> = {
  type: 'transform';
  transform: (arg: T, ctx: RefinementCtx) => any;
};

export declare const tuple: <Items extends [ZodTypeAny, ...ZodTypeAny[]] | []>(
  schemas: Items,
  params?: RawCreateParams
) => ZodTuple<Items, null>;

export declare type typecast<A, T> = A extends T ? A : never;

declare type TypeOf<T extends ZodType<any, any, any>> = T['_output'];
export { TypeOf };
export { TypeOf as infer };

export declare type typeToFlattenedError<T, U = string> = {
  formErrors: U[];
  fieldErrors: {
    [P in allKeys<T>]?: U[];
  };
};

declare const undefined_2: (params?: RawCreateParams) => ZodUndefined;
export { undefined_2 as undefined };

export declare const union: <Options extends Readonly<[ZodTypeAny, ZodTypeAny, ...ZodTypeAny[]]>>(
  types: Options,
  params?: RawCreateParams
) => ZodUnion<Options>;

export declare const unknown: (params?: RawCreateParams) => ZodUnknown;

export declare type UnknownKeysParam = 'passthrough' | 'strict' | 'strip';

export declare namespace util {
  export type AssertEqual<T, U> = (<V>() => V extends T ? 1 : 2) extends <V>() => V extends U ? 1 : 2 ? true : false;
  export type isAny<T> = 0 extends 1 & T ? true : false;
  const assertEqual: <A, B>(_: AssertEqual<A, B>) => void;
  export function assertIs<T>(_arg: T): void;
  export function assertNever(_x: never): never;
  export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
  export type OmitKeys<T, K extends string> = Pick<T, Exclude<keyof T, K>>;
  export type MakePartial<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
  export type Exactly<T, X> = T & Record<Exclude<keyof X, keyof T>, never>;
  export type InexactPartial<T> = {
    [k in keyof T]?: T[k] | undefined;
  };
  const arrayToEnum: <T extends string, U extends [T, ...T[]]>(items: U) => { [k in U[number]]: k };
  const getValidEnumValues: (obj: any) => any[];
  const objectValues: (obj: any) => any[];
  const objectKeys: ObjectConstructor['keys'];
  const find: <T>(arr: T[], checker: (arg: T) => any) => T | undefined;
  export type identity<T> = objectUtil.identity<T>;
  export type flatten<T> = objectUtil.flatten<T>;
  export type noUndefined<T> = T extends undefined ? never : T;
  const isInteger: NumberConstructor['isInteger'];
  export function joinValues<T extends any[]>(array: T, separator?: string): string;
  const jsonStringifyReplacer: (_: string, value: any) => any;
}

export declare type Values<T extends EnumValues> = {
  [k in T[number]]: k;
};

declare const voidType: (params?: RawCreateParams) => ZodVoid;

export { voidType as void };

export declare type Writeable<T> = {
  -readonly [P in keyof T]: T[P];
};

export declare class ZodAny extends ZodType<any, ZodAnyDef, any> {
  _any: true;
  _parse(input: ParseInput): ParseReturnType<this['_output']>;
  static create: (params?: RawCreateParams) => ZodAny;
}

export declare interface ZodAnyDef extends ZodTypeDef {
  typeName: ZodFirstPartyTypeKind.ZodAny;
}

export declare class ZodArray<T extends ZodTypeAny, Cardinality extends ArrayCardinality = 'many'> extends ZodType<
  arrayOutputType<T, Cardinality>,
  ZodArrayDef<T>,
  Cardinality extends 'atleastone' ? [T['_input'], ...T['_input'][]] : T['_input'][]
> {
  _parse(input: ParseInput): ParseReturnType<this['_output']>;
  get element(): T;
  min(minLength: number, message?: errorUtil.ErrMessage): this;
  max(maxLength: number, message?: errorUtil.ErrMessage): this;
  length(len: number, message?: errorUtil.ErrMessage): this;
  nonempty(message?: errorUtil.ErrMessage): ZodArray<T, 'atleastone'>;
  static create: <El extends ZodTypeAny>(schema: El, params?: RawCreateParams) => ZodArray<El>;
}

export declare interface ZodArrayDef<T extends ZodTypeAny = ZodTypeAny> extends ZodTypeDef {
  type: T;
  typeName: ZodFirstPartyTypeKind.ZodArray;
  exactLength: {
    value: number;
    message?: string | undefined;
  } | null;
  minLength: {
    value: number;
    message?: string | undefined;
  } | null;
  maxLength: {
    value: number;
    message?: string | undefined;
  } | null;
}

export declare class ZodBigInt extends ZodType<bigint, ZodBigIntDef, bigint> {
  _parse(input: ParseInput): ParseReturnType<bigint>;
  _getInvalidInput(input: ParseInput): INVALID;
  static create: (
    params?: RawCreateParams & {
      coerce?: boolean;
    }
  ) => ZodBigInt;
  gte(value: bigint, message?: errorUtil.ErrMessage): ZodBigInt;
  min: (value: bigint, message?: errorUtil.ErrMessage) => ZodBigInt;
  gt(value: bigint, message?: errorUtil.ErrMessage): ZodBigInt;
  lte(value: bigint, message?: errorUtil.ErrMessage): ZodBigInt;
  max: (value: bigint, message?: errorUtil.ErrMessage) => ZodBigInt;
  lt(value: bigint, message?: errorUtil.ErrMessage): ZodBigInt;
  protected setLimit(kind: 'min' | 'max', value: bigint, inclusive: boolean, message?: string): ZodBigInt;
  _addCheck(check: ZodBigIntCheck): ZodBigInt;
  positive(message?: errorUtil.ErrMessage): ZodBigInt;
  negative(message?: errorUtil.ErrMessage): ZodBigInt;
  nonpositive(message?: errorUtil.ErrMessage): ZodBigInt;
  nonnegative(message?: errorUtil.ErrMessage): ZodBigInt;
  multipleOf(value: bigint, message?: errorUtil.ErrMessage): ZodBigInt;
  get minValue(): bigint | null;
  get maxValue(): bigint | null;
}

export declare type ZodBigIntCheck =
  | {
      kind: 'min';
      value: bigint;
      inclusive: boolean;
      message?: string | undefined;
    }
  | {
      kind: 'max';
      value: bigint;
      inclusive: boolean;
      message?: string | undefined;
    }
  | {
      kind: 'multipleOf';
      value: bigint;
      message?: string | undefined;
    };

export declare interface ZodBigIntDef extends ZodTypeDef {
  checks: ZodBigIntCheck[];
  typeName: ZodFirstPartyTypeKind.ZodBigInt;
  coerce: boolean;
}

export declare class ZodBoolean extends ZodType<boolean, ZodBooleanDef, boolean> {
  _parse(input: ParseInput): ParseReturnType<boolean>;
  static create: (
    params?: RawCreateParams & {
      coerce?: boolean;
    }
  ) => ZodBoolean;
}

export declare interface ZodBooleanDef extends ZodTypeDef {
  typeName: ZodFirstPartyTypeKind.ZodBoolean;
  coerce: boolean;
}

export declare class ZodBranded<T extends ZodTypeAny, B extends string | number | symbol> extends ZodType<
  T['_output'] & BRAND<B>,
  ZodBrandedDef<T>,
  T['_input']
> {
  _parse(input: ParseInput): ParseReturnType<any>;
  unwrap(): T;
}

export declare interface ZodBrandedDef<T extends ZodTypeAny> extends ZodTypeDef {
  type: T;
  typeName: ZodFirstPartyTypeKind.ZodBranded;
}

export declare class ZodCatch<T extends ZodTypeAny> extends ZodType<T['_output'], ZodCatchDef<T>, unknown> {
  _parse(input: ParseInput): ParseReturnType<this['_output']>;
  removeCatch(): T;
  static create: <Inner extends ZodTypeAny>(
    type: Inner,
    params: RawCreateParams & {
      catch: Inner['_output'] | (() => Inner['_output']);
    }
  ) => ZodCatch<Inner>;
}

export declare interface ZodCatchDef<T extends ZodTypeAny = ZodTypeAny> extends ZodTypeDef {
  innerType: T;
  catchValue: (ctx: { error: ZodError; input: unknown }) => T['_input'];
  typeName: ZodFirstPartyTypeKind.ZodCatch;
}

export declare interface ZodCustomIssue extends ZodIssueBase {
  code: typeof ZodIssueCode.custom;
  params?: {
    [k: string]: any;
  };
}

export declare class ZodDate extends ZodType<Date, ZodDateDef, Date> {
  _parse(input: ParseInput): ParseReturnType<this['_output']>;
  _addCheck(check: ZodDateCheck): ZodDate;
  min(minDate: Date, message?: errorUtil.ErrMessage): ZodDate;
  max(maxDate: Date, message?: errorUtil.ErrMessage): ZodDate;
  get minDate(): Date | null;
  get maxDate(): Date | null;
  static create: (
    params?: RawCreateParams & {
      coerce?: boolean;
    }
  ) => ZodDate;
}

export declare type ZodDateCheck =
  | {
      kind: 'min';
      value: number;
      message?: string | undefined;
    }
  | {
      kind: 'max';
      value: number;
      message?: string | undefined;
    };

export declare interface ZodDateDef extends ZodTypeDef {
  checks: ZodDateCheck[];
  coerce: boolean;
  typeName: ZodFirstPartyTypeKind.ZodDate;
}

export declare class ZodDefault<T extends ZodTypeAny> extends ZodType<
  util.noUndefined<T['_output']>,
  ZodDefaultDef<T>,
  T['_input'] | undefined
> {
  _parse(input: ParseInput): ParseReturnType<this['_output']>;
  removeDefault(): T;
  static create: <Inner extends ZodTypeAny>(
    type: Inner,
    params: RawCreateParams & {
      default: Inner['_input'] | (() => util.noUndefined<Inner['_input']>);
    }
  ) => ZodDefault<Inner>;
}

export declare interface ZodDefaultDef<T extends ZodTypeAny = ZodTypeAny> extends ZodTypeDef {
  innerType: T;
  defaultValue: () => util.noUndefined<T['_input']>;
  typeName: ZodFirstPartyTypeKind.ZodDefault;
}

export declare class ZodDiscriminatedUnion<
  Discriminator extends string,
  Options extends readonly ZodDiscriminatedUnionOption<Discriminator>[]
> extends ZodType<output<Options[number]>, ZodDiscriminatedUnionDef<Discriminator, Options>, input<Options[number]>> {
  _parse(input: ParseInput): ParseReturnType<this['_output']>;
  get discriminator(): Discriminator;
  get options(): Options;
  get optionsMap(): Map<Primitive, ZodDiscriminatedUnionOption<any>>;
  /**
   * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
   * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
   * have a different value for each object in the union.
   * @param discriminator the name of the discriminator property
   * @param types an array of object schemas
   * @param params
   */
  static create<
    Discriminator extends string,
    Types extends readonly [ZodDiscriminatedUnionOption<Discriminator>, ...ZodDiscriminatedUnionOption<Discriminator>[]]
  >(
    discriminator: Discriminator,
    options: Types,
    params?: RawCreateParams
  ): ZodDiscriminatedUnion<Discriminator, Types>;
}

export declare interface ZodDiscriminatedUnionDef<
  Discriminator extends string,
  Options extends readonly ZodDiscriminatedUnionOption<string>[] = ZodDiscriminatedUnionOption<string>[]
> extends ZodTypeDef {
  discriminator: Discriminator;
  options: Options;
  optionsMap: Map<Primitive, ZodDiscriminatedUnionOption<any>>;
  typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion;
}

export declare type ZodDiscriminatedUnionOption<Discriminator extends string> = ZodObject<
  {
    [key in Discriminator]: ZodTypeAny;
  } & ZodRawShape,
  UnknownKeysParam,
  ZodTypeAny
>;

declare class ZodEffects<T extends ZodTypeAny, Output = output<T>, Input = input<T>> extends ZodType<
  Output,
  ZodEffectsDef<T>,
  Input
> {
  innerType(): T;
  sourceType(): T;
  _parse(input: ParseInput): ParseReturnType<this['_output']>;
  static create: <I extends ZodTypeAny>(
    schema: I,
    effect: Effect<I['_output']>,
    params?: RawCreateParams
  ) => ZodEffects<I, I['_output']>;
  static createWithPreprocess: <I extends ZodTypeAny>(
    preprocess: (arg: unknown, ctx: RefinementCtx) => unknown,
    schema: I,
    params?: RawCreateParams
  ) => ZodEffects<I, I['_output'], unknown>;
}
export { ZodEffects };
export { ZodEffects as ZodTransformer };

export declare interface ZodEffectsDef<T extends ZodTypeAny = ZodTypeAny> extends ZodTypeDef {
  schema: T;
  typeName: ZodFirstPartyTypeKind.ZodEffects;
  effect: Effect<any>;
}

export declare class ZodEnum<T extends [string, ...string[]]> extends ZodType<T[number], ZodEnumDef<T>, T[number]> {
  _parse(input: ParseInput): ParseReturnType<this['_output']>;
  get options(): T;
  get enum(): Values<T>;
  get Values(): Values<T>;
  get Enum(): Values<T>;
  extract<ToExtract extends readonly [T[number], ...T[number][]]>(
    values: ToExtract,
    newDef?: RawCreateParams
  ): ZodEnum<Writeable<ToExtract>>;
  exclude<ToExclude extends readonly [T[number], ...T[number][]]>(
    values: ToExclude,
    newDef?: RawCreateParams
  ): ZodEnum<typecast<Writeable<FilterEnum<T, ToExclude[number]>>, [string, ...string[]]>>;
  static create: typeof createZodEnum;
}

export declare interface ZodEnumDef<T extends EnumValues = EnumValues> extends ZodTypeDef {
  values: T;
  typeName: ZodFirstPartyTypeKind.ZodEnum;
}

export declare class ZodError<T = any> extends Error {
  issues: ZodIssue[];
  get errors(): ZodIssue[];
  constructor(issues: ZodIssue[]);
  format(): ZodFormattedError<T>;
  format<U>(mapper: (issue: ZodIssue) => U): ZodFormattedError<T, U>;
  static create: (issues: ZodIssue[]) => ZodError<any>;
  static assert(value: unknown): asserts value is ZodError;
  toString(): string;
  get message(): string;
  get isEmpty(): boolean;
  addIssue: (sub: ZodIssue) => void;
  addIssues: (subs?: ZodIssue[]) => void;
  flatten(): typeToFlattenedError<T>;
  flatten<U>(mapper?: (issue: ZodIssue) => U): typeToFlattenedError<T, U>;
  get formErrors(): typeToFlattenedError<T, string>;
}

export declare type ZodErrorMap = (
  issue: ZodIssueOptionalMessage,
  _ctx: ErrorMapCtx
) => {
  message: string;
};

export declare type ZodFirstPartySchemaTypes =
  | ZodString
  | ZodNumber
  | ZodNaN
  | ZodBigInt
  | ZodBoolean
  | ZodDate
  | ZodUndefined
  | ZodNull
  | ZodAny
  | ZodUnknown
  | ZodNever
  | ZodVoid
  | ZodArray<any, any>
  | ZodObject<any, any, any>
  | ZodUnion<any>
  | ZodDiscriminatedUnion<any, any>
  | ZodIntersection<any, any>
  | ZodTuple<any, any>
  | ZodRecord<any, any>
  | ZodMap<any>
  | ZodSet<any>
  | ZodFunction<any, any>
  | ZodLazy<any>
  | ZodLiteral<any>
  | ZodEnum<any>
  | ZodEffects<any, any, any>
  | ZodNativeEnum<any>
  | ZodOptional<any>
  | ZodNullable<any>
  | ZodDefault<any>
  | ZodCatch<any>
  | ZodPromise<any>
  | ZodBranded<any, any>
  | ZodPipeline<any, any>
  | ZodReadonly<any>
  | ZodSymbol;

export declare enum ZodFirstPartyTypeKind {
  ZodString = 'ZodString',
  ZodNumber = 'ZodNumber',
  ZodNaN = 'ZodNaN',
  ZodBigInt = 'ZodBigInt',
  ZodBoolean = 'ZodBoolean',
  ZodDate = 'ZodDate',
  ZodSymbol = 'ZodSymbol',
  ZodUndefined = 'ZodUndefined',
  ZodNull = 'ZodNull',
  ZodAny = 'ZodAny',
  ZodUnknown = 'ZodUnknown',
  ZodNever = 'ZodNever',
  ZodVoid = 'ZodVoid',
  ZodArray = 'ZodArray',
  ZodObject = 'ZodObject',
  ZodUnion = 'ZodUnion',
  ZodDiscriminatedUnion = 'ZodDiscriminatedUnion',
  ZodIntersection = 'ZodIntersection',
  ZodTuple = 'ZodTuple',
  ZodRecord = 'ZodRecord',
  ZodMap = 'ZodMap',
  ZodSet = 'ZodSet',
  ZodFunction = 'ZodFunction',
  ZodLazy = 'ZodLazy',
  ZodLiteral = 'ZodLiteral',
  ZodEnum = 'ZodEnum',
  ZodEffects = 'ZodEffects',
  ZodNativeEnum = 'ZodNativeEnum',
  ZodOptional = 'ZodOptional',
  ZodNullable = 'ZodNullable',
  ZodDefault = 'ZodDefault',
  ZodCatch = 'ZodCatch',
  ZodPromise = 'ZodPromise',
  ZodBranded = 'ZodBranded',
  ZodPipeline = 'ZodPipeline',
  ZodReadonly = 'ZodReadonly'
}

export declare type ZodFormattedError<T, U = string> = {
  _errors: U[];
} & recursiveZodFormattedError<NonNullable<T>>;

export declare class ZodFunction<Args extends ZodTuple<any, any>, Returns extends ZodTypeAny> extends ZodType<
  OuterTypeOfFunction<Args, Returns>,
  ZodFunctionDef<Args, Returns>,
  InnerTypeOfFunction<Args, Returns>
> {
  _parse(input: ParseInput): ParseReturnType<any>;
  parameters(): Args;
  returnType(): Returns;
  args<Items extends Parameters<(typeof ZodTuple)['create']>[0]>(
    ...items: Items
  ): ZodFunction<ZodTuple<Items, ZodUnknown>, Returns>;
  returns<NewReturnType extends ZodType<any, any, any>>(returnType: NewReturnType): ZodFunction<Args, NewReturnType>;
  implement<F extends InnerTypeOfFunction<Args, Returns>>(
    func: F
  ): ReturnType<F> extends Returns['_output']
    ? (...args: Args['_input']) => ReturnType<F>
    : OuterTypeOfFunction<Args, Returns>;
  strictImplement(func: InnerTypeOfFunction<Args, Returns>): InnerTypeOfFunction<Args, Returns>;
  validate: <F extends InnerTypeOfFunction<Args, Returns>>(
    func: F
  ) => ReturnType<F> extends Returns['_output']
    ? (...args: Args['_input']) => ReturnType<F>
    : OuterTypeOfFunction<Args, Returns>;
  static create(): ZodFunction<ZodTuple<[], ZodUnknown>, ZodUnknown>;
  static create<T extends AnyZodTuple = ZodTuple<[], ZodUnknown>>(args: T): ZodFunction<T, ZodUnknown>;
  static create<T extends AnyZodTuple, U extends ZodTypeAny>(args: T, returns: U): ZodFunction<T, U>;
  static create<T extends AnyZodTuple = ZodTuple<[], ZodUnknown>, U extends ZodTypeAny = ZodUnknown>(
    args: T,
    returns: U,
    params?: RawCreateParams
  ): ZodFunction<T, U>;
}

export declare interface ZodFunctionDef<
  Args extends ZodTuple<any, any> = ZodTuple<any, any>,
  Returns extends ZodTypeAny = ZodTypeAny
> extends ZodTypeDef {
  args: Args;
  returns: Returns;
  typeName: ZodFirstPartyTypeKind.ZodFunction;
}

export declare class ZodIntersection<T extends ZodTypeAny, U extends ZodTypeAny> extends ZodType<
  T['_output'] & U['_output'],
  ZodIntersectionDef<T, U>,
  T['_input'] & U['_input']
> {
  _parse(input: ParseInput): ParseReturnType<this['_output']>;
  static create: <TSchema extends ZodTypeAny, USchema extends ZodTypeAny>(
    left: TSchema,
    right: USchema,
    params?: RawCreateParams
  ) => ZodIntersection<TSchema, USchema>;
}

export declare interface ZodIntersectionDef<T extends ZodTypeAny = ZodTypeAny, U extends ZodTypeAny = ZodTypeAny>
  extends ZodTypeDef {
  left: T;
  right: U;
  typeName: ZodFirstPartyTypeKind.ZodIntersection;
}

export declare interface ZodInvalidArgumentsIssue extends ZodIssueBase {
  code: typeof ZodIssueCode.invalid_arguments;
  argumentsError: ZodError;
}

export declare interface ZodInvalidDateIssue extends ZodIssueBase {
  code: typeof ZodIssueCode.invalid_date;
}

export declare interface ZodInvalidEnumValueIssue extends ZodIssueBase {
  received: string | number;
  code: typeof ZodIssueCode.invalid_enum_value;
  options: (string | number)[];
}

export declare interface ZodInvalidIntersectionTypesIssue extends ZodIssueBase {
  code: typeof ZodIssueCode.invalid_intersection_types;
}

export declare interface ZodInvalidLiteralIssue extends ZodIssueBase {
  code: typeof ZodIssueCode.invalid_literal;
  expected: unknown;
  received: unknown;
}

export declare interface ZodInvalidReturnTypeIssue extends ZodIssueBase {
  code: typeof ZodIssueCode.invalid_return_type;
  returnTypeError: ZodError;
}

export declare interface ZodInvalidStringIssue extends ZodIssueBase {
  code: typeof ZodIssueCode.invalid_string;
  validation: StringValidation;
}

export declare interface ZodInvalidTypeIssue extends ZodIssueBase {
  code: typeof ZodIssueCode.invalid_type;
  expected: ZodParsedType;
  received: ZodParsedType;
}

export declare interface ZodInvalidUnionDiscriminatorIssue extends ZodIssueBase {
  code: typeof ZodIssueCode.invalid_union_discriminator;
  options: Primitive[];
}

export declare interface ZodInvalidUnionIssue extends ZodIssueBase {
  code: typeof ZodIssueCode.invalid_union;
  unionErrors: ZodError[];
}

export declare type ZodIssue = ZodIssueOptionalMessage & {
  fatal?: boolean | undefined;
  message: string;
};

export declare type ZodIssueBase = {
  path: (string | number)[];
  message?: string | undefined;
};

export declare const ZodIssueCode: {
  invalid_type: 'invalid_type';
  invalid_literal: 'invalid_literal';
  custom: 'custom';
  invalid_union: 'invalid_union';
  invalid_union_discriminator: 'invalid_union_discriminator';
  invalid_enum_value: 'invalid_enum_value';
  unrecognized_keys: 'unrecognized_keys';
  invalid_arguments: 'invalid_arguments';
  invalid_return_type: 'invalid_return_type';
  invalid_date: 'invalid_date';
  invalid_string: 'invalid_string';
  too_small: 'too_small';
  too_big: 'too_big';
  invalid_intersection_types: 'invalid_intersection_types';
  not_multiple_of: 'not_multiple_of';
  not_finite: 'not_finite';
};

export declare type ZodIssueCode = keyof typeof ZodIssueCode;

export declare type ZodIssueOptionalMessage =
  | ZodInvalidTypeIssue
  | ZodInvalidLiteralIssue
  | ZodUnrecognizedKeysIssue
  | ZodInvalidUnionIssue
  | ZodInvalidUnionDiscriminatorIssue
  | ZodInvalidEnumValueIssue
  | ZodInvalidArgumentsIssue
  | ZodInvalidReturnTypeIssue
  | ZodInvalidDateIssue
  | ZodInvalidStringIssue
  | ZodTooSmallIssue
  | ZodTooBigIssue
  | ZodInvalidIntersectionTypesIssue
  | ZodNotMultipleOfIssue
  | ZodNotFiniteIssue
  | ZodCustomIssue;

export declare class ZodLazy<T extends ZodTypeAny> extends ZodType<output<T>, ZodLazyDef<T>, input<T>> {
  get schema(): T;
  _parse(input: ParseInput): ParseReturnType<this['_output']>;
  static create: <Inner extends ZodTypeAny>(getter: () => Inner, params?: RawCreateParams) => ZodLazy<Inner>;
}

export declare interface ZodLazyDef<T extends ZodTypeAny = ZodTypeAny> extends ZodTypeDef {
  getter: () => T;
  typeName: ZodFirstPartyTypeKind.ZodLazy;
}

export declare class ZodLiteral<T> extends ZodType<T, ZodLiteralDef<T>, T> {
  _parse(input: ParseInput): ParseReturnType<this['_output']>;
  get value(): T;
  static create: <Value extends Primitive>(value: Value, params?: RawCreateParams) => ZodLiteral<Value>;
}

export declare interface ZodLiteralDef<T = any> extends ZodTypeDef {
  value: T;
  typeName: ZodFirstPartyTypeKind.ZodLiteral;
}

export declare class ZodMap<Key extends ZodTypeAny = ZodTypeAny, Value extends ZodTypeAny = ZodTypeAny> extends ZodType<
  Map<Key['_output'], Value['_output']>,
  ZodMapDef<Key, Value>,
  Map<Key['_input'], Value['_input']>
> {
  get keySchema(): Key;
  get valueSchema(): Value;
  _parse(input: ParseInput): ParseReturnType<this['_output']>;
  static create: <KeySchema extends ZodTypeAny = ZodTypeAny, ValueSchema extends ZodTypeAny = ZodTypeAny>(
    keyType: KeySchema,
    valueType: ValueSchema,
    params?: RawCreateParams
  ) => ZodMap<KeySchema, ValueSchema>;
}

export declare interface ZodMapDef<Key extends ZodTypeAny = ZodTypeAny, Value extends ZodTypeAny = ZodTypeAny>
  extends ZodTypeDef {
  valueType: Value;
  keyType: Key;
  typeName: ZodFirstPartyTypeKind.ZodMap;
}

export declare class ZodNaN extends ZodType<number, ZodNaNDef, number> {
  _parse(input: ParseInput): ParseReturnType<any>;
  static create: (params?: RawCreateParams) => ZodNaN;
}

export declare interface ZodNaNDef extends ZodTypeDef {
  typeName: ZodFirstPartyTypeKind.ZodNaN;
}

export declare class ZodNativeEnum<T extends EnumLike> extends ZodType<T[keyof T], ZodNativeEnumDef<T>, T[keyof T]> {
  _parse(input: ParseInput): ParseReturnType<T[keyof T]>;
  get enum(): T;
  static create: <Elements extends EnumLike>(values: Elements, params?: RawCreateParams) => ZodNativeEnum<Elements>;
}

export declare interface ZodNativeEnumDef<T extends EnumLike = EnumLike> extends ZodTypeDef {
  values: T;
  typeName: ZodFirstPartyTypeKind.ZodNativeEnum;
}

export declare class ZodNever extends ZodType<never, ZodNeverDef, never> {
  _parse(input: ParseInput): ParseReturnType<this['_output']>;
  static create: (params?: RawCreateParams) => ZodNever;
}

export declare interface ZodNeverDef extends ZodTypeDef {
  typeName: ZodFirstPartyTypeKind.ZodNever;
}

export declare type ZodNonEmptyArray<T extends ZodTypeAny> = ZodArray<T, 'atleastone'>;

export declare interface ZodNotFiniteIssue extends ZodIssueBase {
  code: typeof ZodIssueCode.not_finite;
}

export declare interface ZodNotMultipleOfIssue extends ZodIssueBase {
  code: typeof ZodIssueCode.not_multiple_of;
  multipleOf: number | bigint;
}

export declare class ZodNull extends ZodType<null, ZodNullDef, null> {
  _parse(input: ParseInput): ParseReturnType<this['_output']>;
  static create: (params?: RawCreateParams) => ZodNull;
}

export declare class ZodNullable<T extends ZodTypeAny> extends ZodType<
  T['_output'] | null,
  ZodNullableDef<T>,
  T['_input'] | null
> {
  _parse(input: ParseInput): ParseReturnType<this['_output']>;
  unwrap(): T;
  static create: <Inner extends ZodTypeAny>(type: Inner, params?: RawCreateParams) => ZodNullable<Inner>;
}

export declare interface ZodNullableDef<T extends ZodTypeAny = ZodTypeAny> extends ZodTypeDef {
  innerType: T;
  typeName: ZodFirstPartyTypeKind.ZodNullable;
}

export declare type ZodNullableType<T extends ZodTypeAny> = ZodNullable<T>;

export declare interface ZodNullDef extends ZodTypeDef {
  typeName: ZodFirstPartyTypeKind.ZodNull;
}

export declare class ZodNumber extends ZodType<number, ZodNumberDef, number> {
  _parse(input: ParseInput): ParseReturnType<number>;
  static create: (
    params?: RawCreateParams & {
      coerce?: boolean;
    }
  ) => ZodNumber;
  gte(value: number, message?: errorUtil.ErrMessage): ZodNumber;
  min: (value: number, message?: errorUtil.ErrMessage) => ZodNumber;
  gt(value: number, message?: errorUtil.ErrMessage): ZodNumber;
  lte(value: number, message?: errorUtil.ErrMessage): ZodNumber;
  max: (value: number, message?: errorUtil.ErrMessage) => ZodNumber;
  lt(value: number, message?: errorUtil.ErrMessage): ZodNumber;
  protected setLimit(kind: 'min' | 'max', value: number, inclusive: boolean, message?: string): ZodNumber;
  _addCheck(check: ZodNumberCheck): ZodNumber;
  int(message?: errorUtil.ErrMessage): ZodNumber;
  positive(message?: errorUtil.ErrMessage): ZodNumber;
  negative(message?: errorUtil.ErrMessage): ZodNumber;
  nonpositive(message?: errorUtil.ErrMessage): ZodNumber;
  nonnegative(message?: errorUtil.ErrMessage): ZodNumber;
  multipleOf(value: number, message?: errorUtil.ErrMessage): ZodNumber;
  step: (value: number, message?: errorUtil.ErrMessage) => ZodNumber;
  finite(message?: errorUtil.ErrMessage): ZodNumber;
  safe(message?: errorUtil.ErrMessage): ZodNumber;
  get minValue(): number | null;
  get maxValue(): number | null;
  get isInt(): boolean;
  get isFinite(): boolean;
}

export declare type ZodNumberCheck =
  | {
      kind: 'min';
      value: number;
      inclusive: boolean;
      message?: string | undefined;
    }
  | {
      kind: 'max';
      value: number;
      inclusive: boolean;
      message?: string | undefined;
    }
  | {
      kind: 'int';
      message?: string | undefined;
    }
  | {
      kind: 'multipleOf';
      value: number;
      message?: string | undefined;
    }
  | {
      kind: 'finite';
      message?: string | undefined;
    };

export declare interface ZodNumberDef extends ZodTypeDef {
  checks: ZodNumberCheck[];
  typeName: ZodFirstPartyTypeKind.ZodNumber;
  coerce: boolean;
}

export declare class ZodObject<
  T extends ZodRawShape,
  UnknownKeys extends UnknownKeysParam = UnknownKeysParam,
  Catchall extends ZodTypeAny = ZodTypeAny,
  Output = objectOutputType<T, Catchall, UnknownKeys>,
  Input = objectInputType<T, Catchall, UnknownKeys>
> extends ZodType<Output, ZodObjectDef<T, UnknownKeys, Catchall>, Input> {
  private _cached;
  _getCached(): {
    shape: T;
    keys: string[];
  };
  _parse(input: ParseInput): ParseReturnType<this['_output']>;
  get shape(): T;
  strict(message?: errorUtil.ErrMessage): ZodObject<T, 'strict', Catchall>;
  strip(): ZodObject<T, 'strip', Catchall>;
  passthrough(): ZodObject<T, 'passthrough', Catchall>;
  /**
   * @deprecated In most cases, this is no longer needed - unknown properties are now silently stripped.
   * If you want to pass through unknown properties, use `.passthrough()` instead.
   */
  nonstrict: () => ZodObject<T, 'passthrough', Catchall>;
  extend<Augmentation extends ZodRawShape>(
    augmentation: Augmentation
  ): ZodObject<objectUtil.extendShape<T, Augmentation>, UnknownKeys, Catchall>;
  /**
   * @deprecated Use `.extend` instead
   *  */
  augment: <Augmentation extends ZodRawShape>(
    augmentation: Augmentation
  ) => ZodObject<objectUtil.extendShape<T, Augmentation>, UnknownKeys, Catchall>;
  /**
   * Prior to zod@1.0.12 there was a bug in the
   * inferred type of merged objects. Please
   * upgrade if you are experiencing issues.
   */
  merge<Incoming extends AnyZodObject, Augmentation extends Incoming['shape']>(
    merging: Incoming
  ): ZodObject<objectUtil.extendShape<T, Augmentation>, Incoming['_def']['unknownKeys'], Incoming['_def']['catchall']>;
  setKey<Key extends string, Schema extends ZodTypeAny>(
    key: Key,
    schema: Schema
  ): ZodObject<
    T & {
      [k in Key]: Schema;
    },
    UnknownKeys,
    Catchall
  >;
  catchall<Index extends ZodTypeAny>(index: Index): ZodObject<T, UnknownKeys, Index>;
  pick<
    Mask extends util.Exactly<
      {
        [k in keyof T]?: true;
      },
      Mask
    >
  >(mask: Mask): ZodObject<Pick<T, Extract<keyof T, keyof Mask>>, UnknownKeys, Catchall>;
  omit<
    Mask extends util.Exactly<
      {
        [k in keyof T]?: true;
      },
      Mask
    >
  >(mask: Mask): ZodObject<Omit<T, keyof Mask>, UnknownKeys, Catchall>;
  /**
   * @deprecated
   */
  deepPartial(): partialUtil.DeepPartial<this>;
  partial(): ZodObject<
    {
      [k in keyof T]: ZodOptional<T[k]>;
    },
    UnknownKeys,
    Catchall
  >;
  partial<
    Mask extends util.Exactly<
      {
        [k in keyof T]?: true;
      },
      Mask
    >
  >(
    mask: Mask
  ): ZodObject<
    objectUtil.noNever<{
      [k in keyof T]: k extends keyof Mask ? ZodOptional<T[k]> : T[k];
    }>,
    UnknownKeys,
    Catchall
  >;
  required(): ZodObject<
    {
      [k in keyof T]: deoptional<T[k]>;
    },
    UnknownKeys,
    Catchall
  >;
  required<
    Mask extends util.Exactly<
      {
        [k in keyof T]?: true;
      },
      Mask
    >
  >(
    mask: Mask
  ): ZodObject<
    objectUtil.noNever<{
      [k in keyof T]: k extends keyof Mask ? deoptional<T[k]> : T[k];
    }>,
    UnknownKeys,
    Catchall
  >;
  keyof(): ZodEnum<enumUtil.UnionToTupleString<keyof T>>;
  static create: <Shape extends ZodRawShape>(
    shape: Shape,
    params?: RawCreateParams
  ) => ZodObject<
    Shape,
    'strip',
    ZodTypeAny,
    objectOutputType<Shape, ZodTypeAny, 'strip'>,
    objectInputType<Shape, ZodTypeAny, 'strip'>
  >;
  static strictCreate: <Shape extends ZodRawShape>(
    shape: Shape,
    params?: RawCreateParams
  ) => ZodObject<Shape, 'strict'>;
  static lazycreate: <Shape extends ZodRawShape>(
    shape: () => Shape,
    params?: RawCreateParams
  ) => ZodObject<Shape, 'strip'>;
}

export declare interface ZodObjectDef<
  T extends ZodRawShape = ZodRawShape,
  UnknownKeys extends UnknownKeysParam = UnknownKeysParam,
  Catchall extends ZodTypeAny = ZodTypeAny
> extends ZodTypeDef {
  typeName: ZodFirstPartyTypeKind.ZodObject;
  shape: () => T;
  catchall: Catchall;
  unknownKeys: UnknownKeys;
}

export declare class ZodOptional<T extends ZodTypeAny> extends ZodType<
  T['_output'] | undefined,
  ZodOptionalDef<T>,
  T['_input'] | undefined
> {
  _parse(input: ParseInput): ParseReturnType<this['_output']>;
  unwrap(): T;
  static create: <Inner extends ZodTypeAny>(type: Inner, params?: RawCreateParams) => ZodOptional<Inner>;
}

export declare interface ZodOptionalDef<T extends ZodTypeAny = ZodTypeAny> extends ZodTypeDef {
  innerType: T;
  typeName: ZodFirstPartyTypeKind.ZodOptional;
}

export declare type ZodOptionalType<T extends ZodTypeAny> = ZodOptional<T>;

export declare const ZodParsedType: {
  string: 'string';
  nan: 'nan';
  number: 'number';
  integer: 'integer';
  float: 'float';
  boolean: 'boolean';
  date: 'date';
  bigint: 'bigint';
  symbol: 'symbol';
  function: 'function';
  undefined: 'undefined';
  null: 'null';
  array: 'array';
  object: 'object';
  unknown: 'unknown';
  promise: 'promise';
  void: 'void';
  never: 'never';
  map: 'map';
  set: 'set';
};

export declare type ZodParsedType = keyof typeof ZodParsedType;

export declare class ZodPipeline<A extends ZodTypeAny, B extends ZodTypeAny> extends ZodType<
  B['_output'],
  ZodPipelineDef<A, B>,
  A['_input']
> {
  _parse(input: ParseInput): ParseReturnType<any>;
  static create<ASchema extends ZodTypeAny, BSchema extends ZodTypeAny>(
    a: ASchema,
    b: BSchema
  ): ZodPipeline<ASchema, BSchema>;
}

export declare interface ZodPipelineDef<A extends ZodTypeAny, B extends ZodTypeAny> extends ZodTypeDef {
  in: A;
  out: B;
  typeName: ZodFirstPartyTypeKind.ZodPipeline;
}

export declare class ZodPromise<T extends ZodTypeAny> extends ZodType<
  Promise<T['_output']>,
  ZodPromiseDef<T>,
  Promise<T['_input']>
> {
  unwrap(): T;
  _parse(input: ParseInput): ParseReturnType<this['_output']>;
  static create: <Inner extends ZodTypeAny>(schema: Inner, params?: RawCreateParams) => ZodPromise<Inner>;
}

export declare interface ZodPromiseDef<T extends ZodTypeAny = ZodTypeAny> extends ZodTypeDef {
  type: T;
  typeName: ZodFirstPartyTypeKind.ZodPromise;
}

export declare type ZodRawShape = {
  [k: string]: ZodTypeAny;
};

export declare class ZodReadonly<T extends ZodTypeAny> extends ZodType<
  MakeReadonly<T['_output']>,
  ZodReadonlyDef<T>,
  MakeReadonly<T['_input']>
> {
  _parse(input: ParseInput): ParseReturnType<this['_output']>;
  static create: <Inner extends ZodTypeAny>(type: Inner, params?: RawCreateParams) => ZodReadonly<Inner>;
  unwrap(): T;
}

export declare interface ZodReadonlyDef<T extends ZodTypeAny = ZodTypeAny> extends ZodTypeDef {
  innerType: T;
  typeName: ZodFirstPartyTypeKind.ZodReadonly;
}

export declare class ZodRecord<
  Key extends KeySchema = ZodString,
  Value extends ZodTypeAny = ZodTypeAny
> extends ZodType<
  RecordType<Key['_output'], Value['_output']>,
  ZodRecordDef<Key, Value>,
  RecordType<Key['_input'], Value['_input']>
> {
  get keySchema(): Key;
  get valueSchema(): Value;
  _parse(input: ParseInput): ParseReturnType<this['_output']>;
  get element(): Value;
  static create<Value extends ZodTypeAny>(valueType: Value, params?: RawCreateParams): ZodRecord<ZodString, Value>;
  static create<Keys extends KeySchema, Value extends ZodTypeAny>(
    keySchema: Keys,
    valueType: Value,
    params?: RawCreateParams
  ): ZodRecord<Keys, Value>;
}

export declare interface ZodRecordDef<Key extends KeySchema = ZodString, Value extends ZodTypeAny = ZodTypeAny>
  extends ZodTypeDef {
  valueType: Value;
  keyType: Key;
  typeName: ZodFirstPartyTypeKind.ZodRecord;
}

export declare class ZodSet<Value extends ZodTypeAny = ZodTypeAny> extends ZodType<
  Set<Value['_output']>,
  ZodSetDef<Value>,
  Set<Value['_input']>
> {
  _parse(input: ParseInput): ParseReturnType<this['_output']>;
  min(minSize: number, message?: errorUtil.ErrMessage): this;
  max(maxSize: number, message?: errorUtil.ErrMessage): this;
  size(size: number, message?: errorUtil.ErrMessage): this;
  nonempty(message?: errorUtil.ErrMessage): ZodSet<Value>;
  static create: <ValueSchema extends ZodTypeAny = ZodTypeAny>(
    valueType: ValueSchema,
    params?: RawCreateParams
  ) => ZodSet<ValueSchema>;
}

export declare interface ZodSetDef<Value extends ZodTypeAny = ZodTypeAny> extends ZodTypeDef {
  valueType: Value;
  typeName: ZodFirstPartyTypeKind.ZodSet;
  minSize: {
    value: number;
    message?: string | undefined;
  } | null;
  maxSize: {
    value: number;
    message?: string | undefined;
  } | null;
}

export declare class ZodString extends ZodType<string, ZodStringDef, string> {
  _parse(input: ParseInput): ParseReturnType<string>;
  protected _regex(
    regex: RegExp,
    validation: StringValidation,
    message?: errorUtil.ErrMessage
  ): ZodEffects<this, string, string>;
  _addCheck(check: ZodStringCheck): ZodString;
  email(message?: errorUtil.ErrMessage): ZodString;
  url(message?: errorUtil.ErrMessage): ZodString;
  emoji(message?: errorUtil.ErrMessage): ZodString;
  uuid(message?: errorUtil.ErrMessage): ZodString;
  nanoid(message?: errorUtil.ErrMessage): ZodString;
  cuid(message?: errorUtil.ErrMessage): ZodString;
  cuid2(message?: errorUtil.ErrMessage): ZodString;
  ulid(message?: errorUtil.ErrMessage): ZodString;
  base64(message?: errorUtil.ErrMessage): ZodString;
  base64url(message?: errorUtil.ErrMessage): ZodString;
  jwt(options?: { alg?: string; message?: string | undefined }): ZodString;
  ip(
    options?:
      | string
      | {
          version?: IpVersion;
          message?: string | undefined;
        }
  ): ZodString;
  cidr(
    options?:
      | string
      | {
          version?: IpVersion;
          message?: string | undefined;
        }
  ): ZodString;
  datetime(
    options?:
      | string
      | {
          message?: string | undefined;
          precision?: number | null;
          offset?: boolean;
          local?: boolean;
        }
  ): ZodString;
  date(message?: string): ZodString;
  time(
    options?:
      | string
      | {
          message?: string | undefined;
          precision?: number | null;
        }
  ): ZodString;
  duration(message?: errorUtil.ErrMessage): ZodString;
  regex(regex: RegExp, message?: errorUtil.ErrMessage): ZodString;
  includes(
    value: string,
    options?: {
      message?: string;
      position?: number;
    }
  ): ZodString;
  startsWith(value: string, message?: errorUtil.ErrMessage): ZodString;
  endsWith(value: string, message?: errorUtil.ErrMessage): ZodString;
  min(minLength: number, message?: errorUtil.ErrMessage): ZodString;
  max(maxLength: number, message?: errorUtil.ErrMessage): ZodString;
  length(len: number, message?: errorUtil.ErrMessage): ZodString;
  /**
   * Equivalent to `.min(1)`
   */
  nonempty(message?: errorUtil.ErrMessage): ZodString;
  trim(): ZodString;
  toLowerCase(): ZodString;
  toUpperCase(): ZodString;
  get isDatetime(): boolean;
  get isDate(): boolean;
  get isTime(): boolean;
  get isDuration(): boolean;
  get isEmail(): boolean;
  get isURL(): boolean;
  get isEmoji(): boolean;
  get isUUID(): boolean;
  get isNANOID(): boolean;
  get isCUID(): boolean;
  get isCUID2(): boolean;
  get isULID(): boolean;
  get isIP(): boolean;
  get isCIDR(): boolean;
  get isBase64(): boolean;
  get isBase64url(): boolean;
  get minLength(): number | null;
  get maxLength(): number | null;
  static create: (
    params?: RawCreateParams & {
      coerce?: true;
    }
  ) => ZodString;
}

export declare type ZodStringCheck =
  | {
      kind: 'min';
      value: number;
      message?: string | undefined;
    }
  | {
      kind: 'max';
      value: number;
      message?: string | undefined;
    }
  | {
      kind: 'length';
      value: number;
      message?: string | undefined;
    }
  | {
      kind: 'email';
      message?: string | undefined;
    }
  | {
      kind: 'url';
      message?: string | undefined;
    }
  | {
      kind: 'emoji';
      message?: string | undefined;
    }
  | {
      kind: 'uuid';
      message?: string | undefined;
    }
  | {
      kind: 'nanoid';
      message?: string | undefined;
    }
  | {
      kind: 'cuid';
      message?: string | undefined;
    }
  | {
      kind: 'includes';
      value: string;
      position?: number | undefined;
      message?: string | undefined;
    }
  | {
      kind: 'cuid2';
      message?: string | undefined;
    }
  | {
      kind: 'ulid';
      message?: string | undefined;
    }
  | {
      kind: 'startsWith';
      value: string;
      message?: string | undefined;
    }
  | {
      kind: 'endsWith';
      value: string;
      message?: string | undefined;
    }
  | {
      kind: 'regex';
      regex: RegExp;
      message?: string | undefined;
    }
  | {
      kind: 'trim';
      message?: string | undefined;
    }
  | {
      kind: 'toLowerCase';
      message?: string | undefined;
    }
  | {
      kind: 'toUpperCase';
      message?: string | undefined;
    }
  | {
      kind: 'jwt';
      alg?: string;
      message?: string | undefined;
    }
  | {
      kind: 'datetime';
      offset: boolean;
      local: boolean;
      precision: number | null;
      message?: string | undefined;
    }
  | {
      kind: 'date';
      message?: string | undefined;
    }
  | {
      kind: 'time';
      precision: number | null;
      message?: string | undefined;
    }
  | {
      kind: 'duration';
      message?: string | undefined;
    }
  | {
      kind: 'ip';
      version?: IpVersion | undefined;
      message?: string | undefined;
    }
  | {
      kind: 'cidr';
      version?: IpVersion | undefined;
      message?: string | undefined;
    }
  | {
      kind: 'base64';
      message?: string | undefined;
    }
  | {
      kind: 'base64url';
      message?: string | undefined;
    };

export declare interface ZodStringDef extends ZodTypeDef {
  checks: ZodStringCheck[];
  typeName: ZodFirstPartyTypeKind.ZodString;
  coerce: boolean;
}

export declare class ZodSymbol extends ZodType<symbol, ZodSymbolDef, symbol> {
  _parse(input: ParseInput): ParseReturnType<this['_output']>;
  static create: (params?: RawCreateParams) => ZodSymbol;
}

export declare interface ZodSymbolDef extends ZodTypeDef {
  typeName: ZodFirstPartyTypeKind.ZodSymbol;
}

export declare interface ZodTooBigIssue extends ZodIssueBase {
  code: typeof ZodIssueCode.too_big;
  maximum: number | bigint;
  inclusive: boolean;
  exact?: boolean;
  type: 'array' | 'string' | 'number' | 'set' | 'date' | 'bigint';
}

export declare interface ZodTooSmallIssue extends ZodIssueBase {
  code: typeof ZodIssueCode.too_small;
  minimum: number | bigint;
  inclusive: boolean;
  exact?: boolean;
  type: 'array' | 'string' | 'number' | 'set' | 'date' | 'bigint';
}

export declare class ZodTuple<
  T extends ZodTupleItems | [] = ZodTupleItems,
  Rest extends ZodTypeAny | null = null
> extends ZodType<OutputTypeOfTupleWithRest<T, Rest>, ZodTupleDef<T, Rest>, InputTypeOfTupleWithRest<T, Rest>> {
  _parse(input: ParseInput): ParseReturnType<this['_output']>;
  get items(): T;
  rest<RestSchema extends ZodTypeAny>(rest: RestSchema): ZodTuple<T, RestSchema>;
  static create: <Items extends [ZodTypeAny, ...ZodTypeAny[]] | []>(
    schemas: Items,
    params?: RawCreateParams
  ) => ZodTuple<Items, null>;
}

export declare interface ZodTupleDef<
  T extends ZodTupleItems | [] = ZodTupleItems,
  Rest extends ZodTypeAny | null = null
> extends ZodTypeDef {
  items: T;
  rest: Rest;
  typeName: ZodFirstPartyTypeKind.ZodTuple;
}

export declare type ZodTupleItems = [ZodTypeAny, ...ZodTypeAny[]];

declare abstract class ZodType<Output = any, Def extends ZodTypeDef = ZodTypeDef, Input = Output> {
  readonly _type: Output;
  readonly _output: Output;
  readonly _input: Input;
  readonly _def: Def;
  get description(): string | undefined;
  '~standard': StandardSchemaV1.Props<Input, Output>;
  abstract _parse(input: ParseInput): ParseReturnType<Output>;
  _getType(input: ParseInput): string;
  _getOrReturnCtx(input: ParseInput, ctx?: ParseContext): ParseContext;
  _processInputParams(input: ParseInput): {
    status: ParseStatus;
    ctx: ParseContext;
  };
  _parseSync(input: ParseInput): SyncParseReturnType<Output>;
  _parseAsync(input: ParseInput): AsyncParseReturnType<Output>;
  parse(data: unknown, params?: util.InexactPartial<ParseParams>): Output;
  safeParse(data: unknown, params?: util.InexactPartial<ParseParams>): SafeParseReturnType<Input, Output>;
  '~validate'(data: unknown): StandardSchemaV1.Result<Output> | Promise<StandardSchemaV1.Result<Output>>;
  parseAsync(data: unknown, params?: util.InexactPartial<ParseParams>): Promise<Output>;
  safeParseAsync(data: unknown, params?: util.InexactPartial<ParseParams>): Promise<SafeParseReturnType<Input, Output>>;
  /** Alias of safeParseAsync */
  spa: (data: unknown, params?: util.InexactPartial<ParseParams>) => Promise<SafeParseReturnType<Input, Output>>;
  refine<RefinedOutput extends Output>(
    check: (arg: Output) => arg is RefinedOutput,
    message?: string | CustomErrorParams | ((arg: Output) => CustomErrorParams)
  ): ZodEffects<this, RefinedOutput, Input>;
  refine(
    check: (arg: Output) => unknown | Promise<unknown>,
    message?: string | CustomErrorParams | ((arg: Output) => CustomErrorParams)
  ): ZodEffects<this, Output, Input>;
  refinement<RefinedOutput extends Output>(
    check: (arg: Output) => arg is RefinedOutput,
    refinementData: IssueData | ((arg: Output, ctx: RefinementCtx) => IssueData)
  ): ZodEffects<this, RefinedOutput, Input>;
  refinement(
    check: (arg: Output) => boolean,
    refinementData: IssueData | ((arg: Output, ctx: RefinementCtx) => IssueData)
  ): ZodEffects<this, Output, Input>;
  _refinement(refinement: RefinementEffect<Output>['refinement']): ZodEffects<this, Output, Input>;
  superRefine<RefinedOutput extends Output>(
    refinement: (arg: Output, ctx: RefinementCtx) => arg is RefinedOutput
  ): ZodEffects<this, RefinedOutput, Input>;
  superRefine(refinement: (arg: Output, ctx: RefinementCtx) => void): ZodEffects<this, Output, Input>;
  superRefine(refinement: (arg: Output, ctx: RefinementCtx) => Promise<void>): ZodEffects<this, Output, Input>;
  constructor(def: Def);
  optional(): ZodOptional<this>;
  nullable(): ZodNullable<this>;
  nullish(): ZodOptional<ZodNullable<this>>;
  array(): ZodArray<this>;
  promise(): ZodPromise<this>;
  or<T extends ZodTypeAny>(option: T): ZodUnion<[this, T]>;
  and<T extends ZodTypeAny>(incoming: T): ZodIntersection<this, T>;
  transform<NewOut>(transform: (arg: Output, ctx: RefinementCtx) => NewOut | Promise<NewOut>): ZodEffects<this, NewOut>;
  default(def: util.noUndefined<Input>): ZodDefault<this>;
  default(def: () => util.noUndefined<Input>): ZodDefault<this>;
  brand<B extends string | number | symbol>(brand?: B): ZodBranded<this, B>;
  catch(def: Output): ZodCatch<this>;
  catch(def: (ctx: { error: ZodError; input: Input }) => Output): ZodCatch<this>;
  describe(description: string): this;
  pipe<T extends ZodTypeAny>(target: T): ZodPipeline<this, T>;
  readonly(): ZodReadonly<this>;
  isOptional(): boolean;
  isNullable(): boolean;
}
export { ZodType as Schema };
export { ZodType as ZodSchema };
export { ZodType };

export declare type ZodTypeAny = ZodType<any, any, any>;

export declare interface ZodTypeDef {
  errorMap?: ZodErrorMap | undefined;
  description?: string | undefined;
}

export declare class ZodUndefined extends ZodType<undefined, ZodUndefinedDef, undefined> {
  _parse(input: ParseInput): ParseReturnType<this['_output']>;
  params?: RawCreateParams;
  static create: (params?: RawCreateParams) => ZodUndefined;
}

export declare interface ZodUndefinedDef extends ZodTypeDef {
  typeName: ZodFirstPartyTypeKind.ZodUndefined;
}

export declare class ZodUnion<T extends ZodUnionOptions> extends ZodType<
  T[number]['_output'],
  ZodUnionDef<T>,
  T[number]['_input']
> {
  _parse(input: ParseInput): ParseReturnType<this['_output']>;
  get options(): T;
  static create: <Options extends Readonly<[ZodTypeAny, ZodTypeAny, ...ZodTypeAny[]]>>(
    types: Options,
    params?: RawCreateParams
  ) => ZodUnion<Options>;
}

export declare interface ZodUnionDef<T extends ZodUnionOptions = Readonly<[ZodTypeAny, ZodTypeAny, ...ZodTypeAny[]]>>
  extends ZodTypeDef {
  options: T;
  typeName: ZodFirstPartyTypeKind.ZodUnion;
}

export declare type ZodUnionOptions = Readonly<[ZodTypeAny, ...ZodTypeAny[]]>;

export declare class ZodUnknown extends ZodType<unknown, ZodUnknownDef, unknown> {
  _unknown: true;
  _parse(input: ParseInput): ParseReturnType<this['_output']>;
  static create: (params?: RawCreateParams) => ZodUnknown;
}

export declare interface ZodUnknownDef extends ZodTypeDef {
  typeName: ZodFirstPartyTypeKind.ZodUnknown;
}

export declare interface ZodUnrecognizedKeysIssue extends ZodIssueBase {
  code: typeof ZodIssueCode.unrecognized_keys;
  keys: string[];
}

export declare class ZodVoid extends ZodType<void, ZodVoidDef, void> {
  _parse(input: ParseInput): ParseReturnType<this['_output']>;
  static create: (params?: RawCreateParams) => ZodVoid;
}

export declare interface ZodVoidDef extends ZodTypeDef {
  typeName: ZodFirstPartyTypeKind.ZodVoid;
}

declare namespace z {
  export {
    setErrorMap,
    getErrorMap,
    defaultErrorMap,
    addIssueToContext,
    makeIssue,
    ParseParams,
    ParsePathComponent,
    ParsePath,
    EMPTY_PATH,
    ParseContext,
    ParseInput,
    ObjectPair,
    ParseStatus,
    ParseResult,
    INVALID,
    DIRTY,
    OK,
    SyncParseReturnType,
    AsyncParseReturnType,
    ParseReturnType,
    isAborted,
    isDirty,
    isValid,
    isAsync,
    Primitive,
    Scalars,
    util,
    objectUtil,
    ZodParsedType,
    getParsedType,
    datetimeRegex,
    custom,
    RefinementCtx,
    ZodRawShape,
    ZodTypeAny,
    TypeOf,
    input,
    output,
    TypeOf as infer,
    CustomErrorParams,
    ZodTypeDef,
    RawCreateParams,
    ProcessedCreateParams,
    SafeParseSuccess,
    SafeParseError,
    SafeParseReturnType,
    ZodType,
    IpVersion,
    ZodStringCheck,
    ZodStringDef,
    ZodString,
    ZodNumberCheck,
    ZodNumberDef,
    ZodNumber,
    ZodBigIntCheck,
    ZodBigIntDef,
    ZodBigInt,
    ZodBooleanDef,
    ZodBoolean,
    ZodDateCheck,
    ZodDateDef,
    ZodDate,
    ZodSymbolDef,
    ZodSymbol,
    ZodUndefinedDef,
    ZodUndefined,
    ZodNullDef,
    ZodNull,
    ZodAnyDef,
    ZodAny,
    ZodUnknownDef,
    ZodUnknown,
    ZodNeverDef,
    ZodNever,
    ZodVoidDef,
    ZodVoid,
    ZodArrayDef,
    ArrayCardinality,
    arrayOutputType,
    ZodArray,
    ZodNonEmptyArray,
    UnknownKeysParam,
    ZodObjectDef,
    mergeTypes,
    objectOutputType,
    baseObjectOutputType,
    objectInputType,
    baseObjectInputType,
    CatchallOutput,
    CatchallInput,
    PassthroughType,
    deoptional,
    SomeZodObject,
    noUnrecognized,
    ZodObject,
    AnyZodObject,
    ZodUnionOptions,
    ZodUnionDef,
    ZodUnion,
    ZodDiscriminatedUnionOption,
    ZodDiscriminatedUnionDef,
    ZodDiscriminatedUnion,
    ZodIntersectionDef,
    ZodIntersection,
    ZodTupleItems,
    AssertArray,
    OutputTypeOfTuple,
    OutputTypeOfTupleWithRest,
    InputTypeOfTuple,
    InputTypeOfTupleWithRest,
    ZodTupleDef,
    AnyZodTuple,
    ZodTuple,
    ZodRecordDef,
    KeySchema,
    RecordType,
    ZodRecord,
    ZodMapDef,
    ZodMap,
    ZodSetDef,
    ZodSet,
    ZodFunctionDef,
    OuterTypeOfFunction,
    InnerTypeOfFunction,
    ZodFunction,
    ZodLazyDef,
    ZodLazy,
    ZodLiteralDef,
    ZodLiteral,
    ArrayKeys,
    Indices,
    EnumValues,
    Values,
    ZodEnumDef,
    Writeable,
    FilterEnum,
    typecast,
    ZodEnum,
    ZodNativeEnumDef,
    EnumLike,
    ZodNativeEnum,
    ZodPromiseDef,
    ZodPromise,
    Refinement,
    SuperRefinement,
    RefinementEffect,
    TransformEffect,
    PreprocessEffect,
    Effect,
    ZodEffectsDef,
    ZodEffects,
    ZodEffects as ZodTransformer,
    ZodOptionalDef,
    ZodOptionalType,
    ZodOptional,
    ZodNullableDef,
    ZodNullableType,
    ZodNullable,
    ZodDefaultDef,
    ZodDefault,
    ZodCatchDef,
    ZodCatch,
    ZodNaNDef,
    ZodNaN,
    ZodBrandedDef,
    BRAND,
    ZodBranded,
    ZodPipelineDef,
    ZodPipeline,
    ZodReadonlyDef,
    ZodReadonly,
    ZodType as Schema,
    ZodType as ZodSchema,
    late,
    ZodFirstPartyTypeKind,
    ZodFirstPartySchemaTypes,
    coerce,
    any,
    array,
    bigint,
    boolean,
    date,
    discriminatedUnion,
    effectsType as effect,
    enumType as enum,
    functionType as function,
    instanceofType as instanceof,
    intersection,
    lazy,
    literal,
    map,
    nan,
    nativeEnum,
    never,
    nullType as null,
    nullable,
    number,
    object,
    oboolean,
    onumber,
    optional,
    ostring,
    pipeline,
    preprocess,
    promise,
    record,
    set,
    strictObject,
    string,
    symbol,
    effectsType as transformer,
    tuple,
    undefined_2 as undefined,
    union,
    unknown,
    voidType as void,
    NEVER,
    inferFlattenedErrors,
    typeToFlattenedError,
    ZodIssueCode,
    ZodIssueBase,
    ZodInvalidTypeIssue,
    ZodInvalidLiteralIssue,
    ZodUnrecognizedKeysIssue,
    ZodInvalidUnionIssue,
    ZodInvalidUnionDiscriminatorIssue,
    ZodInvalidEnumValueIssue,
    ZodInvalidArgumentsIssue,
    ZodInvalidReturnTypeIssue,
    ZodInvalidDateIssue,
    StringValidation,
    ZodInvalidStringIssue,
    ZodTooSmallIssue,
    ZodTooBigIssue,
    ZodInvalidIntersectionTypesIssue,
    ZodNotMultipleOfIssue,
    ZodNotFiniteIssue,
    ZodCustomIssue,
    DenormalizedError,
    ZodIssueOptionalMessage,
    ZodIssue,
    quotelessJson,
    ZodFormattedError,
    inferFormattedError,
    ZodError,
    IssueData,
    ErrorMapCtx,
    ZodErrorMap
  };
}

export { z };

export default z;
