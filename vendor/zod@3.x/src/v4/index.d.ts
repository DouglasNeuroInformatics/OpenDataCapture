declare global {
  interface File {}
}

export declare namespace z {
  export namespace core {
    // CORE

    namespace core {
      type ZodTrait = {
        _zod: {
          def: any;
          [k: string]: any;
        };
      };

      export interface $constructor<T extends ZodTrait, D = T['_zod']['def']> {
        new (def: D): T;
        init(inst: T, def: D): asserts inst is T;
      }

      export function $constructor<T extends ZodTrait, D = T['_zod']['def']>(
        name: string,
        initializer: (inst: T, def: D) => void,
        params?: {
          Parent?: typeof util.Class;
        }
      ): $constructor<T, D>;

      export const $brand: unique symbol;

      export type $brand<T extends string | number | symbol = string | number | symbol> = {
        [$brand]: {
          [k in T]: true;
        };
      };

      export type $ZodBranded<T extends schemas.$ZodType, Brand extends string | number | symbol> = T &
        Record<'_zod', Record<'~output', output<T> & $brand<Brand>>>;

      export class $ZodAsyncError extends Error {
        constructor();
      }

      export type input<T extends schemas.$ZodType> = T['_zod'] extends {
        '~input': any;
      }
        ? T['_zod']['~input']
        : T['_zod']['input'];

      export type output<T extends schemas.$ZodType> = T['_zod'] extends {
        '~output': any;
      }
        ? T['_zod']['~output']
        : T['_zod']['output'];

      export interface $ZodConfig {
        /** Custom error map. Overrides `config().localeError`. */
        customError?: errors.$ZodErrorMap | undefined;
        /** Localized error map. Lowest priority. */
        localeError?: errors.$ZodErrorMap | undefined;
        /** Disable JIT schema compilation. Useful in environments that disallow `eval`. */
        jitless?: boolean | undefined;
      }

      export const globalConfig: $ZodConfig;

      export function config(newConfig?: Partial<$ZodConfig>): $ZodConfig;
    }

    export import $constructor = core.$constructor;
    export import $brand = core.$brand;
    export import $ZodBranded = core.$ZodBranded;
    export import $ZodAsyncError = core.$ZodAsyncError;
    export import input = core.input;
    export import output = core.output;
    export import infer = core.output;
    export import $ZodConfig = core.$ZodConfig;
    export import globalConfig = core.globalConfig;
    export import config = core.config;

    // PARSE

    namespace parse {
      export type $ZodErrorClass = {
        new (issues: errors.$ZodIssue[]): errors.$ZodError;
      };
      export type $Parse = <T extends schemas.$ZodType>(
        schema: T,
        value: unknown,
        _ctx?: schemas.ParseContext<errors.$ZodIssue>,
        _params?: {
          callee?: util.AnyFunc;
          Err?: $ZodErrorClass;
        }
      ) => core.output<T>;
      export const _parse: (_Err: $ZodErrorClass) => $Parse;
      export const parse: $Parse;
      export type $ParseAsync = <T extends schemas.$ZodType>(
        schema: T,
        value: unknown,
        _ctx?: schemas.ParseContext<errors.$ZodIssue>,
        _params?: {
          callee?: util.AnyFunc;
          Err?: $ZodErrorClass;
        }
      ) => Promise<core.output<T>>;
      export const _parseAsync: (_Err: $ZodErrorClass) => $ParseAsync;
      export const parseAsync: $ParseAsync;
      export type $SafeParse = <T extends schemas.$ZodType>(
        schema: T,
        value: unknown,
        _ctx?: schemas.ParseContext<errors.$ZodIssue>
      ) => util.SafeParseResult<core.output<T>>;
      export const _safeParse: (_Err: $ZodErrorClass) => $SafeParse;
      export const safeParse: $SafeParse;
      export type $SafeParseAsync = <T extends schemas.$ZodType>(
        schema: T,
        value: unknown,
        _ctx?: schemas.ParseContext<errors.$ZodIssue>
      ) => Promise<util.SafeParseResult<core.output<T>>>;
      export const _safeParseAsync: (_Err: $ZodErrorClass) => $SafeParseAsync;
      export const safeParseAsync: $SafeParseAsync;
    }

    export import $ZodErrorClass = parse.$ZodErrorClass;
    export import $Parse = parse.$Parse;
    export import _parse = parse._parse;
    export import $ParseAsync = parse.$ParseAsync;
    export import _parseAsync = parse._parseAsync;
    export import parseAsync = parse.parseAsync;
    export import $SafeParse = parse.$SafeParse;
    export import _safeParse = parse._safeParse;
    export import safeParse = parse.safeParse;
    export import $SafeParseAsync = parse.$SafeParseAsync;
    export import _safeParseAsync = parse._safeParseAsync;
    export import safeParseAsync = parse.safeParseAsync;

    const __parse: typeof parse.parse;
    export { __parse as parse };

    // ERRORS

    namespace errors {
      interface $ZodIssueBase {
        readonly code?: string;
        readonly input?: unknown;
        readonly path: PropertyKey[];
        readonly message: string;
      }

      interface $ZodIssueInvalidType<Input = unknown> extends $ZodIssueBase {
        readonly code: 'invalid_type';
        readonly expected: schemas.$ZodType['_zod']['def']['type'];
        readonly input: Input;
      }

      interface $ZodIssueTooBig<Input = unknown> extends $ZodIssueBase {
        readonly code: 'too_big';
        readonly origin: 'number' | 'int' | 'bigint' | 'date' | 'string' | 'array' | 'set' | 'file' | (string & {});
        readonly maximum: number | bigint;
        readonly inclusive?: boolean;
        readonly input: Input;
      }

      interface $ZodIssueTooSmall<Input = unknown> extends $ZodIssueBase {
        readonly code: 'too_small';
        readonly origin: 'number' | 'int' | 'bigint' | 'date' | 'string' | 'array' | 'set' | 'file' | (string & {});
        readonly minimum: number | bigint;
        readonly inclusive?: boolean;
        readonly input: Input;
      }

      interface $ZodIssueInvalidStringFormat extends $ZodIssueBase {
        readonly code: 'invalid_format';
        readonly format: $ZodStringFormats | (string & {});
        readonly pattern?: string;
        readonly input: string;
      }

      interface $ZodIssueNotMultipleOf<Input extends number | bigint = number | bigint> extends $ZodIssueBase {
        readonly code: 'not_multiple_of';
        readonly divisor: number;
        readonly input: Input;
      }

      interface $ZodIssueUnrecognizedKeys extends $ZodIssueBase {
        readonly code: 'unrecognized_keys';
        readonly keys: string[];
        readonly input: Record<string, unknown>;
      }

      interface $ZodIssueInvalidUnion extends $ZodIssueBase {
        readonly code: 'invalid_union';
        readonly errors: $ZodIssue[][];
        readonly input: unknown;
      }

      interface $ZodIssueInvalidKey<Input = unknown> extends $ZodIssueBase {
        readonly code: 'invalid_key';
        readonly origin: 'map' | 'record';
        readonly issues: $ZodIssue[];
        readonly input: Input;
      }

      interface $ZodIssueInvalidElement<Input = unknown> extends $ZodIssueBase {
        readonly code: 'invalid_element';
        readonly origin: 'map' | 'set';
        readonly key: unknown;
        readonly issues: $ZodIssue[];
        readonly input: Input;
      }

      interface $ZodIssueInvalidValue<Input = unknown> extends $ZodIssueBase {
        readonly code: 'invalid_value';
        readonly values: util.Primitive[];
        readonly input: Input;
      }

      interface $ZodIssueCustom extends $ZodIssueBase {
        readonly code: 'custom';
        readonly params?: Record<string, any> | undefined;
        readonly input: unknown;
      }

      interface $ZodIssueStringCommonFormats extends $ZodIssueInvalidStringFormat {
        format: Exclude<$ZodStringFormats, 'regex' | 'jwt' | 'starts_with' | 'ends_with' | 'includes'>;
      }

      interface $ZodIssueStringInvalidRegex extends $ZodIssueInvalidStringFormat {
        format: 'regex';
        pattern: string;
      }

      interface $ZodIssueStringInvalidJWT extends $ZodIssueInvalidStringFormat {
        format: 'jwt';
        algorithm?: string;
      }

      interface $ZodIssueStringStartsWith extends $ZodIssueInvalidStringFormat {
        format: 'starts_with';
        prefix: string;
      }

      interface $ZodIssueStringEndsWith extends $ZodIssueInvalidStringFormat {
        format: 'ends_with';
        suffix: string;
      }

      interface $ZodIssueStringIncludes extends $ZodIssueInvalidStringFormat {
        format: 'includes';
        includes: string;
      }

      type $ZodStringFormatIssues =
        | $ZodIssueStringCommonFormats
        | $ZodIssueStringInvalidRegex
        | $ZodIssueStringInvalidJWT
        | $ZodIssueStringStartsWith
        | $ZodIssueStringEndsWith
        | $ZodIssueStringIncludes;

      type $ZodIssue =
        | $ZodIssueInvalidType
        | $ZodIssueTooBig
        | $ZodIssueTooSmall
        | $ZodIssueInvalidStringFormat
        | $ZodIssueNotMultipleOf
        | $ZodIssueUnrecognizedKeys
        | $ZodIssueInvalidUnion
        | $ZodIssueInvalidKey
        | $ZodIssueInvalidElement
        | $ZodIssueInvalidValue
        | $ZodIssueCustom;

      type $ZodIssueCode = $ZodIssue['code'];

      type $ZodRawIssue<T extends $ZodIssueBase = $ZodIssue> = T extends any ? RawIssue<T> : never;
      type RawIssue<T extends $ZodIssueBase> = util.Flatten<
        util.MakePartial<T, 'message' | 'path'> & {
          /** The input data */
          readonly input?: unknown;
          /** The schema or check that originated this issue. */
          readonly inst?: schemas.$ZodType | checks.$ZodCheck;
          /** @deprecated Internal use only. If `true`, Zod will continue executing validation despite this issue. */
          readonly continue?: boolean | undefined;
        } & Record<string, any>
      >;

      interface $ZodErrorMap<T extends $ZodIssueBase = $ZodIssue> {
        (issue: $ZodRawIssue<T>):
          | {
              message: string;
            }
          | string
          | undefined
          | null;
      }

      interface $ZodError<T = unknown> extends Error {
        type: T;
        issues: $ZodIssue[];
        _zod: {
          output: T;
          def: $ZodIssue[];
        };
        stack?: string;
        name: string;
      }

      const $ZodError: $constructor<$ZodError>;

      interface $ZodRealError<T = any> extends $ZodError<T> {}
      const $ZodRealError: $constructor<$ZodRealError>;

      type $ZodFlattenedError<T, U = string> = _FlattenedError<T, U>;
      type _FlattenedError<T, U = string> = {
        formErrors: U[];
        fieldErrors: {
          [P in keyof T]?: U[];
        };
      };

      /** @deprecated Use `z.treeifyError()` instead. */
      function flattenError<T>(error: $ZodError<T>): _FlattenedError<T>;
      function flattenError<T, U>(error: $ZodError<T>, mapper?: (issue: $ZodIssue) => U): _FlattenedError<T, U>;

      type _ZodFormattedError<T, U = string> = T extends [any, ...any[]]
        ? {
            [K in keyof T]?: $ZodFormattedError<T[K], U>;
          }
        : T extends any[]
          ? {
              [k: number]: $ZodFormattedError<T[number], U>;
            }
          : T extends object
            ? util.Flatten<{
                [K in keyof T]?: $ZodFormattedError<T[K], U>;
              }>
            : any;

      type $ZodFormattedError<T, U = string> = {
        _errors: U[];
      } & util.Flatten<_ZodFormattedError<T, U>>;

      function formatError<T>(error: $ZodError<T>): $ZodFormattedError<T>;
      function formatError<T, U>(error: $ZodError<T>, mapper?: (issue: $ZodIssue) => U): $ZodFormattedError<T, U>;

      type $ZodErrorTree<T, U = string> = T extends [any, ...any[]]
        ? {
            errors: U[];
            items?: {
              [K in keyof T]?: $ZodErrorTree<T[K], U>;
            };
          }
        : T extends any[]
          ? {
              errors: U[];
              items?: Array<$ZodErrorTree<T[number], U>>;
            }
          : T extends object
            ? {
                errors: U[];
                properties?: {
                  [K in keyof T]?: $ZodErrorTree<T[K], U>;
                };
              }
            : {
                errors: U[];
              };

      function treeifyError<T>(error: $ZodError<T>): $ZodErrorTree<T>;
      function treeifyError<T, U>(error: $ZodError<T>, mapper?: (issue: $ZodIssue) => U): $ZodErrorTree<T, U>;

      /** Format a ZodError as a human-readable string in the following form.
       *
       * From
       *
       * ```ts
       * ZodError {
       *   issues: [
       *     {
       *       expected: 'string',
       *       code: 'invalid_type',
       *       path: [ 'username' ],
       *       message: 'Invalid input: expected string'
       *     },
       *     {
       *       expected: 'number',
       *       code: 'invalid_type',
       *       path: [ 'favoriteNumbers', 1 ],
       *       message: 'Invalid input: expected number'
       *     }
       *   ];
       * }
       * ```
       *
       * to
       *
       * ```
       * username
       *   ✖ Expected number, received string at "username
       * favoriteNumbers[0]
       *   ✖ Invalid input: expected number
       * ```
       */
      function toDotPath(path: (string | number | symbol)[]): string;

      interface BaseError {
        issues: $ZodIssueBase[];
      }

      function prettifyError(error: BaseError): string;
    }

    export import $ZodIssueBase = errors.$ZodIssueBase;
    export import $ZodIssueInvalidType = errors.$ZodIssueInvalidType;
    export import $ZodIssueTooBig = errors.$ZodIssueTooBig;
    export import $ZodIssueTooSmall = errors.$ZodIssueTooSmall;
    export import $ZodIssueInvalidStringFormat = errors.$ZodIssueInvalidStringFormat;
    export import $ZodIssueNotMultipleOf = errors.$ZodIssueNotMultipleOf;
    export import $ZodIssueUnrecognizedKeys = errors.$ZodIssueUnrecognizedKeys;
    export import $ZodIssueInvalidUnion = errors.$ZodIssueInvalidUnion;
    export import $ZodIssueInvalidKey = errors.$ZodIssueInvalidKey;
    export import $ZodIssueInvalidElement = errors.$ZodIssueInvalidElement;
    export import $ZodIssueInvalidValue = errors.$ZodIssueInvalidValue;
    export import $ZodIssueCustom = errors.$ZodIssueCustom;
    export import $ZodIssueStringCommonFormats = errors.$ZodIssueStringCommonFormats;
    export import $ZodIssueStringInvalidRegex = errors.$ZodIssueStringInvalidRegex;
    export import $ZodIssueStringInvalidJWT = errors.$ZodIssueStringInvalidJWT;
    export import $ZodIssueStringStartsWith = errors.$ZodIssueStringStartsWith;
    export import $ZodIssueStringEndsWith = errors.$ZodIssueStringEndsWith;
    export import $ZodIssueStringIncludes = errors.$ZodIssueStringIncludes;
    export import $ZodStringFormatIssues = errors.$ZodStringFormatIssues;
    export import $ZodIssue = errors.$ZodIssue;
    export import $ZodIssueCode = errors.$ZodIssueCode;
    export import $ZodRawIssue = errors.$ZodRawIssue;
    export import $ZodErrorMap = errors.$ZodErrorMap;
    export import $ZodError = errors.$ZodError;
    export import $ZodRealError = errors.$ZodRealError;
    export import $ZodFlattenedError = errors.$ZodFlattenedError;
    export import flattenError = errors.flattenError;
    export import $ZodFormattedError = errors.$ZodFormattedError;
    export import formatError = errors.formatError;
    export import $ZodErrorTree = errors.$ZodErrorTree;
    export import treeifyError = errors.treeifyError;
    export import toDotPath = errors.toDotPath;
    export import prettifyError = errors.prettifyError;

    // SCHEMAS

    namespace schemas {
      interface ParseContext<T extends errors.$ZodIssueBase = never> {
        /** Customize error messages. */
        readonly error?: errors.$ZodErrorMap<T>;
        /** Include the `input` field in issue objects. Default `false`. */
        readonly reportInput?: boolean;
        /** Skip eval-based fast path. Default `false`. */
        readonly jitless?: boolean;
      }

      /** @internal */
      interface ParseContextInternal<T extends errors.$ZodIssueBase = never> extends ParseContext<T> {
        readonly async?: boolean | undefined;
      }

      interface ParsePayload<T = unknown> {
        value: T;
        issues: errors.$ZodRawIssue[];
      }

      type CheckFn<T> = (input: ParsePayload<T>) => util.MaybeAsync<void>;

      interface $ZodTypeDef {
        type:
          | 'string'
          | 'number'
          | 'int'
          | 'boolean'
          | 'bigint'
          | 'symbol'
          | 'null'
          | 'undefined'
          | 'void'
          | 'never'
          | 'any'
          | 'unknown'
          | 'date'
          | 'object'
          | 'record'
          | 'file'
          | 'array'
          | 'tuple'
          | 'union'
          | 'intersection'
          | 'map'
          | 'set'
          | 'enum'
          | 'literal'
          | 'nullable'
          | 'optional'
          | 'nonoptional'
          | 'success'
          | 'transform'
          | 'default'
          | 'prefault'
          | 'catch'
          | 'nan'
          | 'pipe'
          | 'readonly'
          | 'template_literal'
          | 'promise'
          | 'lazy'
          | 'custom';
        error?: errors.$ZodErrorMap<never> | undefined;
        checks?: checks.$ZodCheck<never>[];
      }

      /** @internal */
      interface $ZodTypeInternals<out O = unknown, out I = unknown> {
        /** The `@zod/core` version of this schema */
        version: typeof version;
        /** Schema definition. */
        def: $ZodTypeDef;
        /** @internal Randomly generated ID for this schema. */
        id: string;
        /** @internal The inferred output type */
        output: O;
        /** @internal The inferred input type */
        input: I;
        /** @internal List of deferred initializers. */
        deferred: util.AnyFunc[] | undefined;
        /** @internal Parses input and runs all checks (refinements). */
        run(payload: ParsePayload<any>, ctx: ParseContextInternal): util.MaybeAsync<ParsePayload>;
        /** @internal Parses input, doesn't run checks. */
        parse(payload: ParsePayload<any>, ctx: ParseContextInternal): util.MaybeAsync<ParsePayload>;
        /** @internal  Stores identifiers for the set of traits implemented by this schema. */
        traits: Set<string>;
        /** @internal Indicates that a schema output type should be considered optional inside objects.
         * @default Required
         */
        optin?: 'optional' | undefined;
        optout?: 'optional' | undefined;
        /** @internal A set of literal discriminators used for the fast path in discriminated unions. */
        disc: util.DiscriminatorMap | undefined;
        /** @internal The set of literal values that will pass validation. Must be an exhaustive set. Used to determine optionality in z.record().
         *
         * Defined on: enum, const, literal, null, undefined
         * Passthrough: optional, nullable, branded, default, catch, pipe
         * Todo: unions?
         */
        values: util.PrimitiveSet | undefined;
        /** @internal This flag indicates that a schema validation can be represented with a regular expression. Used to determine allowable schemas in z.templateLiteral(). */
        pattern: RegExp | undefined;
        /** @internal The constructor function of this schema. */
        constr: new (def: any) => $ZodType;
        /** @internal A catchall object for bag metadata related to this schema. Commonly modified by checks using `onattach`. */
        bag: Record<string, unknown>;
        /** @internal The set of issues this schema might throw during type checking. */
        isst: errors.$ZodIssueBase;
        /** An optional method used to override `toJSONSchema` logic. */
        toJSONSchema?: () => object;
        /** @internal The parent of this schema. Only set during certain clone operations. */
        parent?: $ZodType | undefined;
      }

      interface $ZodType<O = unknown, I = unknown> {
        _zod: $ZodTypeInternals<O, I>;
        '~standard': StandardSchemaV1.Props<core.input<this>, core.output<this>>;
      }

      const $ZodType: core.$constructor<$ZodType>;

      export const clone: typeof util.clone;

      interface $ZodStringDef extends $ZodTypeDef {
        type: 'string';
        coerce?: boolean;
        checks?: checks.$ZodCheck<string>[];
      }

      interface $ZodStringInternals<Input> extends $ZodTypeInternals<string, Input> {
        def: $ZodStringDef;
        /** @deprecated Internal API, use with caution (not deprecated) */
        pattern: RegExp;
        /** @deprecated Internal API, use with caution (not deprecated) */
        isst: errors.$ZodIssueInvalidType;
        bag: util.LoosePartial<{
          minimum: number;
          maximum: number;
          patterns: Set<RegExp>;
          format: string;
          contentEncoding: string;
        }>;
      }

      interface $ZodString<Input = unknown> extends $ZodType {
        _zod: $ZodStringInternals<Input>;
      }

      const $ZodString: core.$constructor<$ZodString>;

      interface $ZodStringFormatDef<Format extends checks.$ZodStringFormats = checks.$ZodStringFormats>
        extends $ZodStringDef,
          checks.$ZodCheckStringFormatDef<Format> {}

      interface $ZodStringFormatInternals<Format extends checks.$ZodStringFormats = checks.$ZodStringFormats>
        extends $ZodStringInternals<string>,
          checks.$ZodCheckStringFormatInternals {
        def: $ZodStringFormatDef<Format>;
      }

      interface $ZodStringFormat<Format extends checks.$ZodStringFormats = checks.$ZodStringFormats> extends $ZodType {
        _zod: $ZodStringFormatInternals<Format>;
      }

      const $ZodStringFormat: core.$constructor<$ZodStringFormat>;

      interface $ZodGUIDDef extends $ZodStringFormatDef<'guid'> {}

      interface $ZodGUIDInternals extends $ZodStringFormatInternals<'guid'> {}

      interface $ZodGUID extends $ZodType {
        _zod: $ZodGUIDInternals;
      }

      const $ZodGUID: core.$constructor<$ZodGUID>;

      interface $ZodUUIDDef extends $ZodStringFormatDef<'uuid'> {
        version?: 'v1' | 'v2' | 'v3' | 'v4' | 'v5' | 'v6' | 'v7' | 'v8';
      }

      interface $ZodUUIDInternals extends $ZodStringFormatInternals<'uuid'> {
        def: $ZodUUIDDef;
      }

      interface $ZodUUID extends $ZodType {
        _zod: $ZodUUIDInternals;
      }

      const $ZodUUID: core.$constructor<$ZodUUID>;

      interface $ZodEmailDef extends $ZodStringFormatDef<'email'> {}

      interface $ZodEmailInternals extends $ZodStringFormatInternals<'email'> {}

      interface $ZodEmail extends $ZodType {
        _zod: $ZodEmailInternals;
      }

      const $ZodEmail: core.$constructor<$ZodEmail>;

      interface $ZodURLDef extends $ZodStringFormatDef<'url'> {
        hostname?: RegExp | undefined;
        protocol?: RegExp | undefined;
      }

      interface $ZodURLInternals extends $ZodStringFormatInternals<'url'> {
        def: $ZodURLDef;
      }

      interface $ZodURL extends $ZodType {
        _zod: $ZodURLInternals;
      }

      const $ZodURL: core.$constructor<$ZodURL>;

      interface $ZodEmojiDef extends $ZodStringFormatDef<'emoji'> {}

      interface $ZodEmojiInternals extends $ZodStringFormatInternals<'emoji'> {}

      interface $ZodEmoji extends $ZodType {
        _zod: $ZodEmojiInternals;
      }

      const $ZodEmoji: core.$constructor<$ZodEmoji>;

      interface $ZodNanoIDDef extends $ZodStringFormatDef<'nanoid'> {}

      interface $ZodNanoIDInternals extends $ZodStringFormatInternals<'nanoid'> {}

      interface $ZodNanoID extends $ZodType {
        _zod: $ZodNanoIDInternals;
      }

      const $ZodNanoID: core.$constructor<$ZodNanoID>;

      interface $ZodCUIDDef extends $ZodStringFormatDef<'cuid'> {}

      interface $ZodCUIDInternals extends $ZodStringFormatInternals<'cuid'> {}

      interface $ZodCUID extends $ZodType {
        _zod: $ZodCUIDInternals;
      }

      const $ZodCUID: core.$constructor<$ZodCUID>;

      interface $ZodCUID2Def extends $ZodStringFormatDef<'cuid2'> {}

      interface $ZodCUID2Internals extends $ZodStringFormatInternals<'cuid2'> {}

      interface $ZodCUID2 extends $ZodType {
        _zod: $ZodCUID2Internals;
      }

      const $ZodCUID2: core.$constructor<$ZodCUID2>;

      interface $ZodULIDDef extends $ZodStringFormatDef<'ulid'> {}

      interface $ZodULIDInternals extends $ZodStringFormatInternals<'ulid'> {}

      interface $ZodULID extends $ZodType {
        _zod: $ZodULIDInternals;
      }

      const $ZodULID: core.$constructor<$ZodULID>;

      interface $ZodXIDDef extends $ZodStringFormatDef<'xid'> {}

      interface $ZodXIDInternals extends $ZodStringFormatInternals<'xid'> {}

      interface $ZodXID extends $ZodType {
        _zod: $ZodXIDInternals;
      }

      const $ZodXID: core.$constructor<$ZodXID>;

      interface $ZodKSUIDDef extends $ZodStringFormatDef<'ksuid'> {}

      interface $ZodKSUIDInternals extends $ZodStringFormatInternals<'ksuid'> {}

      interface $ZodKSUID extends $ZodType {
        _zod: $ZodKSUIDInternals;
      }

      const $ZodKSUID: core.$constructor<$ZodKSUID>;

      interface $ZodISODateTimeDef extends $ZodStringFormatDef<'datetime'> {
        precision: number | null;
        offset: boolean;
        local: boolean;
      }

      interface $ZodISODateTimeInternals extends $ZodStringFormatInternals {
        def: $ZodISODateTimeDef;
      }

      interface $ZodISODateTime extends $ZodType {
        _zod: $ZodISODateTimeInternals;
      }

      const $ZodISODateTime: core.$constructor<$ZodISODateTime>;

      interface $ZodISODateDef extends $ZodStringFormatDef<'date'> {}

      interface $ZodISODateInternals extends $ZodStringFormatInternals<'date'> {}

      interface $ZodISODate extends $ZodType {
        _zod: $ZodISODateInternals;
      }

      const $ZodISODate: core.$constructor<$ZodISODate>;

      interface $ZodISOTimeDef extends $ZodStringFormatDef<'time'> {
        precision?: number | null;
      }

      interface $ZodISOTimeInternals extends $ZodStringFormatInternals<'time'> {
        def: $ZodISOTimeDef;
      }

      interface $ZodISOTime extends $ZodType {
        _zod: $ZodISOTimeInternals;
      }

      const $ZodISOTime: core.$constructor<$ZodISOTime>;

      interface $ZodISODurationDef extends $ZodStringFormatDef<'duration'> {}

      interface $ZodISODurationInternals extends $ZodStringFormatInternals<'duration'> {}

      interface $ZodISODuration extends $ZodType {
        _zod: $ZodISODurationInternals;
      }

      const $ZodISODuration: core.$constructor<$ZodISODuration>;

      interface $ZodIPv4Def extends $ZodStringFormatDef<'ipv4'> {
        version?: 'v4';
      }

      interface $ZodIPv4Internals extends $ZodStringFormatInternals<'ipv4'> {
        def: $ZodIPv4Def;
      }

      interface $ZodIPv4 extends $ZodType {
        _zod: $ZodIPv4Internals;
      }

      const $ZodIPv4: core.$constructor<$ZodIPv4>;

      interface $ZodIPv6Def extends $ZodStringFormatDef<'ipv6'> {
        version?: 'v6';
      }

      interface $ZodIPv6Internals extends $ZodStringFormatInternals<'ipv6'> {
        def: $ZodIPv6Def;
      }

      interface $ZodIPv6 extends $ZodType {
        _zod: $ZodIPv6Internals;
      }

      const $ZodIPv6: core.$constructor<$ZodIPv6>;

      interface $ZodCIDRv4Def extends $ZodStringFormatDef<'cidrv4'> {
        version?: 'v4';
      }

      interface $ZodCIDRv4Internals extends $ZodStringFormatInternals<'cidrv4'> {
        def: $ZodCIDRv4Def;
      }

      interface $ZodCIDRv4 extends $ZodType {
        _zod: $ZodCIDRv4Internals;
      }

      const $ZodCIDRv4: core.$constructor<$ZodCIDRv4>;

      interface $ZodCIDRv6Def extends $ZodStringFormatDef<'cidrv6'> {
        version?: 'v6';
      }

      interface $ZodCIDRv6Internals extends $ZodStringFormatInternals<'cidrv6'> {
        def: $ZodCIDRv6Def;
      }

      interface $ZodCIDRv6 extends $ZodType {
        _zod: $ZodCIDRv6Internals;
      }

      const $ZodCIDRv6: core.$constructor<$ZodCIDRv6>;

      function isValidBase64(data: string): boolean;

      interface $ZodBase64Def extends $ZodStringFormatDef<'base64'> {}

      interface $ZodBase64Internals extends $ZodStringFormatInternals<'base64'> {}

      interface $ZodBase64 extends $ZodType {
        _zod: $ZodBase64Internals;
      }

      const $ZodBase64: core.$constructor<$ZodBase64>;

      function isValidBase64URL(data: string): boolean;

      interface $ZodBase64URLDef extends $ZodStringFormatDef<'base64url'> {}

      interface $ZodBase64URLInternals extends $ZodStringFormatInternals<'base64url'> {}

      interface $ZodBase64URL extends $ZodType {
        _zod: $ZodBase64URLInternals;
      }

      const $ZodBase64URL: core.$constructor<$ZodBase64URL>;

      interface $ZodE164Def extends $ZodStringFormatDef<'e164'> {}

      interface $ZodE164Internals extends $ZodStringFormatInternals<'e164'> {}

      interface $ZodE164 extends $ZodType {
        _zod: $ZodE164Internals;
      }

      const $ZodE164: core.$constructor<$ZodE164>;

      function isValidJWT(token: string, algorithm?: util.JWTAlgorithm | null): boolean;

      interface $ZodJWTDef extends $ZodStringFormatDef<'jwt'> {
        alg?: util.JWTAlgorithm | undefined;
      }

      interface $ZodJWTInternals extends $ZodStringFormatInternals<'jwt'> {
        def: $ZodJWTDef;
      }

      interface $ZodJWT extends $ZodType {
        _zod: $ZodJWTInternals;
      }

      const $ZodJWT: core.$constructor<$ZodJWT>;

      interface $ZodNumberDef extends $ZodTypeDef {
        type: 'number';
        coerce?: boolean;
      }

      interface $ZodNumberInternals<Input = unknown> extends $ZodTypeInternals<number, Input> {
        def: $ZodNumberDef;
        /** @deprecated Internal API, use with caution (not deprecated) */
        pattern: RegExp;
        /** @deprecated Internal API, use with caution (not deprecated) */
        isst: errors.$ZodIssueInvalidType;
        bag: util.LoosePartial<{
          minimum: number;
          maximum: number;
          exclusiveMinimum: number;
          exclusiveMaximum: number;
          format: string;
          pattern: RegExp;
        }>;
      }

      interface $ZodNumber<Input = unknown> extends $ZodType {
        _zod: $ZodNumberInternals<Input>;
      }

      const $ZodNumber: core.$constructor<$ZodNumber>;

      interface $ZodNumberFormatDef extends $ZodNumberDef, checks.$ZodCheckNumberFormatDef {}

      interface $ZodNumberFormatInternals extends $ZodNumberInternals<number>, checks.$ZodCheckNumberFormatInternals {
        def: $ZodNumberFormatDef;
        isst: errors.$ZodIssueInvalidType;
      }

      interface $ZodNumberFormat extends $ZodType {
        _zod: $ZodNumberFormatInternals;
      }

      const $ZodNumberFormat: core.$constructor<$ZodNumberFormat>;

      interface $ZodBooleanDef extends $ZodTypeDef {
        type: 'boolean';
        coerce?: boolean;
        checks?: checks.$ZodCheck<boolean>[];
      }

      interface $ZodBooleanInternals<T = unknown> extends $ZodTypeInternals<boolean, T> {
        pattern: RegExp;
        def: $ZodBooleanDef;
        isst: errors.$ZodIssueInvalidType;
      }

      interface $ZodBoolean<T = unknown> extends $ZodType {
        _zod: $ZodBooleanInternals<T>;
      }

      const $ZodBoolean: core.$constructor<$ZodBoolean>;

      interface $ZodBigIntDef extends $ZodTypeDef {
        type: 'bigint';
        coerce?: boolean;
      }

      interface $ZodBigIntInternals<T = unknown> extends $ZodTypeInternals<bigint, T> {
        pattern: RegExp;
        /** @internal Internal API, use with caution */
        def: $ZodBigIntDef;
        isst: errors.$ZodIssueInvalidType;
        bag: util.LoosePartial<{
          minimum: bigint;
          maximum: bigint;
          format: string;
        }>;
      }

      interface $ZodBigInt<T = unknown> extends $ZodType {
        _zod: $ZodBigIntInternals<T>;
      }

      const $ZodBigInt: core.$constructor<$ZodBigInt>;

      interface $ZodBigIntFormatDef extends $ZodBigIntDef, checks.$ZodCheckBigIntFormatDef {
        check: 'bigint_format';
      }

      interface $ZodBigIntFormatInternals extends $ZodBigIntInternals<bigint>, checks.$ZodCheckBigIntFormatInternals {
        def: $ZodBigIntFormatDef;
      }

      interface $ZodBigIntFormat extends $ZodType {
        _zod: $ZodBigIntFormatInternals;
      }

      const $ZodBigIntFormat: core.$constructor<$ZodBigIntFormat>;

      interface $ZodSymbolDef extends $ZodTypeDef {
        type: 'symbol';
      }

      interface $ZodSymbolInternals extends $ZodTypeInternals<symbol, symbol> {
        def: $ZodSymbolDef;
        isst: errors.$ZodIssueInvalidType;
      }

      interface $ZodSymbol extends $ZodType {
        _zod: $ZodSymbolInternals;
      }

      const $ZodSymbol: core.$constructor<$ZodSymbol>;

      interface $ZodUndefinedDef extends $ZodTypeDef {
        type: 'undefined';
      }

      interface $ZodUndefinedInternals extends $ZodTypeInternals<undefined, undefined> {
        pattern: RegExp;
        def: $ZodUndefinedDef;
        values: util.PrimitiveSet;
        isst: errors.$ZodIssueInvalidType;
      }

      interface $ZodUndefined extends $ZodType {
        _zod: $ZodUndefinedInternals;
      }

      const $ZodUndefined: core.$constructor<$ZodUndefined>;

      interface $ZodNullDef extends $ZodTypeDef {
        type: 'null';
      }

      interface $ZodNullInternals extends $ZodTypeInternals<null, null> {
        pattern: RegExp;
        def: $ZodNullDef;
        values: util.PrimitiveSet;
        isst: errors.$ZodIssueInvalidType;
      }

      interface $ZodNull extends $ZodType {
        _zod: $ZodNullInternals;
      }

      const $ZodNull: core.$constructor<$ZodNull>;

      interface $ZodAnyDef extends $ZodTypeDef {
        type: 'any';
      }

      interface $ZodAnyInternals extends $ZodTypeInternals<any, any> {
        def: $ZodAnyDef;
        isst: never;
      }

      interface $ZodAny extends $ZodType {
        _zod: $ZodAnyInternals;
      }

      const $ZodAny: core.$constructor<$ZodAny>;

      interface $ZodUnknownDef extends $ZodTypeDef {
        type: 'unknown';
      }

      interface $ZodUnknownInternals extends $ZodTypeInternals<unknown, unknown> {
        def: $ZodUnknownDef;
        isst: never;
      }

      interface $ZodUnknown extends $ZodType {
        _zod: $ZodUnknownInternals;
      }

      const $ZodUnknown: core.$constructor<$ZodUnknown>;

      interface $ZodNeverDef extends $ZodTypeDef {
        type: 'never';
      }

      interface $ZodNeverInternals extends $ZodTypeInternals<never, never> {
        def: $ZodNeverDef;
        isst: errors.$ZodIssueInvalidType;
      }

      interface $ZodNever extends $ZodType {
        _zod: $ZodNeverInternals;
      }

      const $ZodNever: core.$constructor<$ZodNever>;

      interface $ZodVoidDef extends $ZodTypeDef {
        type: 'void';
      }

      interface $ZodVoidInternals extends $ZodTypeInternals<void, void> {
        def: $ZodVoidDef;
        isst: errors.$ZodIssueInvalidType;
      }

      interface $ZodVoid extends $ZodType {
        _zod: $ZodVoidInternals;
      }

      const $ZodVoid: core.$constructor<$ZodVoid>;

      interface $ZodDateDef extends $ZodTypeDef {
        type: 'date';
        coerce?: boolean;
      }

      interface $ZodDateInternals<T = unknown> extends $ZodTypeInternals<Date, T> {
        def: $ZodDateDef;
        isst: errors.$ZodIssueInvalidType;
        bag: util.LoosePartial<{
          minimum: Date;
          maximum: Date;
          format: string;
        }>;
      }

      interface $ZodDate<T = unknown> extends $ZodType {
        _zod: $ZodDateInternals<T>;
      }

      const $ZodDate: core.$constructor<$ZodDate>;

      interface $ZodArrayDef<T extends $ZodType = $ZodType> extends $ZodTypeDef {
        type: 'array';
        element: T;
      }

      interface $ZodArrayInternals<T extends $ZodType = $ZodType>
        extends $ZodTypeInternals<core.output<T>[], core.input<T>[]> {
        def: $ZodArrayDef<T>;
        isst: errors.$ZodIssueInvalidType;
      }

      interface $ZodArray<T extends $ZodType = $ZodType> extends $ZodType {
        _zod: $ZodArrayInternals<T>;
      }

      const $ZodArray: core.$constructor<$ZodArray>;

      type $ZodShape = Readonly<{
        [k: string]: $ZodType;
      }>;

      interface $ZodObjectDef<Shape extends $ZodShape = $ZodShape> extends $ZodTypeDef {
        type: 'object';
        shape: Shape;
        catchall?: $ZodType | undefined;
      }

      interface $ZodObjectInternals<
        /** @ts-ignore Cast variance */
        out Shape extends Readonly<$ZodShape> = Readonly<$ZodShape>,
        out Config extends $ZodObjectConfig = $ZodObjectConfig
      > extends $ZodTypeInternals<any, any> {
        def: $ZodObjectDef<Shape>;
        config: Config;
        isst: errors.$ZodIssueInvalidType | errors.$ZodIssueUnrecognizedKeys;
        disc: util.DiscriminatorMap;
        '~output': $InferObjectOutput<Shape, Config['out']>;
        '~input': $InferObjectInput<Shape, Config['in']>;
      }

      type $ZodLooseShape = Record<string, any>;

      type OptionalOutSchema = {
        _zod: {
          optout: 'optional';
        };
      };

      type OptionalInSchema = {
        _zod: {
          optin: 'optional';
        };
      };

      type $InferObjectOutput<T extends $ZodLooseShape, Extra extends Record<string, unknown>> = string extends keyof T
        ? object
        : keyof (T & Extra) extends never
          ? Record<string, never>
          : util.Prettify<
              {
                -readonly [k in keyof T as T[k] extends OptionalOutSchema ? never : k]: core.output<T[k]>;
              } & {
                -readonly [k in keyof T as T[k] extends OptionalOutSchema ? k : never]?: core.output<T[k]>;
              } & Extra
            >;

      type $InferObjectInput<T extends $ZodLooseShape, Extra extends Record<string, unknown>> = string extends keyof T
        ? object
        : keyof (T & Extra) extends never
          ? Record<string, never>
          : util.Prettify<
              {
                -readonly [k in keyof T as T[k] extends OptionalInSchema ? never : k]: core.input<T[k]>;
              } & {
                -readonly [k in keyof T as T[k] extends OptionalInSchema ? k : never]?: core.input<T[k]>;
              } & Extra
            >;

      type $ZodObjectConfig = {
        out: Record<string, unknown>;
        in: Record<string, unknown>;
      };

      type $loose = {
        out: Record<string, unknown>;
        in: Record<string, unknown>;
      };

      type $strict = {
        out: {};
        in: {};
      };

      type $strip = {
        out: {};
        in: {};
      };

      type $catchall<T extends $ZodType> = {
        out: {
          [k: string]: core.output<T>;
        };
        in: {
          [k: string]: core.input<T>;
        };
      };

      interface $ZodObject<
        /** @ts-ignore Cast variance */
        out Shape extends Readonly<$ZodShape> = Readonly<$ZodShape>,
        out Params extends $ZodObjectConfig = $ZodObjectConfig
      > extends $ZodType {
        _zod: $ZodObjectInternals<Shape, Params>;
      }

      const $ZodObject: core.$constructor<$ZodObject>;

      type $InferUnionOutput<T extends $ZodType> = T extends any ? core.output<T> : never;

      type $InferUnionInput<T extends $ZodType> = T extends any ? core.input<T> : never;

      interface $ZodUnionDef<Options extends readonly $ZodType[] = readonly $ZodType[]> extends $ZodTypeDef {
        type: 'union';
        options: Options;
      }

      interface $ZodUnionInternals<T extends readonly $ZodType[] = readonly $ZodType[]>
        extends $ZodTypeInternals<$InferUnionOutput<T[number]>, $InferUnionInput<T[number]>> {
        def: $ZodUnionDef<T>;
        isst: errors.$ZodIssueInvalidUnion;
        pattern: T[number]['_zod']['pattern'];
      }

      interface $ZodUnion<T extends readonly $ZodType[] = readonly $ZodType[]> extends $ZodType {
        _zod: $ZodUnionInternals<T>;
      }

      const $ZodUnion: core.$constructor<$ZodUnion>;

      interface $ZodDiscriminatedUnionDef<Options extends readonly $ZodType[] = readonly $ZodType[]>
        extends $ZodUnionDef<Options> {
        discriminator: string;
        unionFallback?: boolean;
      }

      interface $ZodDiscriminatedUnionInternals<Options extends readonly $ZodType[] = readonly $ZodType[]>
        extends $ZodUnionInternals<Options> {
        def: $ZodDiscriminatedUnionDef<Options>;
        disc: util.DiscriminatorMap;
      }

      interface $ZodDiscriminatedUnion<T extends readonly $ZodType[] = readonly $ZodType[]> extends $ZodType {
        _zod: $ZodDiscriminatedUnionInternals<T>;
      }

      const $ZodDiscriminatedUnion: core.$constructor<$ZodDiscriminatedUnion>;

      interface $ZodIntersectionDef extends $ZodTypeDef {
        type: 'intersection';
        left: $ZodType;
        right: $ZodType;
      }

      interface $ZodIntersectionInternals<A extends $ZodType = $ZodType, B extends $ZodType = $ZodType>
        extends $ZodTypeInternals<core.output<A> & core.output<B>, core.input<A> & core.input<B>> {
        def: $ZodIntersectionDef;
        isst: never;
      }

      interface $ZodIntersection<A extends $ZodType = $ZodType, B extends $ZodType = $ZodType> extends $ZodType {
        _zod: $ZodIntersectionInternals<A, B>;
      }

      const $ZodIntersection: core.$constructor<$ZodIntersection>;

      interface $ZodTupleDef<
        T extends util.TupleItems = util.TupleItems,
        Rest extends $ZodType | null = $ZodType | null
      > extends $ZodTypeDef {
        type: 'tuple';
        items: T;
        rest: Rest;
      }

      type $InferTupleInputType<T extends util.TupleItems, Rest extends $ZodType | null> = [
        ...TupleInputTypeWithOptionals<T>,
        ...(Rest extends $ZodType ? core.input<Rest>[] : [])
      ];

      type TupleInputTypeNoOptionals<T extends util.TupleItems> = {
        [k in keyof T]: core.input<T[k]>;
      };

      type TupleInputTypeWithOptionals<T extends util.TupleItems> = T extends readonly [
        ...infer Prefix extends $ZodType[],
        infer Tail extends $ZodType
      ]
        ? Tail['_zod']['optin'] extends 'optional'
          ? [...TupleInputTypeWithOptionals<Prefix>, Tail['_zod']['input']?]
          : TupleInputTypeNoOptionals<T>
        : [];

      type $InferTupleOutputType<T extends util.TupleItems, Rest extends $ZodType | null> = [
        ...TupleOutputTypeWithOptionals<T>,
        ...(Rest extends $ZodType ? core.output<Rest>[] : [])
      ];

      type TupleOutputTypeNoOptionals<T extends util.TupleItems> = {
        [k in keyof T]: core.output<T[k]>;
      };

      type TupleOutputTypeWithOptionals<T extends util.TupleItems> = T extends readonly [
        ...infer Prefix extends $ZodType[],
        infer Tail extends $ZodType
      ]
        ? Tail['_zod']['optout'] extends 'optional'
          ? [...TupleOutputTypeWithOptionals<Prefix>, core.output<Tail>?]
          : TupleOutputTypeNoOptionals<T>
        : [];

      interface $ZodTupleInternals<
        T extends util.TupleItems = util.TupleItems,
        Rest extends $ZodType | null = $ZodType | null
      > extends $ZodTypeInternals<$InferTupleOutputType<T, Rest>, $InferTupleInputType<T, Rest>> {
        def: $ZodTupleDef<T, Rest>;
        isst: errors.$ZodIssueInvalidType | errors.$ZodIssueTooBig<unknown[]> | errors.$ZodIssueTooSmall<unknown[]>;
      }

      interface $ZodTuple<T extends util.TupleItems = util.TupleItems, Rest extends $ZodType | null = $ZodType | null>
        extends $ZodType {
        _zod: $ZodTupleInternals<T, Rest>;
      }

      const $ZodTuple: core.$constructor<$ZodTuple>;

      type $ZodRecordKey = $ZodType<string | number | symbol, string | number | symbol>;

      interface $ZodRecordDef extends $ZodTypeDef {
        type: 'record';
        keyType: $ZodRecordKey;
        valueType: $ZodType;
      }

      type $InferZodRecordOutput<
        Key extends $ZodRecordKey = $ZodRecordKey,
        Value extends $ZodType = $ZodType
      > = undefined extends Key['_zod']['values']
        ? string extends Key['_zod']['output']
          ? Record<Key['_zod']['output'], core.output<Value>>
          : number extends Key['_zod']['output']
            ? Record<Key['_zod']['output'], core.output<Value>>
            : symbol extends Key['_zod']['output']
              ? Record<Key['_zod']['output'], core.output<Value>>
              : Partial<Record<Key['_zod']['output'], core.output<Value>>>
        : Record<Key['_zod']['output'], core.output<Value>>;

      type $InferZodRecordInput<
        Key extends $ZodRecordKey = $ZodRecordKey,
        Value extends $ZodType = $ZodType
      > = undefined extends Key['_zod']['values']
        ? string extends Key['_zod']['input']
          ? Record<Key['_zod']['input'], Value['_zod']['input']>
          : number extends Key['_zod']['input']
            ? Record<Key['_zod']['input'], Value['_zod']['input']>
            : symbol extends Key['_zod']['input']
              ? Record<Key['_zod']['input'], Value['_zod']['input']>
              : Partial<Record<Key['_zod']['input'], Value['_zod']['input']>>
        : Record<Key['_zod']['input'], Value['_zod']['input']>;

      interface $ZodRecordInternals<Key extends $ZodRecordKey = $ZodRecordKey, Value extends $ZodType = $ZodType>
        extends $ZodTypeInternals<$InferZodRecordOutput<Key, Value>, $InferZodRecordInput<Key, Value>> {
        def: $ZodRecordDef;
        isst: errors.$ZodIssueInvalidType | errors.$ZodIssueInvalidKey<Record<PropertyKey, unknown>>;
      }

      interface $ZodRecord<Key extends $ZodRecordKey = $ZodRecordKey, Value extends $ZodType = $ZodType>
        extends $ZodType {
        _zod: $ZodRecordInternals<Key, Value>;
      }

      const $ZodRecord: core.$constructor<$ZodRecord>;

      interface $ZodMapDef extends $ZodTypeDef {
        type: 'map';
        keyType: $ZodType;
        valueType: $ZodType;
      }

      interface $ZodMapInternals<Key extends $ZodType = $ZodType, Value extends $ZodType = $ZodType>
        extends $ZodTypeInternals<Map<core.output<Key>, core.output<Value>>, Map<core.input<Key>, core.input<Value>>> {
        def: $ZodMapDef;
        isst: errors.$ZodIssueInvalidType | errors.$ZodIssueInvalidKey | errors.$ZodIssueInvalidElement<unknown>;
      }

      interface $ZodMap<Key extends $ZodType = $ZodType, Value extends $ZodType = $ZodType> extends $ZodType {
        _zod: $ZodMapInternals<Key, Value>;
      }

      const $ZodMap: core.$constructor<$ZodMap>;

      interface $ZodSetDef extends $ZodTypeDef {
        type: 'set';
        valueType: $ZodType;
      }

      interface $ZodSetInternals<T extends $ZodType = $ZodType>
        extends $ZodTypeInternals<Set<core.output<T>>, Set<core.input<T>>> {
        def: $ZodSetDef;
        isst: errors.$ZodIssueInvalidType;
      }

      interface $ZodSet<T extends $ZodType = $ZodType> extends $ZodType {
        _zod: $ZodSetInternals<T>;
      }

      const $ZodSet: core.$constructor<$ZodSet>;

      type $InferEnumOutput<T extends util.EnumLike> = T[keyof T] & {};

      type $InferEnumInput<T extends util.EnumLike> = T[keyof T] & {};

      interface $ZodEnumDef<T extends util.EnumLike = util.EnumLike> extends $ZodTypeDef {
        type: 'enum';
        entries: T;
      }

      interface $ZodEnumInternals<
        /** @ts-ignore Cast variance */
        out T extends util.EnumLike = util.EnumLike
      > extends $ZodTypeInternals<$InferEnumOutput<T>, $InferEnumInput<T>> {
        def: $ZodEnumDef<T>;
        /** @deprecated Internal API, use with caution (not deprecated) */
        values: util.PrimitiveSet;
        /** @deprecated Internal API, use with caution (not deprecated) */
        pattern: RegExp;
        isst: errors.$ZodIssueInvalidValue;
      }

      interface $ZodEnum<T extends util.EnumLike = util.EnumLike> extends $ZodType {
        _zod: $ZodEnumInternals<T>;
      }

      const $ZodEnum: core.$constructor<$ZodEnum>;

      interface $ZodLiteralDef extends $ZodTypeDef {
        type: 'literal';
        values: util.LiteralArray;
      }

      interface $ZodLiteralInternals<T extends util.Primitive = util.Primitive> extends $ZodTypeInternals<T, T> {
        def: $ZodLiteralDef;
        values: Set<T>;
        pattern: RegExp;
        isst: errors.$ZodIssueInvalidValue;
      }

      interface $ZodLiteral<T extends util.Primitive = util.Primitive> extends $ZodType {
        _zod: $ZodLiteralInternals<T>;
      }

      const $ZodLiteral: core.$constructor<$ZodLiteral>;

      interface $ZodFileDef extends $ZodTypeDef {
        type: 'file';
      }

      interface $ZodFileInternals extends $ZodTypeInternals<File, File> {
        def: $ZodFileDef;
        isst: errors.$ZodIssueInvalidType;
      }

      interface $ZodFile extends $ZodType {
        _zod: $ZodFileInternals;
      }

      const $ZodFile: core.$constructor<$ZodFile>;

      interface $ZodTransformDef extends $ZodTypeDef {
        type: 'transform';
        transform: (input: unknown, payload: ParsePayload<unknown>) => util.MaybeAsync<unknown>;
      }

      interface $ZodTransformInternals<O = unknown, I = unknown> extends $ZodTypeInternals<O, I> {
        def: $ZodTransformDef;
        isst: never;
      }

      interface $ZodTransform<O = unknown, I = unknown> extends $ZodType {
        _zod: $ZodTransformInternals<O, I>;
      }

      const $ZodTransform: core.$constructor<$ZodTransform>;

      interface $ZodOptionalDef<T extends $ZodType = $ZodType> extends $ZodTypeDef {
        type: 'optional';
        innerType: T;
      }

      interface $ZodOptionalInternals<T extends $ZodType = $ZodType>
        extends $ZodTypeInternals<core.output<T> | undefined, core.input<T> | undefined> {
        def: $ZodOptionalDef<T>;
        optin: 'optional';
        optout: 'optional';
        isst: never;
        values: T['_zod']['values'];
        pattern: T['_zod']['pattern'];
      }

      interface $ZodOptional<T extends $ZodType = $ZodType> extends $ZodType {
        _zod: $ZodOptionalInternals<T>;
      }

      const $ZodOptional: core.$constructor<$ZodOptional>;

      interface $ZodNullableDef<T extends $ZodType = $ZodType> extends $ZodTypeDef {
        type: 'nullable';
        innerType: T;
      }

      interface $ZodNullableInternals<T extends $ZodType = $ZodType>
        extends $ZodTypeInternals<core.output<T> | null, core.input<T> | null> {
        def: $ZodNullableDef<T>;
        optin: T['_zod']['optin'];
        optout: T['_zod']['optout'];
        isst: never;
        values: T['_zod']['values'];
        pattern: T['_zod']['pattern'];
      }

      interface $ZodNullable<T extends $ZodType = $ZodType> extends $ZodType {
        _zod: $ZodNullableInternals<T>;
      }

      const $ZodNullable: core.$constructor<$ZodNullable>;

      interface $ZodDefaultDef<T extends $ZodType = $ZodType> extends $ZodTypeDef {
        type: 'default';
        innerType: T;
        /** The default value. May be a getter. */
        defaultValue: util.NoUndefined<core.output<T>>;
      }

      interface $ZodDefaultInternals<T extends $ZodType = $ZodType>
        extends $ZodTypeInternals<util.NoUndefined<core.output<T>>, core.input<T> | undefined> {
        def: $ZodDefaultDef<T>;
        optin: 'optional';
        isst: never;
        values: T['_zod']['values'];
      }

      interface $ZodDefault<T extends $ZodType = $ZodType> extends $ZodType {
        _zod: $ZodDefaultInternals<T>;
      }

      const $ZodDefault: core.$constructor<$ZodDefault>;

      interface $ZodPrefaultDef<T extends $ZodType = $ZodType> extends $ZodTypeDef {
        type: 'prefault';
        innerType: T;
        /** The default value. May be a getter. */
        defaultValue: core.input<T>;
      }

      interface $ZodPrefaultInternals<T extends $ZodType = $ZodType>
        extends $ZodTypeInternals<util.NoUndefined<core.output<T>>, core.input<T> | undefined> {
        def: $ZodPrefaultDef<T>;
        optin: 'optional';
        isst: never;
        values: T['_zod']['values'];
      }

      interface $ZodPrefault<T extends $ZodType = $ZodType> extends $ZodType {
        _zod: $ZodPrefaultInternals<T>;
      }

      const $ZodPrefault: core.$constructor<$ZodPrefault>;

      interface $ZodNonOptionalDef<T extends $ZodType = $ZodType> extends $ZodTypeDef {
        type: 'nonoptional';
        innerType: T;
      }

      interface $ZodNonOptionalInternals<T extends $ZodType = $ZodType>
        extends $ZodTypeInternals<util.NoUndefined<core.output<T>>, util.NoUndefined<core.input<T>>> {
        def: $ZodNonOptionalDef<T>;
        isst: errors.$ZodIssueInvalidType;
        values: T['_zod']['values'];
      }

      interface $ZodNonOptional<T extends $ZodType = $ZodType> extends $ZodType {
        _zod: $ZodNonOptionalInternals<T>;
      }

      const $ZodNonOptional: core.$constructor<$ZodNonOptional>;

      interface $ZodSuccessDef extends $ZodTypeDef {
        type: 'success';
        innerType: $ZodType;
      }

      interface $ZodSuccessInternals<T extends $ZodType = $ZodType> extends $ZodTypeInternals<boolean, core.input<T>> {
        def: $ZodSuccessDef;
        isst: never;
      }

      interface $ZodSuccess<T extends $ZodType = $ZodType> extends $ZodType {
        _zod: $ZodSuccessInternals<T>;
      }

      const $ZodSuccess: core.$constructor<$ZodSuccess>;

      interface $ZodCatchCtx extends ParsePayload {
        /** @deprecated Use `ctx.issues` */
        error: {
          issues: errors.$ZodIssue[];
        };
        /** @deprecated Use `ctx.value` */
        input: unknown;
      }

      interface $ZodCatchDef extends $ZodTypeDef {
        type: 'catch';
        innerType: $ZodType;
        catchValue: (ctx: $ZodCatchCtx) => unknown;
      }

      interface $ZodCatchInternals<T extends $ZodType = $ZodType>
        extends $ZodTypeInternals<core.output<T>, core.input<T> | util.Whatever> {
        def: $ZodCatchDef;
        optin: T['_zod']['optin'];
        optout: T['_zod']['optout'];
        isst: never;
        values: T['_zod']['values'];
      }

      interface $ZodCatch<T extends $ZodType = $ZodType> extends $ZodType {
        _zod: $ZodCatchInternals<T>;
      }

      const $ZodCatch: core.$constructor<$ZodCatch>;

      interface $ZodNaNDef extends $ZodTypeDef {
        type: 'nan';
      }

      interface $ZodNaNInternals extends $ZodTypeInternals<number, number> {
        def: $ZodNaNDef;
        isst: errors.$ZodIssueInvalidType;
      }

      interface $ZodNaN extends $ZodType {
        _zod: $ZodNaNInternals;
      }

      const $ZodNaN: core.$constructor<$ZodNaN>;

      interface $ZodPipeDef<A extends $ZodType = $ZodType, B extends $ZodType = $ZodType> extends $ZodTypeDef {
        type: 'pipe';
        in: A;
        out: B;
      }

      interface $ZodPipeInternals<A extends $ZodType = $ZodType, B extends $ZodType = $ZodType>
        extends $ZodTypeInternals<core.output<B>, core.input<A>> {
        def: $ZodPipeDef<A, B>;
        isst: never;
        values: A['_zod']['values'];
        optin: A['_zod']['optin'];
        optout: B['_zod']['optout'];
      }

      interface $ZodPipe<A extends $ZodType = $ZodType, B extends $ZodType = $ZodType> extends $ZodType {
        _zod: $ZodPipeInternals<A, B>;
      }

      const $ZodPipe: core.$constructor<$ZodPipe>;

      interface $ZodReadonlyDef extends $ZodTypeDef {
        type: 'readonly';
        innerType: $ZodType;
      }

      interface $ZodReadonlyInternals<T extends $ZodType = $ZodType>
        extends $ZodTypeInternals<util.MakeReadonly<core.output<T>>, util.MakeReadonly<core.input<T>>> {
        def: $ZodReadonlyDef;
        optin: T['_zod']['optin'];
        optout: T['_zod']['optout'];
        isst: never;
        disc: T['_zod']['disc'];
      }

      interface $ZodReadonly<T extends $ZodType = $ZodType> extends $ZodType {
        _zod: $ZodReadonlyInternals<T>;
      }

      const $ZodReadonly: core.$constructor<$ZodReadonly>;

      interface $ZodTemplateLiteralDef extends $ZodTypeDef {
        type: 'template_literal';
        parts: $ZodTemplateLiteralPart[];
      }

      interface $ZodTemplateLiteralInternals<Template extends string = string>
        extends $ZodTypeInternals<Template, Template> {
        pattern: RegExp;
        def: $ZodTemplateLiteralDef;
        isst: errors.$ZodIssueInvalidType;
      }

      interface $ZodTemplateLiteral<Template extends string = string> extends $ZodType {
        _zod: $ZodTemplateLiteralInternals<Template>;
      }

      type LiteralPart = Exclude<util.Literal, symbol>;

      interface SchemaPartInternals extends $ZodTypeInternals<LiteralPart, LiteralPart> {
        pattern: RegExp;
      }

      interface SchemaPart extends $ZodType {
        _zod: SchemaPartInternals;
      }

      type $ZodTemplateLiteralPart = LiteralPart | SchemaPart;

      type UndefinedToEmptyString<T> = T extends undefined ? '' : T;

      type AppendToTemplateLiteral<
        Template extends string,
        Suffix extends LiteralPart | $ZodType
      > = Suffix extends LiteralPart
        ? `${Template}${UndefinedToEmptyString<Suffix>}`
        : `${Template}${UndefinedToEmptyString<LiteralPart & core.output<Suffix & $ZodType>>}`;

      type $PartsToTemplateLiteral<Parts extends $ZodTemplateLiteralPart[]> = [] extends Parts
        ? ``
        : Parts extends [...infer Rest extends $ZodTemplateLiteralPart[], infer Last extends $ZodTemplateLiteralPart]
          ? AppendToTemplateLiteral<$PartsToTemplateLiteral<Rest>, Last>
          : never;

      const $ZodTemplateLiteral: core.$constructor<$ZodTemplateLiteral>;

      interface $ZodPromiseDef extends $ZodTypeDef {
        type: 'promise';
        innerType: $ZodType;
      }

      interface $ZodPromiseInternals<T extends $ZodType = $ZodType>
        extends $ZodTypeInternals<core.output<T>, util.MaybeAsync<core.input<T>>> {
        def: $ZodPromiseDef;
        isst: never;
      }

      interface $ZodPromise<T extends $ZodType = $ZodType> extends $ZodType {
        _zod: $ZodPromiseInternals<T>;
      }

      const $ZodPromise: core.$constructor<$ZodPromise>;

      interface $ZodLazyDef extends $ZodTypeDef {
        type: 'lazy';
        getter: () => $ZodType;
      }

      interface $ZodLazyInternals<T extends $ZodType = $ZodType>
        extends $ZodTypeInternals<core.output<T>, core.input<T>> {
        def: $ZodLazyDef;
        isst: never;
        /** Auto-cached way to retrieve the inner schema */
        innerType: T;
        pattern: T['_zod']['pattern'];
        disc: T['_zod']['disc'];
        optin: T['_zod']['optin'];
        optout: T['_zod']['optout'];
      }

      interface $ZodLazy<T extends $ZodType = $ZodType> extends $ZodType {
        _zod: $ZodLazyInternals<T>;
      }

      const $ZodLazy: core.$constructor<$ZodLazy>;

      interface $ZodCustomDef<O = unknown> extends $ZodTypeDef, checks.$ZodCheckDef {
        type: 'custom';
        check: 'custom';
        path?: PropertyKey[] | undefined;
        error?: errors.$ZodErrorMap | undefined;
        params?: Record<string, any> | undefined;
        fn: (arg: O) => unknown;
      }

      interface $ZodCustomInternals<O = unknown, I = unknown>
        extends $ZodTypeInternals<O, I>,
          checks.$ZodCheckInternals<O> {
        def: $ZodCustomDef;
        issc: errors.$ZodIssue;
        isst: never;
        bag: util.LoosePartial<{
          Class: typeof util.Class;
        }>;
      }

      interface $ZodCustom<O = unknown, I = unknown> extends $ZodType {
        _zod: $ZodCustomInternals<O, I>;
      }

      const $ZodCustom: core.$constructor<$ZodCustom>;

      type $ZodTypes =
        | $ZodString
        | $ZodNumber
        | $ZodBigInt
        | $ZodBoolean
        | $ZodDate
        | $ZodSymbol
        | $ZodUndefined
        | $ZodNullable
        | $ZodNull
        | $ZodAny
        | $ZodUnknown
        | $ZodNever
        | $ZodVoid
        | $ZodArray
        | $ZodObject
        | $ZodUnion
        | $ZodIntersection
        | $ZodTuple
        | $ZodRecord
        | $ZodMap
        | $ZodSet
        | $ZodLiteral
        | $ZodEnum
        | $ZodPromise
        | $ZodLazy
        | $ZodOptional
        | $ZodDefault
        | $ZodPrefault
        | $ZodTemplateLiteral
        | $ZodCustom
        | $ZodTransform
        | $ZodNonOptional
        | $ZodReadonly
        | $ZodNaN
        | $ZodPipe
        | $ZodSuccess
        | $ZodCatch
        | $ZodFile;

      type $ZodStringFormatTypes =
        | $ZodGUID
        | $ZodUUID
        | $ZodEmail
        | $ZodURL
        | $ZodEmoji
        | $ZodNanoID
        | $ZodCUID
        | $ZodCUID2
        | $ZodULID
        | $ZodXID
        | $ZodKSUID
        | $ZodISODateTime
        | $ZodISODate
        | $ZodISOTime
        | $ZodISODuration
        | $ZodIPv4
        | $ZodIPv6
        | $ZodCIDRv4
        | $ZodCIDRv6
        | $ZodBase64
        | $ZodBase64URL
        | $ZodE164
        | $ZodJWT;
    }

    export import ParseContext = schemas.ParseContext;
    export import ParseContextInternal = schemas.ParseContextInternal;
    export import ParsePayload = schemas.ParsePayload;
    export import CheckFn = schemas.CheckFn;
    export import $ZodTypeDef = schemas.$ZodTypeDef;
    export import $ZodTypeInternals = schemas.$ZodTypeInternals;
    export import $ZodType = schemas.$ZodType;
    export import $ZodStringDef = schemas.$ZodStringDef;
    export import $ZodStringInternals = schemas.$ZodStringInternals;
    export import $ZodString = schemas.$ZodString;
    export import $ZodStringFormatDef = schemas.$ZodStringFormatDef;
    export import $ZodStringFormatInternals = schemas.$ZodStringFormatInternals;
    export import $ZodStringFormat = schemas.$ZodStringFormat;
    export import $ZodGUIDDef = schemas.$ZodGUIDDef;
    export import $ZodGUIDInternals = schemas.$ZodGUIDInternals;
    export import $ZodGUID = schemas.$ZodGUID;
    export import $ZodUUIDDef = schemas.$ZodUUIDDef;
    export import $ZodUUIDInternals = schemas.$ZodUUIDInternals;
    export import $ZodUUID = schemas.$ZodUUID;
    export import $ZodEmailDef = schemas.$ZodEmailDef;
    export import $ZodEmailInternals = schemas.$ZodEmailInternals;
    export import $ZodEmail = schemas.$ZodEmail;
    export import $ZodURLDef = schemas.$ZodURLDef;
    export import $ZodURLInternals = schemas.$ZodURLInternals;
    export import $ZodURL = schemas.$ZodURL;
    export import $ZodEmojiDef = schemas.$ZodEmojiDef;
    export import $ZodEmojiInternals = schemas.$ZodEmojiInternals;
    export import $ZodEmoji = schemas.$ZodEmoji;
    export import $ZodNanoIDDef = schemas.$ZodNanoIDDef;
    export import $ZodNanoIDInternals = schemas.$ZodNanoIDInternals;
    export import $ZodNanoID = schemas.$ZodNanoID;
    export import $ZodCUIDDef = schemas.$ZodCUIDDef;
    export import $ZodCUIDInternals = schemas.$ZodCUIDInternals;
    export import $ZodCUID = schemas.$ZodCUID;
    export import $ZodCUID2Def = schemas.$ZodCUID2Def;
    export import $ZodCUID2Internals = schemas.$ZodCUID2Internals;
    export import $ZodCUID2 = schemas.$ZodCUID2;
    export import $ZodULIDDef = schemas.$ZodULIDDef;
    export import $ZodULIDInternals = schemas.$ZodULIDInternals;
    export import $ZodULID = schemas.$ZodULID;
    export import $ZodXIDDef = schemas.$ZodXIDDef;
    export import $ZodXIDInternals = schemas.$ZodXIDInternals;
    export import $ZodXID = schemas.$ZodXID;
    export import $ZodKSUIDDef = schemas.$ZodKSUIDDef;
    export import $ZodKSUIDInternals = schemas.$ZodKSUIDInternals;
    export import $ZodKSUID = schemas.$ZodKSUID;
    export import $ZodISODateTimeDef = schemas.$ZodISODateTimeDef;
    export import $ZodISODateTimeInternals = schemas.$ZodISODateTimeInternals;
    export import $ZodISODateTime = schemas.$ZodISODateTime;
    export import $ZodISODateDef = schemas.$ZodISODateDef;
    export import $ZodISODateInternals = schemas.$ZodISODateInternals;
    export import $ZodISODate = schemas.$ZodISODate;
    export import $ZodISOTimeDef = schemas.$ZodISOTimeDef;
    export import $ZodISOTimeInternals = schemas.$ZodISOTimeInternals;
    export import $ZodISOTime = schemas.$ZodISOTime;
    export import $ZodISODurationDef = schemas.$ZodISODurationDef;
    export import $ZodISODurationInternals = schemas.$ZodISODurationInternals;
    export import $ZodISODuration = schemas.$ZodISODuration;
    export import $ZodIPv4Def = schemas.$ZodIPv4Def;
    export import $ZodIPv4Internals = schemas.$ZodIPv4Internals;
    export import $ZodIPv4 = schemas.$ZodIPv4;
    export import $ZodIPv6Def = schemas.$ZodIPv6Def;
    export import $ZodIPv6Internals = schemas.$ZodIPv6Internals;
    export import $ZodIPv6 = schemas.$ZodIPv6;
    export import $ZodCIDRv4Def = schemas.$ZodCIDRv4Def;
    export import $ZodCIDRv4Internals = schemas.$ZodCIDRv4Internals;
    export import $ZodCIDRv4 = schemas.$ZodCIDRv4;
    export import $ZodCIDRv6Def = schemas.$ZodCIDRv6Def;
    export import $ZodCIDRv6Internals = schemas.$ZodCIDRv6Internals;
    export import $ZodCIDRv6 = schemas.$ZodCIDRv6;
    export import isValidBase64 = schemas.isValidBase64;
    export import $ZodBase64Def = schemas.$ZodBase64Def;
    export import $ZodBase64Internals = schemas.$ZodBase64Internals;
    export import $ZodBase64 = schemas.$ZodBase64;
    export import isValidBase64URL = schemas.isValidBase64URL;
    export import $ZodBase64URLDef = schemas.$ZodBase64URLDef;
    export import $ZodBase64URLInternals = schemas.$ZodBase64URLInternals;
    export import $ZodBase64URL = schemas.$ZodBase64URL;
    export import $ZodE164Def = schemas.$ZodE164Def;
    export import $ZodE164Internals = schemas.$ZodE164Internals;
    export import $ZodE164 = schemas.$ZodE164;
    export import isValidJWT = schemas.isValidJWT;
    export import $ZodJWTDef = schemas.$ZodJWTDef;
    export import $ZodJWTInternals = schemas.$ZodJWTInternals;
    export import $ZodJWT = schemas.$ZodJWT;
    export import $ZodNumberDef = schemas.$ZodNumberDef;
    export import $ZodNumberInternals = schemas.$ZodNumberInternals;
    export import $ZodNumber = schemas.$ZodNumber;
    export import $ZodNumberFormatDef = schemas.$ZodNumberFormatDef;
    export import $ZodNumberFormatInternals = schemas.$ZodNumberFormatInternals;
    export import $ZodNumberFormat = schemas.$ZodNumberFormat;
    export import $ZodBooleanDef = schemas.$ZodBooleanDef;
    export import $ZodBooleanInternals = schemas.$ZodBooleanInternals;
    export import $ZodBoolean = schemas.$ZodBoolean;
    export import $ZodBigIntDef = schemas.$ZodBigIntDef;
    export import $ZodBigIntInternals = schemas.$ZodBigIntInternals;
    export import $ZodBigInt = schemas.$ZodBigInt;
    export import $ZodBigIntFormatDef = schemas.$ZodBigIntFormatDef;
    export import $ZodBigIntFormatInternals = schemas.$ZodBigIntFormatInternals;
    export import $ZodBigIntFormat = schemas.$ZodBigIntFormat;
    export import $ZodSymbolDef = schemas.$ZodSymbolDef;
    export import $ZodSymbolInternals = schemas.$ZodSymbolInternals;
    export import $ZodSymbol = schemas.$ZodSymbol;
    export import $ZodUndefinedDef = schemas.$ZodUndefinedDef;
    export import $ZodUndefinedInternals = schemas.$ZodUndefinedInternals;
    export import $ZodUndefined = schemas.$ZodUndefined;
    export import $ZodNullDef = schemas.$ZodNullDef;
    export import $ZodNullInternals = schemas.$ZodNullInternals;
    export import $ZodNull = schemas.$ZodNull;
    export import $ZodAnyDef = schemas.$ZodAnyDef;
    export import $ZodAnyInternals = schemas.$ZodAnyInternals;
    export import $ZodAny = schemas.$ZodAny;
    export import $ZodUnknownDef = schemas.$ZodUnknownDef;
    export import $ZodUnknownInternals = schemas.$ZodUnknownInternals;
    export import $ZodUnknown = schemas.$ZodUnknown;
    export import $ZodNeverDef = schemas.$ZodNeverDef;
    export import $ZodNeverInternals = schemas.$ZodNeverInternals;
    export import $ZodNever = schemas.$ZodNever;
    export import $ZodVoidDef = schemas.$ZodVoidDef;
    export import $ZodVoidInternals = schemas.$ZodVoidInternals;
    export import $ZodVoid = schemas.$ZodVoid;
    export import $ZodDateDef = schemas.$ZodDateDef;
    export import $ZodDateInternals = schemas.$ZodDateInternals;
    export import $ZodDate = schemas.$ZodDate;
    export import $ZodArrayDef = schemas.$ZodArrayDef;
    export import $ZodArrayInternals = schemas.$ZodArrayInternals;
    export import $ZodArray = schemas.$ZodArray;
    export import $ZodShape = schemas.$ZodShape;
    export import $ZodObjectDef = schemas.$ZodObjectDef;
    export import $ZodObjectInternals = schemas.$ZodObjectInternals;
    export import $ZodLooseShape = schemas.$ZodLooseShape;
    export import $InferObjectOutput = schemas.$InferObjectOutput;
    export import $InferObjectInput = schemas.$InferObjectInput;
    export import $ZodObjectConfig = schemas.$ZodObjectConfig;
    export import $loose = schemas.$loose;
    export import $strict = schemas.$strict;
    export import $strip = schemas.$strip;
    export import $catchall = schemas.$catchall;
    export import $ZodObject = schemas.$ZodObject;
    export import $InferUnionOutput = schemas.$InferUnionOutput;
    export import $InferUnionInput = schemas.$InferUnionInput;
    export import $ZodUnionDef = schemas.$ZodUnionDef;
    export import $ZodUnionInternals = schemas.$ZodUnionInternals;
    export import $ZodUnion = schemas.$ZodUnion;
    export import $ZodDiscriminatedUnionDef = schemas.$ZodDiscriminatedUnionDef;
    export import $ZodDiscriminatedUnionInternals = schemas.$ZodDiscriminatedUnionInternals;
    export import $ZodDiscriminatedUnion = schemas.$ZodDiscriminatedUnion;
    export import $ZodIntersectionDef = schemas.$ZodIntersectionDef;
    export import $ZodIntersectionInternals = schemas.$ZodIntersectionInternals;
    export import $ZodIntersection = schemas.$ZodIntersection;
    export import $ZodTupleDef = schemas.$ZodTupleDef;
    export import $InferTupleInputType = schemas.$InferTupleInputType;
    export import $InferTupleOutputType = schemas.$InferTupleOutputType;
    export import $ZodTupleInternals = schemas.$ZodTupleInternals;
    export import $ZodTuple = schemas.$ZodTuple;
    export import $ZodRecordKey = schemas.$ZodRecordKey;
    export import $InferZodRecordOutput = schemas.$InferZodRecordOutput;
    export import $InferZodRecordInput = schemas.$InferZodRecordInput;
    export import $ZodRecordInternals = schemas.$ZodRecordInternals;
    export import $ZodRecord = schemas.$ZodRecord;
    export import $ZodMapDef = schemas.$ZodMapDef;
    export import $ZodMapInternals = schemas.$ZodMapInternals;
    export import $ZodMap = schemas.$ZodMap;
    export import $ZodSetDef = schemas.$ZodSetDef;
    export import $ZodSetInternals = schemas.$ZodSetInternals;
    export import $ZodSet = schemas.$ZodSet;
    export import $InferEnumOutput = schemas.$InferEnumOutput;
    export import $InferEnumInput = schemas.$InferEnumInput;
    export import $ZodEnumDef = schemas.$ZodEnumDef;
    export import $ZodEnumInternals = schemas.$ZodEnumInternals;
    export import $ZodEnum = schemas.$ZodEnum;
    export import $ZodLiteralDef = schemas.$ZodLiteralDef;
    export import $ZodLiteralInternals = schemas.$ZodLiteralInternals;
    export import $ZodLiteral = schemas.$ZodLiteral;
    export import $ZodFileDef = schemas.$ZodFileDef;
    export import $ZodFileInternals = schemas.$ZodFileInternals;
    export import $ZodFile = schemas.$ZodFile;
    export import $ZodTransformDef = schemas.$ZodTransformDef;
    export import $ZodTransformInternals = schemas.$ZodTransformInternals;
    export import $ZodTransform = schemas.$ZodTransform;
    export import $ZodOptionalDef = schemas.$ZodOptionalDef;
    export import $ZodOptionalInternals = schemas.$ZodOptionalInternals;
    export import $ZodOptional = schemas.$ZodOptional;
    export import $ZodNullableDef = schemas.$ZodNullableDef;
    export import $ZodNullableInternals = schemas.$ZodNullableInternals;
    export import $ZodNullable = schemas.$ZodNullable;
    export import $ZodDefaultDef = schemas.$ZodDefaultDef;
    export import $ZodDefaultInternals = schemas.$ZodDefaultInternals;
    export import $ZodDefault = schemas.$ZodDefault;
    export import $ZodPrefaultDef = schemas.$ZodPrefaultDef;
    export import $ZodPrefaultInternals = schemas.$ZodPrefaultInternals;
    export import $ZodPrefault = schemas.$ZodPrefault;
    export import $ZodNonOptionalDef = schemas.$ZodNonOptionalDef;
    export import $ZodNonOptionalInternals = schemas.$ZodNonOptionalInternals;
    export import $ZodNonOptional = schemas.$ZodNonOptional;
    export import $ZodSuccessDef = schemas.$ZodSuccessDef;
    export import $ZodSuccessInternals = schemas.$ZodSuccessInternals;
    export import $ZodSuccess = schemas.$ZodSuccess;
    export import $ZodCatchCtx = schemas.$ZodCatchCtx;
    export import $ZodCatchDef = schemas.$ZodCatchDef;
    export import $ZodCatchInternals = schemas.$ZodCatchInternals;
    export import $ZodCatch = schemas.$ZodCatch;
    export import $ZodNaNDef = schemas.$ZodNaNDef;
    export import $ZodNaNInternals = schemas.$ZodNaNInternals;
    export import $ZodNaN = schemas.$ZodNaN;
    export import $ZodPipeDef = schemas.$ZodPipeDef;
    export import $ZodPipeInternals = schemas.$ZodPipeInternals;
    export import $ZodPipe = schemas.$ZodPipe;
    export import $ZodReadonlyDef = schemas.$ZodReadonlyDef;
    export import $ZodReadonlyInternals = schemas.$ZodReadonlyInternals;
    export import $ZodReadonly = schemas.$ZodReadonly;
    export import $ZodTemplateLiteralDef = schemas.$ZodTemplateLiteralDef;
    export import $ZodTemplateLiteralInternals = schemas.$ZodTemplateLiteralInternals;
    export import $ZodTemplateLiteral = schemas.$ZodTemplateLiteral;
    export import $ZodTemplateLiteralPart = schemas.$ZodTemplateLiteralPart;
    export import $PartsToTemplateLiteral = schemas.$PartsToTemplateLiteral;
    export import $ZodPromiseDef = schemas.$ZodPromiseDef;
    export import $ZodPromiseInternals = schemas.$ZodPromiseInternals;
    export import $ZodPromise = schemas.$ZodPromise;
    export import $ZodLazyDef = schemas.$ZodLazyDef;
    export import $ZodLazyInternals = schemas.$ZodLazyInternals;
    export import $ZodLazy = schemas.$ZodLazy;
    export import $ZodCustomDef = schemas.$ZodCustomDef;
    export import $ZodCustomInternals = schemas.$ZodCustomInternals;
    export import $ZodCustom = schemas.$ZodCustom;
    export import $ZodTypes = schemas.$ZodTypes;
    export import $ZodStringFormatTypes = schemas.$ZodStringFormatTypes;
    export import clone = schemas.clone;

    // CHECKS

    namespace checks {
      interface $ZodCheckDef {
        check: string;
        error?: errors.$ZodErrorMap<never> | undefined;
        /** If true, no later checks will be executed if this check fails. Default `false`. */
        abort?: boolean | undefined;
      }

      interface $ZodCheckInternals<T> {
        def: $ZodCheckDef;
        /** The set of issues this check might throw. */
        issc?: errors.$ZodIssueBase;
        check(payload: schemas.ParsePayload<T>): util.MaybeAsync<void>;
        onattach: ((schema: schemas.$ZodType) => void)[];
        when?: ((payload: schemas.ParsePayload) => boolean) | undefined;
      }

      interface $ZodCheck<in T = never> {
        _zod: $ZodCheckInternals<T>;
      }

      const $ZodCheck: core.$constructor<$ZodCheck<any>>;

      interface $ZodCheckLessThanDef extends $ZodCheckDef {
        check: 'less_than';
        value: util.Numeric;
        inclusive: boolean;
      }

      interface $ZodCheckLessThanInternals<T extends util.Numeric = util.Numeric> extends $ZodCheckInternals<T> {
        def: $ZodCheckLessThanDef;
        issc: errors.$ZodIssueTooSmall<T>;
      }

      interface $ZodCheckLessThan<T extends util.Numeric = util.Numeric> extends $ZodCheck<T> {
        _zod: $ZodCheckLessThanInternals<T>;
      }

      const $ZodCheckLessThan: core.$constructor<$ZodCheckLessThan>;

      interface $ZodCheckGreaterThanDef extends $ZodCheckDef {
        check: 'greater_than';
        value: util.Numeric;
        inclusive: boolean;
      }

      interface $ZodCheckGreaterThanInternals<T extends util.Numeric = util.Numeric> extends $ZodCheckInternals<T> {
        def: $ZodCheckGreaterThanDef;
        issc: errors.$ZodIssueTooSmall<T>;
      }

      interface $ZodCheckGreaterThan<T extends util.Numeric = util.Numeric> extends $ZodCheck<T> {
        _zod: $ZodCheckGreaterThanInternals<T>;
      }

      const $ZodCheckGreaterThan: core.$constructor<$ZodCheckGreaterThan>;

      interface $ZodCheckMultipleOfDef<T extends number | bigint = number | bigint> extends $ZodCheckDef {
        check: 'multiple_of';
        value: T;
      }

      interface $ZodCheckMultipleOfInternals<T extends number | bigint = number | bigint>
        extends $ZodCheckInternals<T> {
        def: $ZodCheckMultipleOfDef<T>;
        issc: errors.$ZodIssueNotMultipleOf;
      }

      interface $ZodCheckMultipleOf<T extends number | bigint = number | bigint> extends $ZodCheck<T> {
        _zod: $ZodCheckMultipleOfInternals<T>;
      }

      const $ZodCheckMultipleOf: core.$constructor<$ZodCheckMultipleOf<number | bigint>>;

      type $ZodNumberFormats = 'int32' | 'uint32' | 'float32' | 'float64' | 'safeint';

      interface $ZodCheckNumberFormatDef extends $ZodCheckDef {
        check: 'number_format';
        format: $ZodNumberFormats;
      }

      interface $ZodCheckNumberFormatInternals extends $ZodCheckInternals<number> {
        def: $ZodCheckNumberFormatDef;
        issc: errors.$ZodIssueInvalidType | errors.$ZodIssueTooBig<'number'> | errors.$ZodIssueTooSmall<'number'>;
      }

      interface $ZodCheckNumberFormat extends $ZodCheck<number> {
        _zod: $ZodCheckNumberFormatInternals;
      }

      const $ZodCheckNumberFormat: core.$constructor<$ZodCheckNumberFormat>;

      type $ZodBigIntFormats = 'int64' | 'uint64';

      interface $ZodCheckBigIntFormatDef extends $ZodCheckDef {
        check: 'bigint_format';
        format: $ZodBigIntFormats | undefined;
      }

      interface $ZodCheckBigIntFormatInternals extends $ZodCheckInternals<bigint> {
        def: $ZodCheckBigIntFormatDef;
        issc: errors.$ZodIssueTooBig<'bigint'> | errors.$ZodIssueTooSmall<'bigint'>;
      }

      interface $ZodCheckBigIntFormat extends $ZodCheck<bigint> {
        _zod: $ZodCheckBigIntFormatInternals;
      }

      const $ZodCheckBigIntFormat: core.$constructor<$ZodCheckBigIntFormat>;

      interface $ZodCheckMaxSizeDef extends $ZodCheckDef {
        check: 'max_size';
        maximum: number;
      }

      interface $ZodCheckMaxSizeInternals<T extends util.HasSize = util.HasSize> extends $ZodCheckInternals<T> {
        def: $ZodCheckMaxSizeDef;
        issc: errors.$ZodIssueTooBig<T>;
      }

      interface $ZodCheckMaxSize<T extends util.HasSize = util.HasSize> extends $ZodCheck<T> {
        _zod: $ZodCheckMaxSizeInternals<T>;
      }

      const $ZodCheckMaxSize: core.$constructor<$ZodCheckMaxSize>;

      interface $ZodCheckMinSizeDef extends $ZodCheckDef {
        check: 'min_size';
        minimum: number;
      }

      interface $ZodCheckMinSizeInternals<T extends util.HasSize = util.HasSize> extends $ZodCheckInternals<T> {
        def: $ZodCheckMinSizeDef;
        issc: errors.$ZodIssueTooSmall<T>;
      }

      interface $ZodCheckMinSize<T extends util.HasSize = util.HasSize> extends $ZodCheck<T> {
        _zod: $ZodCheckMinSizeInternals<T>;
      }

      const $ZodCheckMinSize: core.$constructor<$ZodCheckMinSize>;

      interface $ZodCheckSizeEqualsDef extends $ZodCheckDef {
        check: 'size_equals';
        size: number;
      }

      interface $ZodCheckSizeEqualsInternals<T extends util.HasSize = util.HasSize> extends $ZodCheckInternals<T> {
        def: $ZodCheckSizeEqualsDef;
        issc: errors.$ZodIssueTooBig<T> | errors.$ZodIssueTooSmall<T>;
      }

      interface $ZodCheckSizeEquals<T extends util.HasSize = util.HasSize> extends $ZodCheck<T> {
        _zod: $ZodCheckSizeEqualsInternals<T>;
      }

      const $ZodCheckSizeEquals: core.$constructor<$ZodCheckSizeEquals>;

      interface $ZodCheckMaxLengthDef extends $ZodCheckDef {
        check: 'max_length';
        maximum: number;
      }

      interface $ZodCheckMaxLengthInternals<T extends util.HasLength = util.HasLength> extends $ZodCheckInternals<T> {
        def: $ZodCheckMaxLengthDef;
        issc: errors.$ZodIssueTooBig<T>;
      }

      interface $ZodCheckMaxLength<T extends util.HasLength = util.HasLength> extends $ZodCheck<T> {
        _zod: $ZodCheckMaxLengthInternals<T>;
      }

      const $ZodCheckMaxLength: core.$constructor<$ZodCheckMaxLength>;

      interface $ZodCheckMinLengthDef extends $ZodCheckDef {
        check: 'min_length';
        minimum: number;
      }

      interface $ZodCheckMinLengthInternals<T extends util.HasLength = util.HasLength> extends $ZodCheckInternals<T> {
        def: $ZodCheckMinLengthDef;
        issc: errors.$ZodIssueTooSmall<T>;
      }

      interface $ZodCheckMinLength<T extends util.HasLength = util.HasLength> extends $ZodCheck<T> {
        _zod: $ZodCheckMinLengthInternals<T>;
      }

      const $ZodCheckMinLength: core.$constructor<$ZodCheckMinLength>;

      interface $ZodCheckLengthEqualsDef extends $ZodCheckDef {
        check: 'length_equals';
        length: number;
      }

      interface $ZodCheckLengthEqualsInternals<T extends util.HasLength = util.HasLength>
        extends $ZodCheckInternals<T> {
        def: $ZodCheckLengthEqualsDef;
        issc: errors.$ZodIssueTooBig<T> | errors.$ZodIssueTooSmall<T>;
      }

      interface $ZodCheckLengthEquals<T extends util.HasLength = util.HasLength> extends $ZodCheck<T> {
        _zod: $ZodCheckLengthEqualsInternals<T>;
      }

      const $ZodCheckLengthEquals: core.$constructor<$ZodCheckLengthEquals>;

      type $ZodStringFormats =
        | 'email'
        | 'url'
        | 'emoji'
        | 'uuid'
        | 'guid'
        | 'nanoid'
        | 'cuid'
        | 'cuid2'
        | 'ulid'
        | 'xid'
        | 'ksuid'
        | 'datetime'
        | 'date'
        | 'time'
        | 'duration'
        | 'ipv4'
        | 'ipv6'
        | 'cidrv4'
        | 'cidrv6'
        | 'base64'
        | 'base64url'
        | 'json_string'
        | 'e164'
        | 'lowercase'
        | 'uppercase'
        | 'regex'
        | 'jwt'
        | 'starts_with'
        | 'ends_with'
        | 'includes';

      interface $ZodCheckStringFormatDef<Format extends $ZodStringFormats = $ZodStringFormats> extends $ZodCheckDef {
        check: 'string_format';
        format: Format;
        pattern?: RegExp | undefined;
      }

      interface $ZodCheckStringFormatInternals extends $ZodCheckInternals<string> {
        def: $ZodCheckStringFormatDef;
        issc: errors.$ZodIssueInvalidStringFormat;
      }

      interface $ZodCheckStringFormat extends $ZodCheck<string> {
        _zod: $ZodCheckStringFormatInternals;
      }

      const $ZodCheckStringFormat: core.$constructor<$ZodCheckStringFormat>;

      interface $ZodCheckRegexDef extends $ZodCheckStringFormatDef {
        format: 'regex';
        pattern: RegExp;
      }

      interface $ZodCheckRegexInternals extends $ZodCheckInternals<string> {
        def: $ZodCheckRegexDef;
        issc: errors.$ZodIssueInvalidStringFormat;
      }

      interface $ZodCheckRegex extends $ZodCheck<string> {
        _zod: $ZodCheckRegexInternals;
      }

      const $ZodCheckRegex: core.$constructor<$ZodCheckRegex>;

      interface $ZodCheckLowerCaseDef extends $ZodCheckStringFormatDef<'lowercase'> {}

      interface $ZodCheckLowerCaseInternals extends $ZodCheckInternals<string> {
        def: $ZodCheckLowerCaseDef;
        issc: errors.$ZodIssueInvalidStringFormat;
      }

      interface $ZodCheckLowerCase extends $ZodCheck<string> {
        _zod: $ZodCheckLowerCaseInternals;
      }

      const $ZodCheckLowerCase: core.$constructor<$ZodCheckLowerCase>;

      interface $ZodCheckUpperCaseDef extends $ZodCheckStringFormatDef<'uppercase'> {}

      interface $ZodCheckUpperCaseInternals extends $ZodCheckInternals<string> {
        def: $ZodCheckUpperCaseDef;
        issc: errors.$ZodIssueInvalidStringFormat;
      }

      interface $ZodCheckUpperCase extends $ZodCheck<string> {
        _zod: $ZodCheckUpperCaseInternals;
      }

      const $ZodCheckUpperCase: core.$constructor<$ZodCheckUpperCase>;

      interface $ZodCheckIncludesDef extends $ZodCheckStringFormatDef<'includes'> {
        includes: string;
        position?: number | undefined;
      }

      interface $ZodCheckIncludesInternals extends $ZodCheckInternals<string> {
        def: $ZodCheckIncludesDef;
        issc: errors.$ZodIssueInvalidStringFormat;
      }

      interface $ZodCheckIncludes extends $ZodCheck<string> {
        _zod: $ZodCheckIncludesInternals;
      }

      const $ZodCheckIncludes: core.$constructor<$ZodCheckIncludes>;

      interface $ZodCheckStartsWithDef extends $ZodCheckStringFormatDef<'starts_with'> {
        prefix: string;
      }

      interface $ZodCheckStartsWithInternals extends $ZodCheckInternals<string> {
        def: $ZodCheckStartsWithDef;
        issc: errors.$ZodIssueInvalidStringFormat;
      }

      interface $ZodCheckStartsWith extends $ZodCheck<string> {
        _zod: $ZodCheckStartsWithInternals;
      }

      const $ZodCheckStartsWith: core.$constructor<$ZodCheckStartsWith>;

      interface $ZodCheckEndsWithDef extends $ZodCheckStringFormatDef<'ends_with'> {
        suffix: string;
      }

      interface $ZodCheckEndsWithInternals extends $ZodCheckInternals<string> {
        def: $ZodCheckEndsWithDef;
        issc: errors.$ZodIssueInvalidStringFormat;
      }

      interface $ZodCheckEndsWith extends $ZodCheckInternals<string> {
        _zod: $ZodCheckEndsWithInternals;
      }

      const $ZodCheckEndsWith: core.$constructor<$ZodCheckEndsWith>;

      interface $ZodCheckPropertyDef extends $ZodCheckDef {
        check: 'property';
        property: string;
        schema: schemas.$ZodType;
      }

      interface $ZodCheckPropertyInternals<T extends object = object> extends $ZodCheckInternals<T> {
        def: $ZodCheckPropertyDef;
        issc: errors.$ZodIssue;
      }

      interface $ZodCheckProperty<T extends object = object> extends $ZodCheck<T> {
        _zod: $ZodCheckPropertyInternals<T>;
      }

      const $ZodCheckProperty: core.$constructor<$ZodCheckProperty>;

      interface $ZodCheckMimeTypeDef extends $ZodCheckDef {
        check: 'mime_type';
        mime: util.MimeTypes[];
      }

      interface $ZodCheckMimeTypeInternals<T extends File = File> extends $ZodCheckInternals<T> {
        def: $ZodCheckMimeTypeDef;
        issc: errors.$ZodIssueInvalidValue;
      }

      interface $ZodCheckMimeType<T extends File = File> extends $ZodCheck<T> {
        _zod: $ZodCheckMimeTypeInternals<T>;
      }

      const $ZodCheckMimeType: core.$constructor<$ZodCheckMimeType>;

      interface $ZodCheckOverwriteDef<T = unknown> extends $ZodCheckDef {
        check: 'overwrite';
        tx(value: T): T;
      }

      interface $ZodCheckOverwriteInternals<T = unknown> extends $ZodCheckInternals<T> {
        def: $ZodCheckOverwriteDef<T>;
        issc: never;
      }

      interface $ZodCheckOverwrite<T = unknown> extends $ZodCheck<T> {
        _zod: $ZodCheckOverwriteInternals<T>;
      }

      const $ZodCheckOverwrite: core.$constructor<$ZodCheckOverwrite>;

      type $ZodChecks =
        | $ZodCheckLessThan
        | $ZodCheckGreaterThan
        | $ZodCheckMultipleOf
        | $ZodCheckNumberFormat
        | $ZodCheckBigIntFormat
        | $ZodCheckMaxSize
        | $ZodCheckMinSize
        | $ZodCheckSizeEquals
        | $ZodCheckMaxLength
        | $ZodCheckMinLength
        | $ZodCheckLengthEquals
        | $ZodCheckStringFormat
        | $ZodCheckProperty
        | $ZodCheckMimeType
        | $ZodCheckOverwrite;

      type $ZodStringFormatChecks =
        | $ZodCheckRegex
        | $ZodCheckLowerCase
        | $ZodCheckUpperCase
        | $ZodCheckIncludes
        | $ZodCheckStartsWith
        | $ZodCheckEndsWith
        | schemas.$ZodGUID
        | schemas.$ZodUUID
        | schemas.$ZodEmail
        | schemas.$ZodURL
        | schemas.$ZodEmoji
        | schemas.$ZodNanoID
        | schemas.$ZodCUID
        | schemas.$ZodCUID2
        | schemas.$ZodULID
        | schemas.$ZodXID
        | schemas.$ZodKSUID
        | schemas.$ZodISODateTime
        | schemas.$ZodISODate
        | schemas.$ZodISOTime
        | schemas.$ZodISODuration
        | schemas.$ZodIPv4
        | schemas.$ZodIPv6
        | schemas.$ZodCIDRv4
        | schemas.$ZodCIDRv6
        | schemas.$ZodBase64
        | schemas.$ZodBase64URL
        | schemas.$ZodE164
        | schemas.$ZodJWT;
    }

    export import $ZodCheckDef = checks.$ZodCheckDef;
    export import $ZodCheckInternals = checks.$ZodCheckInternals;
    export import $ZodCheck = checks.$ZodCheck;
    export import $ZodCheckLessThanDef = checks.$ZodCheckLessThanDef;
    export import $ZodCheckLessThanInternals = checks.$ZodCheckLessThanInternals;
    export import $ZodCheckLessThan = checks.$ZodCheckLessThan;
    export import $ZodCheckGreaterThanDef = checks.$ZodCheckGreaterThanDef;
    export import $ZodCheckGreaterThanInternals = checks.$ZodCheckGreaterThanInternals;
    export import $ZodCheckGreaterThan = checks.$ZodCheckGreaterThan;
    export import $ZodCheckMultipleOfDef = checks.$ZodCheckMultipleOfDef;
    export import $ZodCheckMultipleOfInternals = checks.$ZodCheckMultipleOfInternals;
    export import $ZodCheckMultipleOf = checks.$ZodCheckMultipleOf;
    export import $ZodNumberFormats = checks.$ZodNumberFormats;
    export import $ZodCheckNumberFormatDef = checks.$ZodCheckNumberFormatDef;
    export import $ZodCheckNumberFormatInternals = checks.$ZodCheckNumberFormatInternals;
    export import $ZodCheckNumberFormat = checks.$ZodCheckNumberFormat;
    export import $ZodBigIntFormats = checks.$ZodBigIntFormats;
    export import $ZodCheckBigIntFormatDef = checks.$ZodCheckBigIntFormatDef;
    export import $ZodCheckBigIntFormatInternals = checks.$ZodCheckBigIntFormatInternals;
    export import $ZodCheckBigIntFormat = checks.$ZodCheckBigIntFormat;
    export import $ZodCheckMaxSizeDef = checks.$ZodCheckMaxSizeDef;
    export import $ZodCheckMaxSizeInternals = checks.$ZodCheckMaxSizeInternals;
    export import $ZodCheckMaxSize = checks.$ZodCheckMaxSize;
    export import $ZodCheckMinSizeDef = checks.$ZodCheckMinSizeDef;
    export import $ZodCheckMinSizeInternals = checks.$ZodCheckMinSizeInternals;
    export import $ZodCheckMinSize = checks.$ZodCheckMinSize;
    export import $ZodCheckSizeEqualsDef = checks.$ZodCheckSizeEqualsDef;
    export import $ZodCheckSizeEqualsInternals = checks.$ZodCheckSizeEqualsInternals;
    export import $ZodCheckSizeEquals = checks.$ZodCheckSizeEquals;
    export import $ZodCheckMaxLengthDef = checks.$ZodCheckMaxLengthDef;
    export import $ZodCheckMaxLengthInternals = checks.$ZodCheckMaxLengthInternals;
    export import $ZodCheckMaxLength = checks.$ZodCheckMaxLength;
    export import $ZodCheckMinLengthDef = checks.$ZodCheckMinLengthDef;
    export import $ZodCheckMinLengthInternals = checks.$ZodCheckMinLengthInternals;
    export import $ZodCheckMinLength = checks.$ZodCheckMinLength;
    export import $ZodCheckLengthEqualsDef = checks.$ZodCheckLengthEqualsDef;
    export import $ZodCheckLengthEqualsInternals = checks.$ZodCheckLengthEqualsInternals;
    export import $ZodCheckLengthEquals = checks.$ZodCheckLengthEquals;
    export import $ZodStringFormats = checks.$ZodStringFormats;
    export import $ZodCheckStringFormatDef = checks.$ZodCheckStringFormatDef;
    export import $ZodCheckStringFormatInternals = checks.$ZodCheckStringFormatInternals;
    export import $ZodCheckStringFormat = checks.$ZodCheckStringFormat;
    export import $ZodCheckRegexDef = checks.$ZodCheckRegexDef;
    export import $ZodCheckRegexInternals = checks.$ZodCheckRegexInternals;
    export import $ZodCheckRegex = checks.$ZodCheckRegex;
    export import $ZodCheckLowerCaseDef = checks.$ZodCheckLowerCaseDef;
    export import $ZodCheckLowerCaseInternals = checks.$ZodCheckLowerCaseInternals;
    export import $ZodCheckLowerCase = checks.$ZodCheckLowerCase;
    export import $ZodCheckUpperCaseDef = checks.$ZodCheckUpperCaseDef;
    export import $ZodCheckUpperCaseInternals = checks.$ZodCheckUpperCaseInternals;
    export import $ZodCheckUpperCase = checks.$ZodCheckUpperCase;
    export import $ZodCheckIncludesDef = checks.$ZodCheckIncludesDef;
    export import $ZodCheckIncludesInternals = checks.$ZodCheckIncludesInternals;
    export import $ZodCheckIncludes = checks.$ZodCheckIncludes;
    export import $ZodCheckStartsWithDef = checks.$ZodCheckStartsWithDef;
    export import $ZodCheckStartsWithInternals = checks.$ZodCheckStartsWithInternals;
    export import $ZodCheckStartsWith = checks.$ZodCheckStartsWith;
    export import $ZodCheckEndsWithDef = checks.$ZodCheckEndsWithDef;
    export import $ZodCheckEndsWithInternals = checks.$ZodCheckEndsWithInternals;
    export import $ZodCheckEndsWith = checks.$ZodCheckEndsWith;
    export import $ZodCheckPropertyDef = checks.$ZodCheckPropertyDef;
    export import $ZodCheckPropertyInternals = checks.$ZodCheckPropertyInternals;
    export import $ZodCheckProperty = checks.$ZodCheckProperty;
    export import $ZodCheckMimeTypeDef = checks.$ZodCheckMimeTypeDef;
    export import $ZodCheckMimeTypeInternals = checks.$ZodCheckMimeTypeInternals;
    export import $ZodCheckMimeType = checks.$ZodCheckMimeType;
    export import $ZodCheckOverwriteDef = checks.$ZodCheckOverwriteDef;
    export import $ZodCheckOverwriteInternals = checks.$ZodCheckOverwriteInternals;
    export import $ZodCheckOverwrite = checks.$ZodCheckOverwrite;
    export import $ZodChecks = checks.$ZodChecks;
    export import $ZodStringFormatChecks = checks.$ZodStringFormatChecks;

    // VERSIONS

    namespace versions {
      export const version: {
        readonly major: 4;
        readonly minor: 0;
        readonly patch: number;
      };
    }

    export import version = versions.version;

    // UTIL

    export namespace util {
      type JSONType =
        | string
        | number
        | boolean
        | null
        | JSONType[]
        | {
            [key: string]: JSONType;
          };

      type JWTAlgorithm =
        | 'HS256'
        | 'HS384'
        | 'HS512'
        | 'RS256'
        | 'RS384'
        | 'RS512'
        | 'ES256'
        | 'ES384'
        | 'ES512'
        | 'PS256'
        | 'PS384'
        | 'PS512';

      type IPVersion = 'v4' | 'v6';

      type MimeTypes =
        | 'application/json'
        | 'application/xml'
        | 'application/x-www-form-urlencoded'
        | 'application/javascript'
        | 'application/pdf'
        | 'application/zip'
        | 'application/vnd.ms-excel'
        | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        | 'application/msword'
        | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        | 'application/vnd.ms-powerpoint'
        | 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        | 'application/octet-stream'
        | 'application/graphql'
        | 'text/html'
        | 'text/plain'
        | 'text/css'
        | 'text/javascript'
        | 'text/csv'
        | 'image/png'
        | 'image/jpeg'
        | 'image/gif'
        | 'image/svg+xml'
        | 'image/webp'
        | 'audio/mpeg'
        | 'audio/ogg'
        | 'audio/wav'
        | 'audio/webm'
        | 'video/mp4'
        | 'video/webm'
        | 'video/ogg'
        | 'font/woff'
        | 'font/woff2'
        | 'font/ttf'
        | 'font/otf'
        | 'multipart/form-data'
        | (string & {});

      type ParsedTypes =
        | 'string'
        | 'number'
        | 'bigint'
        | 'boolean'
        | 'symbol'
        | 'undefined'
        | 'object'
        | 'function'
        | 'file'
        | 'date'
        | 'array'
        | 'map'
        | 'set'
        | 'nan'
        | 'null'
        | 'promise';

      type AssertEqual<T, U> = (<V>() => V extends T ? 1 : 2) extends <V>() => V extends U ? 1 : 2 ? true : false;

      type AssertNotEqual<T, U> = (<V>() => V extends T ? 1 : 2) extends <V>() => V extends U ? 1 : 2 ? false : true;

      type AssertExtends<T, U> = T extends U ? T : never;

      type IsAny<T> = 0 extends 1 & T ? true : false;

      type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

      type OmitKeys<T, K extends string> = Pick<T, Exclude<keyof T, K>>;

      type MakePartial<T, K extends keyof T> = Omit<T, K> & InexactPartial<Pick<T, K>>;

      type MakeRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

      type Exactly<T, X> = T & Record<Exclude<keyof X, keyof T>, never>;

      type NoUndefined<T> = T extends undefined ? never : T;

      type Whatever = {} | undefined | null;

      type LoosePartial<T extends object> = InexactPartial<T> & {
        [k: string]: unknown;
      };

      type Mask<Keys extends PropertyKey> = {
        [K in Keys]?: true;
      };

      type Writeable<T> = {
        -readonly [P in keyof T]: T[P];
      } & {};

      type InexactPartial<T> = {
        [P in keyof T]?: T[P] | undefined;
      };

      type EmptyObject = Record<string, never>;

      type BuiltIn =
        | (((...args: any[]) => any) | (new (...args: any[]) => any))
        | {
            readonly [Symbol.toStringTag]: string;
          }
        | Date
        | Error
        | Generator
        | Promise<unknown>
        | RegExp;

      type MakeReadonly<T> =
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

      type SomeObject = Record<PropertyKey, any>;

      type Identity<T> = T;

      type Flatten<T> = Identity<{
        [k in keyof T]: T[k];
      }>;

      type Mapped<T> = {
        [k in keyof T]: T[k];
      };

      type Prettify<T> = {
        [K in keyof T]: T[K];
      } & {};

      type NoNeverKeys<T> = {
        [k in keyof T]: [T[k]] extends [never] ? never : k;
      }[keyof T];

      type NoNever<T> = Identity<{
        [k in NoNeverKeys<T>]: k extends keyof T ? T[k] : never;
      }>;

      type Extend<A extends SomeObject, B extends SomeObject> = Flatten<
        keyof A & keyof B extends never
          ? A & B
          : {
              [K in keyof A as K extends keyof B ? never : K]: A[K];
            } & {
              [K in keyof B]: B[K];
            }
      >;

      type TupleItems = ReadonlyArray<schemas.$ZodType>;

      type AnyFunc = (...args: any[]) => any;

      type IsProp<T, K extends keyof T> = T[K] extends AnyFunc ? never : K;

      type MaybeAsync<T> = T | Promise<T>;

      type KeyOf<T> = keyof OmitIndexSignature<T>;

      type OmitIndexSignature<T> = {
        [K in keyof T as string extends K ? never : K extends string ? K : never]: T[K];
      };

      type ExtractIndexSignature<T> = {
        [K in keyof T as string extends K ? K : K extends string ? never : K]: T[K];
      };

      type Keys<T extends object> = keyof OmitIndexSignature<T>;

      type SchemaClass<T extends schemas.$ZodType> = {
        new (def: T['_zod']['def']): T;
      };

      type EnumValue = string | number;

      type EnumLike = Readonly<Record<string, EnumValue>>;

      type ToEnum<T extends EnumValue> = Flatten<{
        [k in T]: k;
      }>;

      type KeysEnum<T extends object> = ToEnum<Exclude<keyof T, symbol>>;

      type KeysArray<T extends object> = Flatten<(keyof T & string)[]>;

      type Literal = string | number | bigint | boolean | null | undefined;

      type LiteralArray = Array<Literal>;

      type Primitive = string | number | symbol | bigint | boolean | null | undefined;

      type PrimitiveArray = Array<Primitive>;

      type HasSize = {
        size: number;
      };

      type HasLength = {
        length: number;
      };

      type Numeric = number | bigint | Date;

      type SafeParseResult<T> = SafeParseSuccess<T> | SafeParseError<T>;

      type SafeParseSuccess<T> = {
        success: true;
        data: T;
        error?: never;
      };

      type SafeParseError<T> = {
        success: false;
        data?: never;
        error: errors.$ZodError<T>;
      };

      type DiscriminatorMapElement = {
        values: Set<Primitive>;
        maps: DiscriminatorMap[];
      };

      type DiscriminatorMap = Map<PropertyKey, DiscriminatorMapElement>;

      type PrimitiveSet = Set<Primitive>;

      function assertEqual<A, B>(val: AssertEqual<A, B>): AssertEqual<A, B>;

      function assertNotEqual<A, B>(val: AssertNotEqual<A, B>): AssertNotEqual<A, B>;

      function assertIs<T>(_arg: T): void;

      function assertNever(_x: never): never;

      function assert<T>(_: any): asserts _ is T;

      function getValidEnumValues(obj: any): any;

      function joinValues<T extends Primitive[]>(array: T, separator?: string): string;

      function jsonStringifyReplacer(_: string, value: any): any;

      function cached<T>(getter: () => T): {
        value: T;
      };

      function nullish(input: any): boolean;

      function cleanRegex(source: string): string;

      function floatSafeRemainder(val: number, step: number): number;

      function defineLazy<T, K extends keyof T>(object: T, key: K, getter: () => T[K]): void;

      function assignProp<T extends object, K extends PropertyKey>(
        target: T,
        prop: K,
        value: K extends keyof T ? T[K] : any
      ): void;

      function getElementAtPath(obj: any, path: (string | number)[] | null | undefined): any;

      function promiseAllObject<T extends object>(
        promisesObj: T
      ): Promise<{
        [k in keyof T]: Awaited<T[k]>;
      }>;

      function randomString(length?: number): string;

      function esc(str: string): string;

      function isObject(data: any): data is Record<PropertyKey, unknown>;

      const allowsEval: {
        value: boolean;
      };

      function isPlainObject(data: any): data is Record<PropertyKey, unknown>;

      function numKeys(data: any): number;

      const getParsedType: (data: any) => ParsedTypes;

      const propertyKeyTypes: Set<string>;

      const primitiveTypes: Set<string>;

      function escapeRegex(str: string): string;

      function clone<T extends schemas.$ZodType>(
        inst: T,
        def?: T['_zod']['def'],
        params?: {
          parent: boolean;
        }
      ): T;

      type EmptyToNever<T> = keyof T extends never ? never : T;

      type Normalize<T> = T extends undefined
        ? never
        : T extends Record<any, any>
          ? Flatten<
              {
                [k in keyof Omit<T, 'error' | 'message'>]: T[k];
              } & ('error' extends keyof T
                ? {
                    error?: Exclude<T['error'], string>;
                  }
                : unknown)
            >
          : never;

      function normalizeParams<T>(_params: T): Normalize<T>;

      function createTransparentProxy<T extends object>(getter: () => T): T;

      function stringifyPrimitive(value: any): string;

      function optionalKeys(shape: schemas.$ZodShape): string[];

      type CleanKey<T extends PropertyKey> = T extends `?${infer K}` ? K : T extends `${infer K}?` ? K : T;

      type ToCleanMap<T extends schemas.$ZodLooseShape> = {
        [k in keyof T]: k extends `?${infer K}` ? K : k extends `${infer K}?` ? K : k;
      };

      type FromCleanMap<T extends schemas.$ZodLooseShape> = {
        [k in keyof T as k extends `?${infer K}` ? K : k extends `${infer K}?` ? K : k]: k;
      };

      const NUMBER_FORMAT_RANGES: Record<checks.$ZodNumberFormats, [number, number]>;

      const BIGINT_FORMAT_RANGES: Record<checks.$ZodBigIntFormats, [bigint, bigint]>;

      function pick(schema: schemas.$ZodObject, mask: Record<string, unknown>): any;

      function omit(schema: schemas.$ZodObject, mask: object): any;

      function extend(schema: schemas.$ZodObject, shape: schemas.$ZodShape): any;

      function merge(a: schemas.$ZodObject, b: schemas.$ZodObject): any;

      function partial(
        Class: SchemaClass<schemas.$ZodOptional> | null,
        schema: schemas.$ZodObject,
        mask: object | undefined
      ): any;

      function required(
        Class: SchemaClass<schemas.$ZodNonOptional>,
        schema: schemas.$ZodObject,
        mask: object | undefined
      ): any;

      type Constructor<T, Def extends any[] = any[]> = new (...args: Def) => T;

      function aborted(x: schemas.ParsePayload, startIndex?: number): boolean;

      function prefixIssues(path: PropertyKey, issues: errors.$ZodRawIssue[]): errors.$ZodRawIssue[];

      function unwrapMessage(
        message:
          | string
          | {
              message: string;
            }
          | undefined
          | null
      ): string | undefined;

      function finalizeIssue(
        iss: errors.$ZodRawIssue,
        ctx: schemas.ParseContextInternal | undefined,
        config: $ZodConfig
      ): errors.$ZodIssue;

      function getSizableOrigin(input: any): 'set' | 'map' | 'file' | 'unknown';

      function getLengthableOrigin(input: any): 'array' | 'string' | 'unknown';

      function issue(_iss: string, input: any, inst: any): errors.$ZodRawIssue;

      function issue(_iss: errors.$ZodRawIssue): errors.$ZodRawIssue;

      function cleanEnum(obj: Record<string, EnumValue>): EnumValue[];

      abstract class Class {
        constructor(..._args: any[]);
      }
    }

    // REGEXES

    export namespace regexes {
      const cuid: RegExp;
      const cuid2: RegExp;
      const ulid: RegExp;
      const xid: RegExp;
      const ksuid: RegExp;
      const nanoid: RegExp;
      /** ISO 8601-1 duration regex. Does not support the 8601-2 extensions like negative durations or fractional/negative components. */
      const duration: RegExp;
      /** Implements ISO 8601-2 extensions like explicit +- prefixes, mixing weeks with other units, and fractional/negative components. */
      const extendedDuration: RegExp;
      /** A regex for any UUID-like identifier: 8-4-4-4-12 hex pattern */
      const guid: RegExp;
      /** Returns a regex for validating an RFC 4122 UUID.
       *
       * @param version Optionally specify a version 1-8. If no version is specified, all versions are supported. */
      const uuid: (version?: number) => RegExp;
      const uuid4: RegExp;
      const uuid6: RegExp;
      const uuid7: RegExp;
      /** Practical email validation */
      const email: RegExp;
      /** Equivalent to the HTML5 input[type=email] validation implemented by browsers. Source: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/email */
      const html5Email: RegExp;
      /** The classic emailregex.com regex for RFC 5322-compliant emails */
      const rfc5322Email: RegExp;
      /** A loose regex that allows Unicode characters, enforces length limits, and that's about it. */
      const unicodeEmail: RegExp;
      const browserEmail: RegExp;
      const _emoji = '^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$';
      function emoji(): RegExp;
      const ipv4: RegExp;
      const ipv6: RegExp;
      const cidrv4: RegExp;
      const cidrv6: RegExp;
      const ip: RegExp;
      const base64: RegExp;
      const base64url: RegExp;
      const hostname: RegExp;
      const domain: RegExp;
      const e164: RegExp;
      const date: RegExp;
      function time(args: { precision?: number | null }): RegExp;
      function datetime(args: { precision?: number | null; offset?: boolean; local?: boolean }): RegExp;
      const string: (params?: { minimum?: number | undefined; maximum?: number | undefined }) => RegExp;
      const bigint: RegExp;
      const integer: RegExp;
      const number: RegExp;
      const boolean: RegExp;
      const _null: RegExp;
      const _undefined: RegExp;
      const lowercase: RegExp;
      const uppercase: RegExp;
    }

    // LOCALES

    export namespace locales {
      namespace module {
        export const parsedType: (data: any) => string;
        export const error: errors.$ZodErrorMap;
        export function _default(): {
          localeError: errors.$ZodErrorMap;
        };
      }
      export import ar = module._default;
      export import az = module._default;
      export import be = module._default;
      export import ca = module._default;
      export import cs = module._default;
      export import de = module._default;
      export import en = module._default;
      export import es = module._default;
      export import fa = module._default;
      export import fi = module._default;
      export import fr = module._default;
      export import frCA = module._default;
      export import he = module._default;
      export import hu = module._default;
      export import id = module._default;
      export import it = module._default;
      export import ja = module._default;
      export import ko = module._default;
      export import mk = module._default;
      export import ms = module._default;
      export import no = module._default;
      export import ota = module._default;
      export import pl = module._default;
      export import pt = module._default;
      export import ru = module._default;
      export import sl = module._default;
      export import ta = module._default;
      export import th = module._default;
      export import tr = module._default;
      export import ua = module._default;
      export import ur = module._default;
      export import vi = module._default;
      export import zhCN = module._default;
      export import zhTW = module._default;
    }

    // REGISTRIES

    namespace registries {
      const $output: unique symbol;
      type $output = typeof $output;
      const $input: unique symbol;
      type $input = typeof $input;

      type $replace<Meta, S extends schemas.$ZodType> = Meta extends $output
        ? core.output<S>
        : Meta extends $input
          ? core.input<S>
          : Meta extends (infer M)[]
            ? $replace<M, S>[]
            : Meta extends object
              ? {
                  [K in keyof Meta]: $replace<Meta[K], S>;
                }
              : Meta;

      type MetadataType = Record<string, unknown> | undefined;

      class $ZodRegistry<Meta extends MetadataType = MetadataType, Schema extends schemas.$ZodType = schemas.$ZodType> {
        _meta: Meta;
        _schema: Schema;
        _map: WeakMap<Schema, $replace<Meta, Schema>>;
        _idmap: Map<string, Schema>;
        add<S extends Schema>(
          schema: S,
          ..._meta: undefined extends Meta ? [$replace<Meta, S>?] : [$replace<Meta, S>]
        ): this;
        remove(schema: Schema): this;
        get<S extends Schema>(schema: S): $replace<Meta, S> | undefined;
        has(schema: Schema): boolean;
      }

      interface JSONSchemaMeta {
        id?: string | undefined;
        title?: string | undefined;
        description?: string | undefined;
        examples?: $output[] | undefined;
        [k: string]: unknown;
      }

      interface GlobalMeta extends JSONSchemaMeta {}

      function registry<
        T extends MetadataType = MetadataType,
        S extends schemas.$ZodType = schemas.$ZodType
      >(): $ZodRegistry<T, S>;

      const globalRegistry: $ZodRegistry<GlobalMeta>;
    }

    export import $output = registries.$output;
    export import $input = registries.$input;
    export import $replace = registries.$replace;
    export import $ZodRegistry = registries.$ZodRegistry;
    export import JSONSchemaMeta = registries.JSONSchemaMeta;
    export import GlobalMeta = registries.GlobalMeta;
    export import registry = registries.registry;
    export import globalRegistry = registries.globalRegistry;

    // DOC

    namespace doc {
      type ModeWriter = (
        doc_: Doc,
        modes: {
          execution: 'sync' | 'async';
        }
      ) => void;

      class Doc {
        args: string[];
        content: string[];
        indent: number;
        constructor(args?: string[]);
        indented(fn: (doc_: Doc) => void): void;
        write(fn: ModeWriter): void;
        write(line: string): void;
        compile(): Function;
      }
    }

    export import Doc = doc.Doc;

    // FUNCTION

    namespace function_ {
      interface $ZodFunctionDef<
        In extends $ZodFunctionIn = $ZodFunctionIn,
        Out extends $ZodFunctionOut = $ZodFunctionOut
      > {
        type: 'function';
        input: In;
        output: Out;
      }

      type $ZodFunctionArgs = schemas.$ZodType<unknown[], unknown[]>;

      type $ZodFunctionIn = $ZodFunctionArgs | null;

      type $ZodFunctionOut = schemas.$ZodType | null;

      type $InferInnerFunctionType<Args extends $ZodFunctionIn, Returns extends $ZodFunctionOut> = (
        ...args: null extends Args ? never[] : NonNullable<Args>['_zod']['output']
      ) => null extends Returns ? unknown : NonNullable<Returns>['_zod']['input'];

      type $InferInnerFunctionTypeAsync<Args extends $ZodFunctionIn, Returns extends $ZodFunctionOut> = (
        ...args: null extends Args ? never[] : NonNullable<Args>['_zod']['output']
      ) => null extends Returns ? unknown : util.MaybeAsync<NonNullable<Returns>['_zod']['input']>;

      type $InferOuterFunctionType<Args extends $ZodFunctionIn, Returns extends $ZodFunctionOut> = (
        ...args: null extends Args ? never[] : NonNullable<Args>['_zod']['input']
      ) => null extends Returns ? unknown : NonNullable<Returns>['_zod']['output'];

      type $InferOuterFunctionTypeAsync<Args extends $ZodFunctionIn, Returns extends $ZodFunctionOut> = (
        ...args: null extends Args ? never[] : NonNullable<Args>['_zod']['input']
      ) => null extends Returns ? unknown : util.MaybeAsync<NonNullable<Returns>['_zod']['output']>;

      class $ZodFunction<
        Args extends $ZodFunctionIn = $ZodFunctionIn,
        Returns extends $ZodFunctionOut = $ZodFunctionOut
      > {
        def: $ZodFunctionDef<Args, Returns>;
        /** @deprecated */
        _def: $ZodFunctionDef<Args, Returns>;
        _input: $InferInnerFunctionType<Args, Returns>;
        _output: $InferOuterFunctionType<Args, Returns>;
        constructor(def: $ZodFunctionDef<Args, Returns>);
        implement<F extends $InferInnerFunctionType<Args, Returns>>(
          func: F
        ): F extends this['_output'] ? F : this['_output'];
        implementAsync<F extends $InferInnerFunctionTypeAsync<Args, Returns>>(
          func: F
        ): F extends $InferOuterFunctionTypeAsync<Args, Returns> ? F : $InferOuterFunctionTypeAsync<Args, Returns>;
        input<const Items extends util.TupleItems, const Rest extends $ZodFunctionOut = null>(
          args: Items,
          rest?: Rest
        ): $ZodFunction<schemas.$ZodTuple<Items, Rest>, Returns>;
        input<NewArgs extends $ZodFunctionIn>(args: NewArgs): $ZodFunction<NewArgs, Returns>;
        output<NewReturns extends schemas.$ZodType>(output: NewReturns): $ZodFunction<Args, NewReturns>;
      }

      interface $ZodFunctionParams<I extends $ZodFunctionIn, O extends schemas.$ZodType> {
        input?: I;
        output?: O;
      }

      function _function(): $ZodFunction;
      function _function<const In extends Array<schemas.$ZodType> = Array<schemas.$ZodType>>(params: {
        input: In;
      }): $ZodFunction<schemas.$ZodTuple<In, null>, null>;
      function _function<const In extends $ZodFunctionIn = $ZodFunctionIn>(params: {
        input: In;
      }): $ZodFunction<In, null>;
      function _function<const Out extends $ZodFunctionOut = $ZodFunctionOut>(params: {
        output: Out;
      }): $ZodFunction<null, Out>;
      function _function<
        In extends $ZodFunctionIn = $ZodFunctionIn,
        Out extends schemas.$ZodType = schemas.$ZodType
      >(params?: { input: In; output: Out }): $ZodFunction<In, Out>;
    }

    export import $ZodFunctionDef = function_.$ZodFunctionDef;
    export import $ZodFunctionArgs = function_.$ZodFunctionArgs;
    export import $ZodFunctionIn = function_.$ZodFunctionIn;
    export import $ZodFunctionOut = function_.$ZodFunctionOut;
    export import $InferInnerFunctionType = function_.$InferInnerFunctionType;
    export import $InferInnerFunctionTypeAsync = function_.$InferInnerFunctionTypeAsync;
    export import $InferOuterFunctionType = function_.$InferOuterFunctionType;
    export import $InferOuterFunctionTypeAsync = function_.$InferOuterFunctionTypeAsync;
    export import $ZodFunction = function_.$ZodFunction;
    export import $ZodFunctionParams = function_.$ZodFunctionParams;

    type __Function = typeof function_._function;
    const __function: __Function;

    export { __function as function };

    // API

    namespace api_ {
      type Params<
        T extends schemas.$ZodType | checks.$ZodCheck,
        IssueTypes extends errors.$ZodIssueBase,
        OmitKeys extends keyof T['_zod']['def'] = never
      > = util.Flatten<
        Partial<
          util.EmptyToNever<
            util.Omit<T['_zod']['def'], OmitKeys> &
              ([IssueTypes] extends [never]
                ? {}
                : {
                    error?: string | errors.$ZodErrorMap<IssueTypes> | undefined;
                    /** @deprecated This parameter is deprecated. Use `error` instead. */
                    message?: string | undefined;
                  })
          >
        >
      >;

      type TypeParams<
        T extends schemas.$ZodType = schemas.$ZodType & {
          _isst: never;
        },
        AlsoOmit extends Exclude<keyof T['_zod']['def'], 'type' | 'checks' | 'error'> = never
      > = Params<T, NonNullable<T['_zod']['isst']>, 'type' | 'checks' | 'error' | AlsoOmit>;

      type CheckParams<
        T extends checks.$ZodCheck = checks.$ZodCheck, // & { _issc: never },
        AlsoOmit extends Exclude<keyof T['_zod']['def'], 'check' | 'error'> = never
      > = Params<T, NonNullable<T['_zod']['issc']>, 'check' | 'error' | AlsoOmit>;

      type StringFormatParams<
        T extends schemas.$ZodStringFormat = schemas.$ZodStringFormat,
        AlsoOmit extends Exclude<
          keyof T['_zod']['def'],
          'type' | 'coerce' | 'checks' | 'error' | 'check' | 'format'
        > = never
      > = Params<
        T,
        NonNullable<T['_zod']['isst'] | T['_zod']['issc']>,
        'type' | 'coerce' | 'checks' | 'error' | 'check' | 'format' | AlsoOmit
      >;

      type CheckStringFormatParams<
        T extends schemas.$ZodStringFormat = schemas.$ZodStringFormat,
        AlsoOmit extends Exclude<
          keyof T['_zod']['def'],
          'type' | 'coerce' | 'checks' | 'error' | 'check' | 'format'
        > = never
      > = Params<
        T,
        NonNullable<T['_zod']['issc']>,
        'type' | 'coerce' | 'checks' | 'error' | 'check' | 'format' | AlsoOmit
      >;

      type CheckTypeParams<
        T extends schemas.$ZodType & checks.$ZodCheck = schemas.$ZodType & checks.$ZodCheck,
        AlsoOmit extends Exclude<keyof T['_zod']['def'], 'type' | 'checks' | 'error' | 'check'> = never
      > = Params<
        T,
        NonNullable<T['_zod']['isst'] | T['_zod']['issc']>,
        'type' | 'checks' | 'error' | 'check' | AlsoOmit
      >;

      type $ZodStringParams = TypeParams<schemas.$ZodString<string>, 'coerce'>;

      function _string<T extends schemas.$ZodString>(Class: util.SchemaClass<T>, params?: string | $ZodStringParams): T;

      function _coercedString<T extends schemas.$ZodString>(
        Class: util.SchemaClass<T>,
        params?: string | $ZodStringParams
      ): T;

      type $ZodEmailParams = StringFormatParams<schemas.$ZodEmail>;

      type $ZodCheckEmailParams = CheckStringFormatParams<schemas.$ZodEmail>;

      function _email<T extends schemas.$ZodEmail>(
        Class: util.SchemaClass<T>,
        params?: string | $ZodEmailParams | $ZodCheckEmailParams
      ): T;

      type $ZodGUIDParams = StringFormatParams<schemas.$ZodGUID, 'pattern'>;

      type $ZodCheckGUIDParams = CheckStringFormatParams<schemas.$ZodGUID, 'pattern'>;

      function _guid<T extends schemas.$ZodGUID>(
        Class: util.SchemaClass<T>,
        params?: string | $ZodGUIDParams | $ZodCheckGUIDParams
      ): T;

      type $ZodUUIDParams = StringFormatParams<schemas.$ZodUUID, 'pattern'>;

      type $ZodCheckUUIDParams = CheckStringFormatParams<schemas.$ZodUUID, 'pattern'>;

      function _uuid<T extends schemas.$ZodUUID>(
        Class: util.SchemaClass<T>,
        params?: string | $ZodUUIDParams | $ZodCheckUUIDParams
      ): T;

      type $ZodUUIDv4Params = StringFormatParams<schemas.$ZodUUID, 'pattern'>;

      type $ZodCheckUUIDv4Params = CheckStringFormatParams<schemas.$ZodUUID, 'pattern'>;

      function _uuidv4<T extends schemas.$ZodUUID>(
        Class: util.SchemaClass<T>,
        params?: string | $ZodUUIDv4Params | $ZodCheckUUIDv4Params
      ): T;

      type $ZodUUIDv6Params = StringFormatParams<schemas.$ZodUUID, 'pattern'>;

      type $ZodCheckUUIDv6Params = CheckStringFormatParams<schemas.$ZodUUID, 'pattern'>;

      function _uuidv6<T extends schemas.$ZodUUID>(
        Class: util.SchemaClass<T>,
        params?: string | $ZodUUIDv6Params | $ZodCheckUUIDv6Params
      ): T;

      type $ZodUUIDv7Params = StringFormatParams<schemas.$ZodUUID, 'pattern'>;

      type $ZodCheckUUIDv7Params = CheckStringFormatParams<schemas.$ZodUUID, 'pattern'>;

      function _uuidv7<T extends schemas.$ZodUUID>(
        Class: util.SchemaClass<T>,
        params?: string | $ZodUUIDv7Params | $ZodCheckUUIDv7Params
      ): T;

      type $ZodURLParams = StringFormatParams<schemas.$ZodURL>;

      type $ZodCheckURLParams = CheckStringFormatParams<schemas.$ZodURL>;

      function _url<T extends schemas.$ZodURL>(
        Class: util.SchemaClass<T>,
        params?: string | $ZodURLParams | $ZodCheckURLParams
      ): T;

      type $ZodEmojiParams = StringFormatParams<schemas.$ZodEmoji>;

      type $ZodCheckEmojiParams = CheckStringFormatParams<schemas.$ZodEmoji>;

      function _emoji<T extends schemas.$ZodEmoji>(
        Class: util.SchemaClass<T>,
        params?: string | $ZodEmojiParams | $ZodCheckEmojiParams
      ): T;

      type $ZodNanoIDParams = StringFormatParams<schemas.$ZodNanoID>;

      type $ZodCheckNanoIDParams = CheckStringFormatParams<schemas.$ZodNanoID>;

      function _nanoid<T extends schemas.$ZodNanoID>(
        Class: util.SchemaClass<T>,
        params?: string | $ZodNanoIDParams | $ZodCheckNanoIDParams
      ): T;

      type $ZodCUIDParams = StringFormatParams<schemas.$ZodCUID>;

      type $ZodCheckCUIDParams = CheckStringFormatParams<schemas.$ZodCUID>;

      function _cuid<T extends schemas.$ZodCUID>(
        Class: util.SchemaClass<T>,
        params?: string | $ZodCUIDParams | $ZodCheckCUIDParams
      ): T;

      type $ZodCUID2Params = StringFormatParams<schemas.$ZodCUID2>;

      type $ZodCheckCUID2Params = CheckStringFormatParams<schemas.$ZodCUID2>;

      function _cuid2<T extends schemas.$ZodCUID2>(
        Class: util.SchemaClass<T>,
        params?: string | $ZodCUID2Params | $ZodCheckCUID2Params
      ): T;

      type $ZodULIDParams = StringFormatParams<schemas.$ZodULID>;

      type $ZodCheckULIDParams = CheckStringFormatParams<schemas.$ZodULID>;

      function _ulid<T extends schemas.$ZodULID>(
        Class: util.SchemaClass<T>,
        params?: string | $ZodULIDParams | $ZodCheckULIDParams
      ): T;

      type $ZodXIDParams = StringFormatParams<schemas.$ZodXID>;

      type $ZodCheckXIDParams = CheckStringFormatParams<schemas.$ZodXID>;

      function _xid<T extends schemas.$ZodXID>(
        Class: util.SchemaClass<T>,
        params?: string | $ZodXIDParams | $ZodCheckXIDParams
      ): T;

      type $ZodKSUIDParams = StringFormatParams<schemas.$ZodKSUID>;

      type $ZodCheckKSUIDParams = CheckStringFormatParams<schemas.$ZodKSUID>;

      function _ksuid<T extends schemas.$ZodKSUID>(
        Class: util.SchemaClass<T>,
        params?: string | $ZodKSUIDParams | $ZodCheckKSUIDParams
      ): T;

      type $ZodIPv4Params = StringFormatParams<schemas.$ZodIPv4, 'pattern'>;

      type $ZodCheckIPv4Params = CheckStringFormatParams<schemas.$ZodIPv4, 'pattern'>;

      function _ipv4<T extends schemas.$ZodIPv4>(
        Class: util.SchemaClass<T>,
        params?: string | $ZodIPv4Params | $ZodCheckIPv4Params
      ): T;

      type $ZodIPv6Params = StringFormatParams<schemas.$ZodIPv6, 'pattern'>;

      type $ZodCheckIPv6Params = CheckStringFormatParams<schemas.$ZodIPv6, 'pattern'>;

      function _ipv6<T extends schemas.$ZodIPv6>(
        Class: util.SchemaClass<T>,
        params?: string | $ZodIPv6Params | $ZodCheckIPv6Params
      ): T;

      type $ZodCIDRv4Params = StringFormatParams<schemas.$ZodCIDRv4, 'pattern'>;

      type $ZodCheckCIDRv4Params = CheckStringFormatParams<schemas.$ZodCIDRv4, 'pattern'>;

      function _cidrv4<T extends schemas.$ZodCIDRv4>(
        Class: util.SchemaClass<T>,
        params?: string | $ZodCIDRv4Params | $ZodCheckCIDRv4Params
      ): T;

      type $ZodCIDRv6Params = StringFormatParams<schemas.$ZodCIDRv6, 'pattern'>;

      type $ZodCheckCIDRv6Params = CheckStringFormatParams<schemas.$ZodCIDRv6, 'pattern'>;

      function _cidrv6<T extends schemas.$ZodCIDRv6>(
        Class: util.SchemaClass<T>,
        params?: string | $ZodCIDRv6Params | $ZodCheckCIDRv6Params
      ): T;

      type $ZodBase64Params = StringFormatParams<schemas.$ZodBase64, 'pattern'>;

      type $ZodCheckBase64Params = CheckStringFormatParams<schemas.$ZodBase64, 'pattern'>;

      function _base64<T extends schemas.$ZodBase64>(
        Class: util.SchemaClass<T>,
        params?: string | $ZodBase64Params | $ZodCheckBase64Params
      ): T;

      type $ZodBase64URLParams = StringFormatParams<schemas.$ZodBase64URL, 'pattern'>;

      type $ZodCheckBase64URLParams = CheckStringFormatParams<schemas.$ZodBase64URL, 'pattern'>;

      function _base64url<T extends schemas.$ZodBase64URL>(
        Class: util.SchemaClass<T>,
        params?: string | $ZodBase64URLParams | $ZodCheckBase64URLParams
      ): T;

      type $ZodE164Params = StringFormatParams<schemas.$ZodE164>;

      type $ZodCheckE164Params = CheckStringFormatParams<schemas.$ZodE164>;

      function _e164<T extends schemas.$ZodE164>(
        Class: util.SchemaClass<T>,
        params?: string | $ZodE164Params | $ZodCheckE164Params
      ): T;

      type $ZodJWTParams = StringFormatParams<schemas.$ZodJWT, 'pattern'>;

      type $ZodCheckJWTParams = CheckStringFormatParams<schemas.$ZodJWT, 'pattern'>;

      function _jwt<T extends schemas.$ZodJWT>(
        Class: util.SchemaClass<T>,
        params?: string | $ZodJWTParams | $ZodCheckJWTParams
      ): T;

      type $ZodISODateTimeParams = StringFormatParams<schemas.$ZodISODateTime, 'pattern'>;

      type $ZodCheckISODateTimeParams = CheckStringFormatParams<schemas.$ZodISODateTime, 'pattern'>;

      function _isoDateTime<T extends schemas.$ZodISODateTime>(
        Class: util.SchemaClass<T>,
        params?: string | $ZodISODateTimeParams | $ZodCheckISODateTimeParams
      ): T;

      type $ZodISODateParams = StringFormatParams<schemas.$ZodISODate, 'pattern'>;

      type $ZodCheckISODateParams = CheckStringFormatParams<schemas.$ZodISODate, 'pattern'>;

      function _isoDate<T extends schemas.$ZodISODate>(
        Class: util.SchemaClass<T>,
        params?: string | $ZodISODateParams | $ZodCheckISODateParams
      ): T;

      type $ZodISOTimeParams = StringFormatParams<schemas.$ZodISOTime, 'pattern'>;

      type $ZodCheckISOTimeParams = CheckStringFormatParams<schemas.$ZodISOTime, 'pattern'>;

      function _isoTime<T extends schemas.$ZodISOTime>(
        Class: util.SchemaClass<T>,
        params?: string | $ZodISOTimeParams | $ZodCheckISOTimeParams
      ): T;

      type $ZodISODurationParams = StringFormatParams<schemas.$ZodISODuration>;

      type $ZodCheckISODurationParams = CheckStringFormatParams<schemas.$ZodISODuration>;

      function _isoDuration<T extends schemas.$ZodISODuration>(
        Class: util.SchemaClass<T>,
        params?: string | $ZodISODurationParams | $ZodCheckISODurationParams
      ): T;

      type $ZodNumberParams = TypeParams<schemas.$ZodNumber<number>, 'coerce'>;

      type $ZodNumberFormatParams = CheckTypeParams<schemas.$ZodNumberFormat, 'format' | 'coerce'>;

      type $ZodCheckNumberFormatParams = CheckParams<checks.$ZodCheckNumberFormat, 'format'>;

      function _number<T extends schemas.$ZodNumber>(Class: util.SchemaClass<T>, params?: string | $ZodNumberParams): T;

      function _coercedNumber<T extends schemas.$ZodNumber>(
        Class: util.SchemaClass<T>,
        params?: string | $ZodNumberParams
      ): T;

      function _int<T extends schemas.$ZodNumberFormat>(
        Class: util.SchemaClass<T>,
        params?: string | $ZodCheckNumberFormatParams
      ): T;

      function _float32<T extends schemas.$ZodNumberFormat>(
        Class: util.SchemaClass<T>,
        params?: string | $ZodCheckNumberFormatParams
      ): T;

      function _float64<T extends schemas.$ZodNumberFormat>(
        Class: util.SchemaClass<T>,
        params?: string | $ZodCheckNumberFormatParams
      ): T;

      function _int32<T extends schemas.$ZodNumberFormat>(
        Class: util.SchemaClass<T>,
        params?: string | $ZodCheckNumberFormatParams
      ): T;

      function _uint32<T extends schemas.$ZodNumberFormat>(
        Class: util.SchemaClass<T>,
        params?: string | $ZodCheckNumberFormatParams
      ): T;

      type $ZodBooleanParams = TypeParams<schemas.$ZodBoolean<boolean>, 'coerce'>;

      function _boolean<T extends schemas.$ZodBoolean>(
        Class: util.SchemaClass<T>,
        params?: string | $ZodBooleanParams
      ): T;

      function _coercedBoolean<T extends schemas.$ZodBoolean>(
        Class: util.SchemaClass<T>,
        params?: string | $ZodBooleanParams
      ): T;

      type $ZodBigIntParams = TypeParams<schemas.$ZodBigInt<bigint>>;

      type $ZodBigIntFormatParams = CheckTypeParams<schemas.$ZodBigIntFormat, 'format' | 'coerce'>;

      type $ZodCheckBigIntFormatParams = CheckParams<checks.$ZodCheckBigIntFormat, 'format'>;

      function _bigint<T extends schemas.$ZodBigInt>(Class: util.SchemaClass<T>, params?: string | $ZodBigIntParams): T;

      function _coercedBigint<T extends schemas.$ZodBigInt>(
        Class: util.SchemaClass<T>,
        params?: string | $ZodBigIntParams
      ): T;

      function _int64<T extends schemas.$ZodBigIntFormat>(
        Class: util.SchemaClass<T>,
        params?: string | $ZodBigIntFormatParams
      ): T;

      function _uint64<T extends schemas.$ZodBigIntFormat>(
        Class: util.SchemaClass<T>,
        params?: string | $ZodBigIntFormatParams
      ): T;

      type $ZodSymbolParams = TypeParams<schemas.$ZodSymbol>;

      function _symbol<T extends schemas.$ZodSymbol>(Class: util.SchemaClass<T>, params?: string | $ZodSymbolParams): T;

      type $ZodUndefinedParams = TypeParams<schemas.$ZodUndefined>;

      function _undefined<T extends schemas.$ZodUndefined>(
        Class: util.SchemaClass<T>,
        params?: string | $ZodUndefinedParams
      ): T;

      type $ZodNullParams = TypeParams<schemas.$ZodNull>;

      function _null<T extends schemas.$ZodNull>(Class: util.SchemaClass<T>, params?: string | $ZodNullParams): T;

      type $ZodAnyParams = TypeParams<schemas.$ZodAny>;

      function _any<T extends schemas.$ZodAny>(Class: util.SchemaClass<T>): T;

      type $ZodUnknownParams = TypeParams<schemas.$ZodUnknown>;

      function _unknown<T extends schemas.$ZodUnknown>(Class: util.SchemaClass<T>): T;

      type $ZodNeverParams = TypeParams<schemas.$ZodNever>;

      function _never<T extends schemas.$ZodNever>(Class: util.SchemaClass<T>, params?: string | $ZodNeverParams): T;

      type $ZodVoidParams = TypeParams<schemas.$ZodVoid>;

      function _void<T extends schemas.$ZodVoid>(Class: util.SchemaClass<T>, params?: string | $ZodVoidParams): T;

      type $ZodDateParams = TypeParams<schemas.$ZodDate, 'coerce'>;

      function _date<T extends schemas.$ZodDate>(Class: util.SchemaClass<T>, params?: string | $ZodDateParams): T;

      function _coercedDate<T extends schemas.$ZodDate>(
        Class: util.SchemaClass<T>,
        params?: string | $ZodDateParams
      ): T;

      type $ZodNaNParams = TypeParams<schemas.$ZodNaN>;

      function _nan<T extends schemas.$ZodNaN>(Class: util.SchemaClass<T>, params?: string | $ZodNaNParams): T;

      type $ZodCheckLessThanParams = CheckParams<checks.$ZodCheckLessThan, 'inclusive' | 'value'>;

      function _lt(
        value: util.Numeric,
        params?: string | $ZodCheckLessThanParams
      ): checks.$ZodCheckLessThan<util.Numeric>;

      function _lte(
        value: util.Numeric,
        params?: string | $ZodCheckLessThanParams
      ): checks.$ZodCheckLessThan<util.Numeric>;

      /** @deprecated Use `z.lte()` instead. */
      const _max: typeof _lte;

      type $ZodCheckGreaterThanParams = CheckParams<checks.$ZodCheckGreaterThan, 'inclusive' | 'value'>;

      function _gt(value: util.Numeric, params?: string | $ZodCheckGreaterThanParams): checks.$ZodCheckGreaterThan;

      function _gte(value: util.Numeric, params?: string | $ZodCheckGreaterThanParams): checks.$ZodCheckGreaterThan;

      /** @deprecated Use `z.gte()` instead. */
      const _min: typeof _gte;

      function _positive(params?: string | $ZodCheckGreaterThanParams): checks.$ZodCheckGreaterThan;

      function _negative(params?: string | $ZodCheckLessThanParams): checks.$ZodCheckLessThan;

      function _nonpositive(params?: string | $ZodCheckLessThanParams): checks.$ZodCheckLessThan;

      function _nonnegative(params?: string | $ZodCheckGreaterThanParams): checks.$ZodCheckGreaterThan;

      type $ZodCheckMultipleOfParams = CheckParams<checks.$ZodCheckMultipleOf, 'value'>;

      function _multipleOf(
        value: number | bigint,
        params?: string | $ZodCheckMultipleOfParams
      ): checks.$ZodCheckMultipleOf;

      type $ZodCheckMaxSizeParams = CheckParams<checks.$ZodCheckMaxSize, 'maximum'>;

      function _maxSize(
        maximum: number,
        params?: string | $ZodCheckMaxSizeParams
      ): checks.$ZodCheckMaxSize<util.HasSize>;

      type $ZodCheckMinSizeParams = CheckParams<checks.$ZodCheckMinSize, 'minimum'>;

      function _minSize(
        minimum: number,
        params?: string | $ZodCheckMinSizeParams
      ): checks.$ZodCheckMinSize<util.HasSize>;

      type $ZodCheckSizeEqualsParams = CheckParams<checks.$ZodCheckSizeEquals, 'size'>;

      function _size(
        size: number,
        params?: string | $ZodCheckSizeEqualsParams
      ): checks.$ZodCheckSizeEquals<util.HasSize>;

      type $ZodCheckMaxLengthParams = CheckParams<checks.$ZodCheckMaxLength, 'maximum'>;

      function _maxLength(
        maximum: number,
        params?: string | $ZodCheckMaxLengthParams
      ): checks.$ZodCheckMaxLength<util.HasLength>;

      type $ZodCheckMinLengthParams = CheckParams<checks.$ZodCheckMinLength, 'minimum'>;

      function _minLength(
        minimum: number,
        params?: string | $ZodCheckMinLengthParams
      ): checks.$ZodCheckMinLength<util.HasLength>;

      type $ZodCheckLengthEqualsParams = CheckParams<checks.$ZodCheckLengthEquals, 'length'>;

      function _length(
        length: number,
        params?: string | $ZodCheckLengthEqualsParams
      ): checks.$ZodCheckLengthEquals<util.HasLength>;

      type $ZodCheckRegexParams = CheckParams<checks.$ZodCheckRegex, 'format' | 'pattern'>;

      function _regex(pattern: RegExp, params?: string | $ZodCheckRegexParams): checks.$ZodCheckRegex;

      type $ZodCheckLowerCaseParams = CheckParams<checks.$ZodCheckLowerCase, 'format'>;

      function _lowercase(params?: string | $ZodCheckLowerCaseParams): checks.$ZodCheckLowerCase;

      type $ZodCheckUpperCaseParams = CheckParams<checks.$ZodCheckUpperCase, 'format'>;

      function _uppercase(params?: string | $ZodCheckUpperCaseParams): checks.$ZodCheckUpperCase;

      type $ZodCheckIncludesParams = CheckParams<checks.$ZodCheckIncludes, 'includes' | 'format' | 'pattern'>;

      function _includes(includes: string, params?: string | $ZodCheckIncludesParams): checks.$ZodCheckIncludes;

      type $ZodCheckStartsWithParams = CheckParams<checks.$ZodCheckStartsWith, 'prefix' | 'format' | 'pattern'>;

      function _startsWith(prefix: string, params?: string | $ZodCheckStartsWithParams): checks.$ZodCheckStartsWith;

      type $ZodCheckEndsWithParams = CheckParams<checks.$ZodCheckEndsWith, 'suffix' | 'format' | 'pattern'>;

      function _endsWith(suffix: string, params?: string | $ZodCheckEndsWithParams): checks.$ZodCheckEndsWith;

      type $ZodCheckPropertyParams = CheckParams<checks.$ZodCheckProperty, 'property' | 'schema'>;

      function _property<K extends string, T extends schemas.$ZodType>(
        property: K,
        schema: T,
        params?: string | $ZodCheckPropertyParams
      ): checks.$ZodCheckProperty<{
        [k in K]: core.output<T>;
      }>;

      type $ZodCheckMimeTypeParams = CheckParams<checks.$ZodCheckMimeType, 'mime'>;

      function _mime(types: util.MimeTypes[], params?: string | $ZodCheckMimeTypeParams): checks.$ZodCheckMimeType;

      function _overwrite<T>(tx: (input: T) => T): checks.$ZodCheckOverwrite<T>;

      function _normalize(form?: 'NFC' | 'NFD' | 'NFKC' | 'NFKD' | (string & {})): checks.$ZodCheckOverwrite<string>;

      function _trim(): checks.$ZodCheckOverwrite<string>;

      function _toLowerCase(): checks.$ZodCheckOverwrite<string>;

      function _toUpperCase(): checks.$ZodCheckOverwrite<string>;

      type $ZodArrayParams = TypeParams<schemas.$ZodArray, 'element'>;

      function _array<T extends schemas.$ZodType>(
        Class: util.SchemaClass<schemas.$ZodArray>,
        element: T,
        params?: string | $ZodArrayParams
      ): schemas.$ZodArray<T>;

      type $ZodObjectParams = TypeParams<schemas.$ZodObject, 'shape' | 'catchall'>;

      type $ZodUnionParams = TypeParams<schemas.$ZodUnion, 'options'>;

      function _union<const T extends readonly schemas.$ZodObject[]>(
        Class: util.SchemaClass<schemas.$ZodUnion>,
        options: T,
        params?: string | $ZodUnionParams
      ): schemas.$ZodUnion<T>;

      interface $ZodTypeDiscriminableInternals extends schemas.$ZodTypeInternals {
        disc: util.DiscriminatorMap;
      }

      interface $ZodTypeDiscriminable extends schemas.$ZodType {
        _zod: $ZodTypeDiscriminableInternals;
      }

      type $ZodDiscriminatedUnionParams = TypeParams<schemas.$ZodDiscriminatedUnion, 'options' | 'discriminator'>;

      function _discriminatedUnion<Types extends [$ZodTypeDiscriminable, ...$ZodTypeDiscriminable[]]>(
        Class: util.SchemaClass<schemas.$ZodDiscriminatedUnion>,
        discriminator: string,
        options: Types,
        params?: string | $ZodDiscriminatedUnionParams
      ): schemas.$ZodDiscriminatedUnion<Types>;

      type $ZodIntersectionParams = TypeParams<schemas.$ZodIntersection, 'left' | 'right'>;

      function _intersection<T extends schemas.$ZodObject, U extends schemas.$ZodObject>(
        Class: util.SchemaClass<schemas.$ZodIntersection>,
        left: T,
        right: U
      ): schemas.$ZodIntersection<T, U>;

      type $ZodTupleParams = TypeParams<schemas.$ZodTuple, 'items' | 'rest'>;

      function _tuple<T extends readonly [schemas.$ZodType, ...schemas.$ZodType[]]>(
        Class: util.SchemaClass<schemas.$ZodTuple>,
        items: T,
        params?: string | $ZodTupleParams
      ): schemas.$ZodTuple<T, null>;

      function _tuple<T extends readonly [schemas.$ZodType, ...schemas.$ZodType[]], Rest extends schemas.$ZodType>(
        Class: util.SchemaClass<schemas.$ZodTuple>,
        items: T,
        rest: Rest,
        params?: string | $ZodTupleParams
      ): schemas.$ZodTuple<T, Rest>;

      type $ZodRecordParams = TypeParams<schemas.$ZodRecord, 'keyType' | 'valueType'>;

      function _record<Key extends schemas.$ZodRecordKey, Value extends schemas.$ZodObject>(
        Class: util.SchemaClass<schemas.$ZodRecord>,
        keyType: Key,
        valueType: Value,
        params?: string | $ZodRecordParams
      ): schemas.$ZodRecord<Key, Value>;

      type $ZodMapParams = TypeParams<schemas.$ZodMap, 'keyType' | 'valueType'>;

      function _map<Key extends schemas.$ZodObject, Value extends schemas.$ZodObject>(
        Class: util.SchemaClass<schemas.$ZodMap>,
        keyType: Key,
        valueType: Value,
        params?: string | $ZodMapParams
      ): schemas.$ZodMap<Key, Value>;

      type $ZodSetParams = TypeParams<schemas.$ZodSet, 'valueType'>;

      function _set<Value extends schemas.$ZodObject>(
        Class: util.SchemaClass<schemas.$ZodSet>,
        valueType: Value,
        params?: string | $ZodSetParams
      ): schemas.$ZodSet<Value>;

      type $ZodEnumParams = TypeParams<schemas.$ZodEnum, 'entries'>;

      function _enum<const T extends string[]>(
        Class: util.SchemaClass<schemas.$ZodEnum>,
        values: T,
        params?: string | $ZodEnumParams
      ): schemas.$ZodEnum<util.ToEnum<T[number]>>;

      function _enum<T extends util.EnumLike>(
        Class: util.SchemaClass<schemas.$ZodEnum>,
        entries: T,
        params?: string | $ZodEnumParams
      ): schemas.$ZodEnum<T>;

      /** @deprecated This API has been merged into `z.enum()`. Use `z.enum()` instead.
       *
       * ```ts
       * enum Colors { red, green, blue }
       * z.enum(Colors);
       * ```
       */
      function _nativeEnum<T extends util.EnumLike>(
        Class: util.SchemaClass<schemas.$ZodEnum>,
        entries: T,
        params?: string | $ZodEnumParams
      ): schemas.$ZodEnum<T>;

      type $ZodLiteralParams = TypeParams<schemas.$ZodLiteral, 'values'>;

      function _literal<const T extends Array<util.Literal>>(
        Class: util.SchemaClass<schemas.$ZodLiteral>,
        value: T,
        params?: string | $ZodLiteralParams
      ): schemas.$ZodLiteral<T[number]>;

      function _literal<const T extends util.Literal>(
        Class: util.SchemaClass<schemas.$ZodLiteral>,
        value: T,
        params?: string | $ZodLiteralParams
      ): schemas.$ZodLiteral<T>;

      type $ZodFileParams = TypeParams<schemas.$ZodFile>;

      function _file(Class: util.SchemaClass<schemas.$ZodFile>, params?: string | $ZodFileParams): schemas.$ZodFile;

      type $ZodTransformParams = TypeParams<schemas.$ZodTransform, 'transform'>;

      function _transform<I = unknown, O = I>(
        Class: util.SchemaClass<schemas.$ZodTransform>,
        fn: (input: I, ctx?: schemas.ParsePayload) => O
      ): schemas.$ZodTransform<Awaited<O>, I>;

      type $ZodOptionalParams = TypeParams<schemas.$ZodOptional, 'innerType'>;

      function _optional<T extends schemas.$ZodObject>(
        Class: util.SchemaClass<schemas.$ZodOptional>,
        innerType: T
      ): schemas.$ZodOptional<T>;

      type $ZodNullableParams = TypeParams<schemas.$ZodNullable, 'innerType'>;

      function _nullable<T extends schemas.$ZodObject>(
        Class: util.SchemaClass<schemas.$ZodNullable>,
        innerType: T
      ): schemas.$ZodNullable<T>;

      type $ZodDefaultParams = TypeParams<schemas.$ZodDefault, 'innerType' | 'defaultValue'>;

      function _default<T extends schemas.$ZodObject>(
        Class: util.SchemaClass<schemas.$ZodDefault>,
        innerType: T,
        defaultValue: util.NoUndefined<core.output<T>> | (() => util.NoUndefined<core.output<T>>)
      ): schemas.$ZodDefault<T>;

      type $ZodNonOptionalParams = TypeParams<schemas.$ZodNonOptional, 'innerType'>;

      function _nonoptional<T extends schemas.$ZodObject>(
        Class: util.SchemaClass<schemas.$ZodNonOptional>,
        innerType: T,
        params?: string | $ZodNonOptionalParams
      ): schemas.$ZodNonOptional<T>;

      type $ZodSuccessParams = TypeParams<schemas.$ZodSuccess, 'innerType'>;

      function _success<T extends schemas.$ZodObject>(
        Class: util.SchemaClass<schemas.$ZodSuccess>,
        innerType: T
      ): schemas.$ZodSuccess<T>;

      type $ZodCatchParams = TypeParams<schemas.$ZodCatch, 'innerType' | 'catchValue'>;

      function _catch<T extends schemas.$ZodObject>(
        Class: util.SchemaClass<schemas.$ZodCatch>,
        innerType: T,
        catchValue: core.output<T> | ((ctx: schemas.$ZodCatchCtx) => core.output<T>)
      ): schemas.$ZodCatch<T>;

      type $ZodPipeParams = TypeParams<schemas.$ZodPipe, 'in' | 'out'>;

      function _pipe<
        const A extends schemas.$ZodType,
        B extends schemas.$ZodType<unknown, core.output<A>> = schemas.$ZodType<unknown, core.output<A>>
      >(
        Class: util.SchemaClass<schemas.$ZodPipe>,
        in_: A,
        out: B | schemas.$ZodType<unknown, core.output<A>>
      ): schemas.$ZodPipe<A, B>;

      type $ZodReadonlyParams = TypeParams<schemas.$ZodReadonly, 'innerType'>;

      function _readonly<T extends schemas.$ZodObject>(
        Class: util.SchemaClass<schemas.$ZodReadonly>,
        innerType: T
      ): schemas.$ZodReadonly<T>;

      type $ZodTemplateLiteralParams = TypeParams<schemas.$ZodTemplateLiteral, 'parts'>;

      function _templateLiteral<const Parts extends schemas.$ZodTemplateLiteralPart[]>(
        Class: util.SchemaClass<schemas.$ZodTemplateLiteral>,
        parts: Parts,
        params?: string | $ZodTemplateLiteralParams
      ): schemas.$ZodTemplateLiteral<schemas.$PartsToTemplateLiteral<Parts>>;

      type $ZodLazyParams = TypeParams<schemas.$ZodLazy, 'getter'>;

      function _lazy<T extends schemas.$ZodType>(
        Class: util.SchemaClass<schemas.$ZodLazy>,
        getter: () => T
      ): schemas.$ZodLazy<T>;

      type $ZodPromiseParams = TypeParams<schemas.$ZodPromise, 'innerType'>;

      function _promise<T extends schemas.$ZodObject>(
        Class: util.SchemaClass<schemas.$ZodPromise>,
        innerType: T
      ): schemas.$ZodPromise<T>;

      type $ZodCustomParams = CheckTypeParams<schemas.$ZodCustom, 'fn'>;

      function _custom<O = unknown, I = O>(
        Class: util.SchemaClass<schemas.$ZodCustom>,
        fn: (data: O) => unknown,
        _params: string | $ZodCustomParams | undefined
      ): schemas.$ZodCustom<O, I>;

      function _refine<T>(
        Class: util.SchemaClass<schemas.$ZodCustom>,
        fn: (arg: NoInfer<T>) => util.MaybeAsync<unknown>,
        _params?: string | $ZodCustomParams
      ): checks.$ZodCheck<T>;

      interface $ZodStringBoolParams extends TypeParams {
        truthy?: string[];
        falsy?: string[];
        /**
         * Options `"sensitive"`, `"insensitive"`
         *
         * Defaults to `"insensitive"`
         */
        case?: 'sensitive' | 'insensitive' | undefined;
      }

      function _stringbool(
        Classes: {
          Pipe?: typeof schemas.$ZodPipe;
          Boolean?: typeof schemas.$ZodBoolean;
          Unknown?: typeof schemas.$ZodUnknown;
        },
        _params?: string | $ZodStringBoolParams
      ): schemas.$ZodPipe<schemas.$ZodUnknown, schemas.$ZodBoolean<boolean>>;
    }

    export import Params = api_.Params;
    export import TypeParams = api_.TypeParams;
    export import CheckParams = api_.CheckParams;
    export import StringFormatParams = api_.StringFormatParams;
    export import CheckStringFormatParams = api_.CheckStringFormatParams;
    export import CheckTypeParams = api_.CheckTypeParams;
    export import $ZodStringParams = api_.$ZodStringParams;
    export import _string = api_._string;
    export import _coercedString = api_._coercedString;
    export import $ZodEmailParams = api_.$ZodEmailParams;
    export import $ZodCheckEmailParams = api_.$ZodCheckEmailParams;
    export import _email = api_._email;
    export import $ZodGUIDParams = api_.$ZodGUIDParams;
    export import $ZodCheckGUIDParams = api_.$ZodCheckGUIDParams;
    export import _guid = api_._guid;
    export import $ZodUUIDParams = api_.$ZodUUIDParams;
    export import $ZodCheckUUIDParams = api_.$ZodCheckUUIDParams;
    export import _uuid = api_._uuid;
    export import $ZodUUIDv4Params = api_.$ZodUUIDv4Params;
    export import $ZodCheckUUIDv4Params = api_.$ZodCheckUUIDv4Params;
    export import _uuidv4 = api_._uuidv4;
    export import $ZodUUIDv6Params = api_.$ZodUUIDv6Params;
    export import $ZodCheckUUIDv6Params = api_.$ZodCheckUUIDv6Params;
    export import _uuidv6 = api_._uuidv6;
    export import $ZodUUIDv7Params = api_.$ZodUUIDv7Params;
    export import $ZodCheckUUIDv7Params = api_.$ZodCheckUUIDv7Params;
    export import _uuidv7 = api_._uuidv7;
    export import $ZodURLParams = api_.$ZodURLParams;
    export import $ZodCheckURLParams = api_.$ZodCheckURLParams;
    export import _url = api_._url;
    export import $ZodEmojiParams = api_.$ZodEmojiParams;
    export import $ZodCheckEmojiParams = api_.$ZodCheckEmojiParams;
    export import _emoji = api_._emoji;
    export import $ZodNanoIDParams = api_.$ZodNanoIDParams;
    export import $ZodCheckNanoIDParams = api_.$ZodCheckNanoIDParams;
    export import _nanoid = api_._nanoid;
    export import $ZodCUIDParams = api_.$ZodCUIDParams;
    export import $ZodCheckCUIDParams = api_.$ZodCheckCUIDParams;
    export import _cuid = api_._cuid;
    export import $ZodCUID2Params = api_.$ZodCUID2Params;
    export import $ZodCheckCUID2Params = api_.$ZodCheckCUID2Params;
    export import _cuid2 = api_._cuid2;
    export import $ZodULIDParams = api_.$ZodULIDParams;
    export import $ZodCheckULIDParams = api_.$ZodCheckULIDParams;
    export import _ulid = api_._ulid;
    export import $ZodXIDParams = api_.$ZodXIDParams;
    export import $ZodCheckXIDParams = api_.$ZodCheckXIDParams;
    export import _xid = api_._xid;
    export import $ZodKSUIDParams = api_.$ZodKSUIDParams;
    export import $ZodCheckKSUIDParams = api_.$ZodCheckKSUIDParams;
    export import _ksuid = api_._ksuid;
    export import $ZodIPv4Params = api_.$ZodIPv4Params;
    export import $ZodCheckIPv4Params = api_.$ZodCheckIPv4Params;
    export import _ipv4 = api_._ipv4;
    export import $ZodIPv6Params = api_.$ZodIPv6Params;
    export import $ZodCheckIPv6Params = api_.$ZodCheckIPv6Params;
    export import _ipv6 = api_._ipv6;
    export import $ZodCIDRv4Params = api_.$ZodCIDRv4Params;
    export import $ZodCheckCIDRv4Params = api_.$ZodCheckCIDRv4Params;
    export import _cidrv4 = api_._cidrv4;
    export import $ZodCIDRv6Params = api_.$ZodCIDRv6Params;
    export import $ZodCheckCIDRv6Params = api_.$ZodCheckCIDRv6Params;
    export import _cidrv6 = api_._cidrv6;
    export import $ZodBase64Params = api_.$ZodBase64Params;
    export import $ZodCheckBase64Params = api_.$ZodCheckBase64Params;
    export import _base64 = api_._base64;
    export import $ZodBase64URLParams = api_.$ZodBase64URLParams;
    export import $ZodCheckBase64URLParams = api_.$ZodCheckBase64URLParams;
    export import _base64url = api_._base64url;
    export import $ZodE164Params = api_.$ZodE164Params;
    export import $ZodCheckE164Params = api_.$ZodCheckE164Params;
    export import _e164 = api_._e164;
    export import $ZodJWTParams = api_.$ZodJWTParams;
    export import $ZodCheckJWTParams = api_.$ZodCheckJWTParams;
    export import _jwt = api_._jwt;
    export import $ZodISODateTimeParams = api_.$ZodISODateTimeParams;
    export import $ZodCheckISODateTimeParams = api_.$ZodCheckISODateTimeParams;
    export import _isoDateTime = api_._isoDateTime;
    export import $ZodISODateParams = api_.$ZodISODateParams;
    export import $ZodCheckISODateParams = api_.$ZodCheckISODateParams;
    export import _isoDate = api_._isoDate;
    export import $ZodISOTimeParams = api_.$ZodISOTimeParams;
    export import $ZodCheckISOTimeParams = api_.$ZodCheckISOTimeParams;
    export import _isoTime = api_._isoTime;
    export import $ZodISODurationParams = api_.$ZodISODurationParams;
    export import $ZodCheckISODurationParams = api_.$ZodCheckISODurationParams;
    export import _isoDuration = api_._isoDuration;
    export import $ZodNumberParams = api_.$ZodNumberParams;
    export import $ZodNumberFormatParams = api_.$ZodNumberFormatParams;
    export import $ZodCheckNumberFormatParams = api_.$ZodCheckNumberFormatParams;
    export import _number = api_._number;
    export import _coercedNumber = api_._coercedNumber;
    export import _int = api_._int;
    export import _float32 = api_._float32;
    export import _float64 = api_._float64;
    export import _int32 = api_._int32;
    export import _uint32 = api_._uint32;
    export import $ZodBooleanParams = api_.$ZodBooleanParams;
    export import _boolean = api_._boolean;
    export import _coercedBoolean = api_._coercedBoolean;
    export import $ZodBigIntParams = api_.$ZodBigIntParams;
    export import $ZodBigIntFormatParams = api_.$ZodBigIntFormatParams;
    export import $ZodCheckBigIntFormatParams = api_.$ZodCheckBigIntFormatParams;
    export import _bigint = api_._bigint;
    export import _coercedBigint = api_._coercedBigint;
    export import _int64 = api_._int64;
    export import _uint64 = api_._uint64;
    export import $ZodSymbolParams = api_.$ZodSymbolParams;
    export import _symbol = api_._symbol;
    export import $ZodUndefinedParams = api_.$ZodUndefinedParams;
    export import _undefined = api_._undefined;
    export import $ZodNullParams = api_.$ZodNullParams;
    export import _null = api_._null;
    export import $ZodAnyParams = api_.$ZodAnyParams;
    export import _any = api_._any;
    export import $ZodUnknownParams = api_.$ZodUnknownParams;
    export import _unknown = api_._unknown;
    export import $ZodNeverParams = api_.$ZodNeverParams;
    export import _never = api_._never;
    export import $ZodVoidParams = api_.$ZodVoidParams;
    export import _void = api_._void;
    export import $ZodDateParams = api_.$ZodDateParams;
    export import _date = api_._date;
    export import _coercedDate = api_._coercedDate;
    export import $ZodNaNParams = api_.$ZodNaNParams;
    export import _nan = api_._nan;
    export import $ZodCheckLessThanParams = api_.$ZodCheckLessThanParams;
    export import _lt = api_._lt;
    export import _lte = api_._lte;
    export { _lte as _max };
    export import $ZodCheckGreaterThanParams = api_.$ZodCheckGreaterThanParams;
    export import _gt = api_._gt;
    export import _gte = api_._gte;
    export { _gte as _min };
    export import _positive = api_._positive;
    export import _negative = api_._negative;
    export import _nonpositive = api_._nonpositive;
    export import _nonnegative = api_._nonnegative;
    export import $ZodCheckMultipleOfParams = api_.$ZodCheckMultipleOfParams;
    export import _multipleOf = api_._multipleOf;
    export import $ZodCheckMaxSizeParams = api_.$ZodCheckMaxSizeParams;
    export import _maxSize = api_._maxSize;
    export import $ZodCheckMinSizeParams = api_.$ZodCheckMinSizeParams;
    export import _minSize = api_._minSize;
    export import $ZodCheckSizeEqualsParams = api_.$ZodCheckSizeEqualsParams;
    export import _size = api_._size;
    export import $ZodCheckMaxLengthParams = api_.$ZodCheckMaxLengthParams;
    export import _maxLength = api_._maxLength;
    export import $ZodCheckMinLengthParams = api_.$ZodCheckMinLengthParams;
    export import _minLength = api_._minLength;
    export import $ZodCheckLengthEqualsParams = api_.$ZodCheckLengthEqualsParams;
    export import _length = api_._length;
    export import $ZodCheckRegexParams = api_.$ZodCheckRegexParams;
    export import _regex = api_._regex;
    export import $ZodCheckLowerCaseParams = api_.$ZodCheckLowerCaseParams;
    export import _lowercase = api_._lowercase;
    export import $ZodCheckUpperCaseParams = api_.$ZodCheckUpperCaseParams;
    export import _uppercase = api_._uppercase;
    export import $ZodCheckIncludesParams = api_.$ZodCheckIncludesParams;
    export import _includes = api_._includes;
    export import $ZodCheckStartsWithParams = api_.$ZodCheckStartsWithParams;
    export import _startsWith = api_._startsWith;
    export import $ZodCheckEndsWithParams = api_.$ZodCheckEndsWithParams;
    export import _endsWith = api_._endsWith;
    export import $ZodCheckPropertyParams = api_.$ZodCheckPropertyParams;
    export import _property = api_._property;
    export import $ZodCheckMimeTypeParams = api_.$ZodCheckMimeTypeParams;
    export import _mime = api_._mime;
    export import _overwrite = api_._overwrite;
    export import _normalize = api_._normalize;
    export import _trim = api_._trim;
    export import _toLowerCase = api_._toLowerCase;
    export import _toUpperCase = api_._toUpperCase;
    export import $ZodArrayParams = api_.$ZodArrayParams;
    export import _array = api_._array;
    export import $ZodObjectParams = api_.$ZodObjectParams;
    export import $ZodUnionParams = api_.$ZodUnionParams;
    export import _union = api_._union;
    export import $ZodTypeDiscriminableInternals = api_.$ZodTypeDiscriminableInternals;
    export import $ZodTypeDiscriminable = api_.$ZodTypeDiscriminable;
    export import $ZodDiscriminatedUnionParams = api_.$ZodDiscriminatedUnionParams;
    export import _discriminatedUnion = api_._discriminatedUnion;
    export import $ZodIntersectionParams = api_.$ZodIntersectionParams;
    export import _intersection = api_._intersection;
    export import $ZodTupleParams = api_.$ZodTupleParams;
    export import _tuple = api_._tuple;
    export import $ZodRecordParams = api_.$ZodRecordParams;
    export import _record = api_._record;
    export import $ZodMapParams = api_.$ZodMapParams;
    export import _map = api_._map;
    export import $ZodSetParams = api_.$ZodSetParams;
    export import _set = api_._set;
    export import $ZodEnumParams = api_.$ZodEnumParams;
    export import _enum = api_._enum;
    export import _nativeEnum = api_._nativeEnum;
    export import $ZodLiteralParams = api_.$ZodLiteralParams;
    export import _literal = api_._literal;
    export import $ZodFileParams = api_.$ZodFileParams;
    export import _file = api_._file;
    export import $ZodTransformParams = api_.$ZodTransformParams;
    export import _transform = api_._transform;
    export import $ZodOptionalParams = api_.$ZodOptionalParams;
    export import _optional = api_._optional;
    export import $ZodNullableParams = api_.$ZodNullableParams;
    export import _nullable = api_._nullable;
    export import $ZodDefaultParams = api_.$ZodDefaultParams;
    export import _default = api_._default;
    export import $ZodNonOptionalParams = api_.$ZodNonOptionalParams;
    export import _nonoptional = api_._nonoptional;
    export import $ZodSuccessParams = api_.$ZodSuccessParams;
    export import _success = api_._success;
    export import $ZodCatchParams = api_.$ZodCatchParams;
    export import _catch = api_._catch;
    export import $ZodPipeParams = api_.$ZodPipeParams;
    export import _pipe = api_._pipe;
    export import $ZodReadonlyParams = api_.$ZodReadonlyParams;
    export import _readonly = api_._readonly;
    export import $ZodTemplateLiteralParams = api_.$ZodTemplateLiteralParams;
    export import _templateLiteral = api_._templateLiteral;
    export import $ZodLazyParams = api_.$ZodLazyParams;
    export import _lazy = api_._lazy;
    export import $ZodPromiseParams = api_.$ZodPromiseParams;
    export import _promise = api_._promise;
    export import $ZodCustomParams = api_.$ZodCustomParams;
    export import _custom = api_._custom;
    export import _refine = api_._refine;
    export import $ZodStringBoolParams = api_.$ZodStringBoolParams;
    export import _stringbool = api_._stringbool;

    // to-json-schema

    namespace toJSONSchema_ {
      interface JSONSchemaGeneratorParams {
        metadata?: $ZodRegistry<Record<string, any>>;
        target?: 'draft-7' | 'draft-2020-12';
        unrepresentable?: 'throw' | 'any';
        override?: (ctx: { zodSchema: schemas.$ZodTypes; jsonSchema: JSONSchema.BaseSchema }) => void;
        io?: 'input' | 'output';
      }

      interface ProcessParams {
        schemaPath: schemas.$ZodType[];
        path: (string | number)[];
      }

      interface EmitParams {
        /** How to handle cycles.
         * - `"ref"` — Default. Cycles will be broken using $defs
         * - `"throw"` — Cycles will throw an error if encountered */
        cycles?: 'ref' | 'throw';
        reused?: 'ref' | 'inline';
        external?:
          | {
              /**  */
              registry: $ZodRegistry<{
                id?: string | undefined;
              }>;
              uri: (id: string) => string;
              defs: Record<string, JSONSchema.BaseSchema>;
            }
          | undefined;
      }

      interface Seen {
        /** JSON Schema result for this Zod schema */
        schema: JSONSchema.BaseSchema;
        /** A cached version of the schema that doesn't get overwritten during ref resolution */
        def?: JSONSchema.BaseSchema;
        defId?: string | undefined;
        /** Number of times this schema was encountered during traversal */
        count: number;
        /** Cycle path */
        cycle?: (string | number)[] | undefined;
        isParent?: boolean | undefined;
        ref?: schemas.$ZodType | undefined | null;
      }

      class JSONSchemaGenerator {
        metadataRegistry: $ZodRegistry<Record<string, any>>;
        target: 'draft-7' | 'draft-2020-12';
        unrepresentable: 'throw' | 'any';
        override: (ctx: { zodSchema: schemas.$ZodTypes; jsonSchema: JSONSchema.BaseSchema }) => void;
        io: 'input' | 'output';
        counter: number;
        seen: Map<schemas.$ZodType, Seen>;
        constructor(params?: JSONSchemaGeneratorParams);
        process(schema: schemas.$ZodType, _params?: ProcessParams): JSONSchema.BaseSchema;
        emit(schema: schemas.$ZodType, _params?: EmitParams): JSONSchema.BaseSchema;
      }
      interface ToJSONSchemaParams extends Omit<JSONSchemaGeneratorParams & EmitParams, never> {}

      interface RegistryToJSONSchemaParams extends Omit<JSONSchemaGeneratorParams & EmitParams, never> {
        uri?: (id: string) => string;
      }
      function toJSONSchema(schema: schemas.$ZodType, _params?: ToJSONSchemaParams): JSONSchema.BaseSchema;
      function toJSONSchema(
        registry: $ZodRegistry<{
          id?: string | undefined;
        }>,
        _params?: RegistryToJSONSchemaParams
      ): {
        schemas: Record<string, JSONSchema.BaseSchema>;
      };
    }

    export import JSONSchemaGeneratorParams = toJSONSchema_.JSONSchemaGeneratorParams;
    export import ProcessParams = toJSONSchema_.ProcessParams;
    export import EmitParams = toJSONSchema_.EmitParams;
    export import Seen = toJSONSchema_.Seen;
    export import JSONSchemaGenerator = toJSONSchema_.JSONSchemaGenerator;
    export import ToJSONSchemaParams = toJSONSchema_.ToJSONSchemaParams;
    export import RegistryToJSONSchemaParams = toJSONSchema_.RegistryToJSONSchemaParams;
    export import toJSONSchema = toJSONSchema_.toJSONSchema;

    // json-schema

    export namespace JSONSchema {
      type Schema =
        | ObjectSchema
        | ArraySchema
        | StringSchema
        | NumberSchema
        | IntegerSchema
        | BooleanSchema
        | NullSchema;

      interface BaseSchema {
        type?: string | undefined;
        $id?: string | undefined;
        id?: string | undefined;
        $schema?: string | undefined;
        $ref?: string | undefined;
        $anchor?: string | undefined;
        $defs?:
          | {
              [key: string]: BaseSchema;
            }
          | undefined;
        definitions?:
          | {
              [key: string]: BaseSchema;
            }
          | undefined;
        $comment?: string | undefined;
        title?: string | undefined;
        description?: string | undefined;
        default?: unknown | undefined;
        examples?: unknown[] | undefined;
        readOnly?: boolean | undefined;
        writeOnly?: boolean | undefined;
        deprecated?: boolean | undefined;
        allOf?: BaseSchema[] | undefined;
        anyOf?: BaseSchema[] | undefined;
        oneOf?: BaseSchema[] | undefined;
        not?: BaseSchema | undefined;
        if?: BaseSchema | undefined;
        then?: BaseSchema | undefined;
        else?: BaseSchema | undefined;
        enum?: Array<string | number | boolean | null> | undefined;
        const?: string | number | boolean | null | undefined;
        [k: string]: unknown;
        /** A special key used as an intermediate representation of extends-style relationships. Omitted as a $ref with additional properties. */
        _prefault?: unknown | undefined;
      }

      interface ObjectSchema extends BaseSchema {
        type: 'object';
        properties?:
          | {
              [key: string]: BaseSchema;
            }
          | undefined;
        patternProperties?:
          | {
              [key: string]: BaseSchema;
            }
          | undefined;
        additionalProperties?: BaseSchema | boolean | undefined;
        required?: string[] | undefined;
        dependentRequired?:
          | {
              [key: string]: string[];
            }
          | undefined;
        propertyNames?: BaseSchema | undefined;
        minProperties?: number | undefined;
        maxProperties?: number | undefined;
        unevaluatedProperties?: BaseSchema | boolean | undefined;
        dependentSchemas?:
          | {
              [key: string]: BaseSchema;
            }
          | undefined;
      }

      interface ArraySchema extends BaseSchema {
        type: 'array';
        items?: BaseSchema | BaseSchema[] | undefined;
        prefixItems?: BaseSchema[] | undefined;
        additionalItems?: BaseSchema | boolean;
        contains?: BaseSchema | undefined;
        minItems?: number | undefined;
        maxItems?: number | undefined;
        minContains?: number | undefined;
        maxContains?: number | undefined;
        uniqueItems?: boolean | undefined;
        unevaluatedItems?: BaseSchema | boolean | undefined;
      }

      interface StringSchema extends BaseSchema {
        type: 'string';
        minLength?: number | undefined;
        maxLength?: number | undefined;
        pattern?: string | undefined;
        format?: string | undefined;
        contentEncoding?: string | undefined;
        contentMediaType?: string | undefined;
      }

      interface NumberSchema extends BaseSchema {
        type: 'number';
        minimum?: number | undefined;
        maximum?: number | undefined;
        exclusiveMinimum?: number | undefined;
        exclusiveMaximum?: number | undefined;
        multipleOf?: number | undefined;
      }

      interface IntegerSchema extends BaseSchema {
        type: 'integer';
        minimum?: number | undefined;
        maximum?: number | undefined;
        exclusiveMinimum?: number | undefined;
        exclusiveMaximum?: number | undefined;
        multipleOf?: number | undefined;
      }

      interface BooleanSchema extends BaseSchema {
        type: 'boolean';
      }

      interface NullSchema extends BaseSchema {
        type: 'null';
      }
    }

    // standard-schema

    namespace standardSchema {
      /** The Standard Schema interface. */
      interface StandardSchemaV1<Input = unknown, Output = Input> {
        /** The Standard Schema properties. */
        readonly '~standard': StandardSchemaV1.Props<Input, Output>;
      }

      namespace StandardSchemaV1 {
        /** The Standard Schema properties interface. */
        interface Props<Input = unknown, Output = Input> {
          /** The version number of the standard. */
          readonly version: 1;
          /** The vendor name of the schema library. */
          readonly vendor: string;
          /** Validates unknown input values. */
          readonly validate: (value: unknown) => Result<Output> | Promise<Result<Output>>;
          /** Inferred types associated with the schema. */
          readonly types?: Types<Input, Output> | undefined;
        }

        /** The result interface of the validate function. */
        type Result<Output> = SuccessResult<Output> | FailureResult;

        /** The result interface if validation succeeds. */
        interface SuccessResult<Output> {
          /** The typed output value. */
          readonly value: Output;
          /** The non-existent issues. */
          readonly issues?: undefined;
        }

        /** The result interface if validation fails. */
        interface FailureResult {
          /** The issues of failed validation. */
          readonly issues: ReadonlyArray<Issue>;
        }

        /** The issue interface of the failure output. */
        interface Issue {
          /** The error message of the issue. */
          readonly message: string;
          /** The path of the issue, if any. */
          readonly path?: ReadonlyArray<PropertyKey | PathSegment> | undefined;
        }

        /** The path segment interface of the issue. */
        interface PathSegment {
          /** The key representing a path segment. */
          readonly key: PropertyKey;
        }

        /** The Standard Schema types interface. */
        interface Types<Input = unknown, Output = Input> {
          /** The input type of the schema. */
          readonly input: Input;
          /** The output type of the schema. */
          readonly output: Output;
        }

        /** Infers the input type of a Standard Schema. */
        type InferInput<Schema extends StandardSchemaV1> = NonNullable<Schema['~standard']['types']>['input'];

        /** Infers the output type of a Standard Schema. */
        type InferOutput<Schema extends StandardSchemaV1> = NonNullable<Schema['~standard']['types']>['output'];
      }
    }

    export import StandardSchemaV1 = standardSchema.StandardSchemaV1;
  }
  // SCHEMAS
  namespace schemas {
    export interface RefinementCtx<T = unknown> extends core.ParsePayload<T> {
      addIssue(arg: string | core.$ZodRawIssue | Partial<core.$ZodIssueCustom>): void;
    }
    export interface ZodType<out Output = unknown, out Input = unknown> extends core.$ZodType<Output, Input> {
      def: this['_zod']['def'];
      /** @deprecated Use `.def` instead. */
      _def: this['_zod']['def'];
      _output: core.output<this>;
      _input: core.input<this>;
      check(...checks: (core.CheckFn<core.output<this>> | core.$ZodCheck<core.output<this>>)[]): this;
      clone(
        def?: this['_zod']['def'],
        params?: {
          parent: boolean;
        }
      ): this;
      register<R extends core.$ZodRegistry>(
        registry: R,
        ...meta: this extends R['_schema']
          ? undefined extends R['_meta']
            ? [core.$replace<R['_meta'], this>?]
            : [core.$replace<R['_meta'], this>]
          : ['Incompatible schema']
      ): this;
      brand<T extends PropertyKey = PropertyKey>(value?: T): PropertyKey extends T ? this : core.$ZodBranded<this, T>;
      parse(data: unknown, params?: core.ParseContext<core.$ZodIssue>): core.output<this>;
      safeParse(data: unknown, params?: core.ParseContext<core.$ZodIssue>): ZodSafeParseResult<core.output<this>>;
      parseAsync(data: unknown, params?: core.ParseContext<core.$ZodIssue>): Promise<core.output<this>>;
      safeParseAsync(
        data: unknown,
        params?: core.ParseContext<core.$ZodIssue>
      ): Promise<ZodSafeParseResult<core.output<this>>>;
      spa: (
        data: unknown,
        params?: core.ParseContext<core.$ZodIssue>
      ) => Promise<ZodSafeParseResult<core.output<this>>>;
      refine(
        check: (arg: core.output<this>) => unknown | Promise<unknown>,
        params?: string | core.$ZodCustomParams
      ): this;
      /** @deprecated Use `.check()` instead. */
      superRefine(
        refinement: (arg: core.output<this>, ctx: RefinementCtx<this['_zod']['output']>) => void | Promise<void>
      ): this;
      overwrite(fn: (x: core.output<this>) => core.output<this>): this;
      optional(): ZodOptional<this>;
      nonoptional(params?: string | core.$ZodNonOptionalParams): ZodNonOptional<this>;
      nullable(): ZodNullable<this>;
      nullish(): ZodOptional<ZodNullable<this>>;
      default(def: core.util.NoUndefined<core.output<this>>): ZodDefault<this>;
      default(def: () => core.util.NoUndefined<core.output<this>>): ZodDefault<this>;
      prefault(def: () => core.input<this>): ZodPrefault<this>;
      prefault(def: core.input<this>): ZodPrefault<this>;
      array(): ZodArray<this>;
      or<T extends core.$ZodType>(option: T): ZodUnion<[this, T]>;
      and<T extends core.$ZodType>(incoming: T): ZodIntersection<this, T>;
      transform<NewOut>(
        transform: (arg: core.output<this>, ctx: RefinementCtx<core.output<this>>) => NewOut | Promise<NewOut>
      ): ZodPipe<this, ZodTransform<Awaited<NewOut>, core.output<this>>>;
      catch(def: core.output<this>): ZodCatch<this>;
      catch(def: (ctx: core.$ZodCatchCtx) => core.output<this>): ZodCatch<this>;
      pipe<T extends core.$ZodType<any, this['_zod']['output']>>(
        target: T | core.$ZodType<any, this['_zod']['output']>
      ): ZodPipe<this, T>;
      readonly(): ZodReadonly<this>;
      /** Returns a new instance that has been registered in `z.globalRegistry` with the specified description */
      describe(description: string): this;
      description?: string;
      /** Returns the metadata associated with this instance in `z.globalRegistry` */
      meta(): core.$replace<core.GlobalMeta, this> | undefined;
      /** Returns a new instance that has been registered in `z.globalRegistry` with the specified metadata */
      meta(data: core.$replace<core.GlobalMeta, this>): this;
      /** @deprecated Try safe-parsing `undefined` (this is what `isOptional` does internally):
       *
       * ```ts
       * const schema = z.string().optional();
       * const isOptional = schema.safeParse(undefined).success; // true
       * ```
       */
      isOptional(): boolean;
      /**
       * @deprecated Try safe-parsing `null` (this is what `isNullable` does internally):
       *
       * ```ts
       * const schema = z.string().nullable();
       * const isNullable = schema.safeParse(null).success; // true
       * ```
       */
      isNullable(): boolean;
    }
    export const ZodType: core.$constructor<ZodType>;
    export interface _ZodString<Input = unknown> extends ZodType {
      _zod: core.$ZodStringInternals<Input>;
      format: string | null;
      minLength: number | null;
      maxLength: number | null;
      regex(regex: RegExp, params?: string | core.$ZodCheckRegexParams): this;
      includes(value: string, params?: core.$ZodCheckIncludesParams): this;
      startsWith(value: string, params?: string | core.$ZodCheckStartsWithParams): this;
      endsWith(value: string, params?: string | core.$ZodCheckEndsWithParams): this;
      min(minLength: number, params?: string | core.$ZodCheckMinLengthParams): this;
      max(maxLength: number, params?: string | core.$ZodCheckMaxLengthParams): this;
      length(len: number, params?: string | core.$ZodCheckLengthEqualsParams): this;
      nonempty(params?: string | core.$ZodCheckMinLengthParams): this;
      lowercase(params?: string | core.$ZodCheckLowerCaseParams): this;
      uppercase(params?: string | core.$ZodCheckUpperCaseParams): this;
      trim(): this;
      normalize(form?: 'NFC' | 'NFD' | 'NFKC' | 'NFKD' | (string & {})): this;
      toLowerCase(): this;
      toUpperCase(): this;
    }
    /** @internal */
    export const _ZodString: core.$constructor<_ZodString>;
    export interface ZodString extends _ZodString<string> {
      /** @deprecated Use `z.email()` instead. */
      email(params?: string | core.$ZodCheckEmailParams): this;
      /** @deprecated Use `z.url()` instead. */
      url(params?: string | core.$ZodCheckURLParams): this;
      /** @deprecated Use `z.jwt()` instead. */
      jwt(params?: string | core.$ZodCheckJWTParams): this;
      /** @deprecated Use `z.emoji()` instead. */
      emoji(params?: string | core.$ZodCheckEmojiParams): this;
      /** @deprecated Use `z.guid()` instead. */
      guid(params?: string | core.$ZodCheckGUIDParams): this;
      /** @deprecated Use `z.uuid()` instead. */
      uuid(params?: string | core.$ZodCheckUUIDParams): this;
      /** @deprecated Use `z.uuid()` instead. */
      uuidv4(params?: string | core.$ZodCheckUUIDParams): this;
      /** @deprecated Use `z.uuid()` instead. */
      uuidv6(params?: string | core.$ZodCheckUUIDParams): this;
      /** @deprecated Use `z.uuid()` instead. */
      uuidv7(params?: string | core.$ZodCheckUUIDParams): this;
      /** @deprecated Use `z.nanoid()` instead. */
      nanoid(params?: string | core.$ZodCheckNanoIDParams): this;
      /** @deprecated Use `z.guid()` instead. */
      guid(params?: string | core.$ZodCheckGUIDParams): this;
      /** @deprecated Use `z.cuid()` instead. */
      cuid(params?: string | core.$ZodCheckCUIDParams): this;
      /** @deprecated Use `z.cuid2()` instead. */
      cuid2(params?: string | core.$ZodCheckCUID2Params): this;
      /** @deprecated Use `z.ulid()` instead. */
      ulid(params?: string | core.$ZodCheckULIDParams): this;
      /** @deprecated Use `z.base64()` instead. */
      base64(params?: string | core.$ZodCheckBase64Params): this;
      /** @deprecated Use `z.base64url()` instead. */
      base64url(params?: string | core.$ZodCheckBase64URLParams): this;
      /** @deprecated Use `z.xid()` instead. */
      xid(params?: string | core.$ZodCheckXIDParams): this;
      /** @deprecated Use `z.ksuid()` instead. */
      ksuid(params?: string | core.$ZodCheckKSUIDParams): this;
      /** @deprecated Use `z.ipv4()` instead. */
      ipv4(params?: string | core.$ZodCheckIPv4Params): this;
      /** @deprecated Use `z.ipv6()` instead. */
      ipv6(params?: string | core.$ZodCheckIPv6Params): this;
      /** @deprecated Use `z.cidrv4()` instead. */
      cidrv4(params?: string | core.$ZodCheckCIDRv4Params): this;
      /** @deprecated Use `z.cidrv6()` instead. */
      cidrv6(params?: string | core.$ZodCheckCIDRv6Params): this;
      /** @deprecated Use `z.e164()` instead. */
      e164(params?: string | core.$ZodCheckE164Params): this;
      /** @deprecated Use `z.iso.datetime()` instead. */
      datetime(params?: string | core.$ZodCheckISODateTimeParams): this;
      /** @deprecated Use `z.iso.date()` instead. */
      date(params?: string | core.$ZodCheckISODateParams): this;
      /** @deprecated Use `z.iso.time()` instead. */
      time(params?: string | core.$ZodCheckISOTimeParams): this;
      /** @deprecated Use `z.iso.duration()` instead. */
      duration(params?: string | core.$ZodCheckISODurationParams): this;
    }
    export const ZodString: core.$constructor<ZodString>;
    export function string(params?: string | core.$ZodStringParams): ZodString;
    export interface ZodStringFormat<Format extends core.$ZodStringFormats = core.$ZodStringFormats>
      extends _ZodString {
      _zod: core.$ZodStringFormatInternals<Format>;
    }
    export const ZodStringFormat: core.$constructor<ZodStringFormat>;
    export interface ZodEmail extends ZodStringFormat<'email'> {
      _zod: core.$ZodEmailInternals;
    }
    export const ZodEmail: core.$constructor<ZodEmail>;
    export function email(params?: string | core.$ZodEmailParams): ZodEmail;
    export interface ZodGUID extends ZodStringFormat<'guid'> {
      _zod: core.$ZodGUIDInternals;
    }
    export const ZodGUID: core.$constructor<ZodGUID>;
    export function guid(params?: string | core.$ZodGUIDParams): ZodGUID;
    export interface ZodUUID extends ZodStringFormat<'uuid'> {
      _zod: core.$ZodUUIDInternals;
    }
    export const ZodUUID: core.$constructor<ZodUUID>;
    export function uuid(params?: string | core.$ZodUUIDParams): ZodUUID;
    export function uuidv4(params?: string | core.$ZodUUIDv4Params): ZodUUID;
    export function uuidv6(params?: string | core.$ZodUUIDv6Params): ZodUUID;
    export function uuidv7(params?: string | core.$ZodUUIDv7Params): ZodUUID;
    export interface ZodURL extends ZodStringFormat<'url'> {
      _zod: core.$ZodURLInternals;
    }
    export const ZodURL: core.$constructor<ZodURL>;
    export function url(params?: string | core.$ZodURLParams): ZodURL;
    export interface ZodEmoji extends ZodStringFormat<'emoji'> {
      _zod: core.$ZodEmojiInternals;
    }
    export const ZodEmoji: core.$constructor<ZodEmoji>;
    export function emoji(params?: string | core.$ZodEmojiParams): ZodEmoji;
    export interface ZodNanoID extends ZodStringFormat<'nanoid'> {
      _zod: core.$ZodNanoIDInternals;
    }
    export const ZodNanoID: core.$constructor<ZodNanoID>;
    export function nanoid(params?: string | core.$ZodNanoIDParams): ZodNanoID;
    export interface ZodCUID extends ZodStringFormat<'cuid'> {
      _zod: core.$ZodCUIDInternals;
    }
    export const ZodCUID: core.$constructor<ZodCUID>;
    export function cuid(params?: string | core.$ZodCUIDParams): ZodCUID;
    export interface ZodCUID2 extends ZodStringFormat<'cuid2'> {
      _zod: core.$ZodCUID2Internals;
    }
    export const ZodCUID2: core.$constructor<ZodCUID2>;
    export function cuid2(params?: string | core.$ZodCUID2Params): ZodCUID2;
    export interface ZodULID extends ZodStringFormat<'ulid'> {
      _zod: core.$ZodULIDInternals;
    }
    export const ZodULID: core.$constructor<ZodULID>;
    export function ulid(params?: string | core.$ZodULIDParams): ZodULID;
    export interface ZodXID extends ZodStringFormat<'xid'> {
      _zod: core.$ZodXIDInternals;
    }
    export const ZodXID: core.$constructor<ZodXID>;
    export function xid(params?: string | core.$ZodXIDParams): ZodXID;
    export interface ZodKSUID extends ZodStringFormat<'ksuid'> {
      _zod: core.$ZodKSUIDInternals;
    }
    export const ZodKSUID: core.$constructor<ZodKSUID>;
    export function ksuid(params?: string | core.$ZodKSUIDParams): ZodKSUID;
    export interface ZodIPv4 extends ZodStringFormat<'ipv4'> {
      _zod: core.$ZodIPv4Internals;
    }
    export const ZodIPv4: core.$constructor<ZodIPv4>;
    export function ipv4(params?: string | core.$ZodIPv4Params): ZodIPv4;
    export interface ZodIPv6 extends ZodStringFormat<'ipv6'> {
      _zod: core.$ZodIPv6Internals;
    }
    export const ZodIPv6: core.$constructor<ZodIPv6>;
    export function ipv6(params?: string | core.$ZodIPv6Params): ZodIPv6;
    export interface ZodCIDRv4 extends ZodStringFormat<'cidrv4'> {
      _zod: core.$ZodCIDRv4Internals;
    }
    export const ZodCIDRv4: core.$constructor<ZodCIDRv4>;
    export function cidrv4(params?: string | core.$ZodCIDRv4Params): ZodCIDRv4;
    export interface ZodCIDRv6 extends ZodStringFormat<'cidrv6'> {
      _zod: core.$ZodCIDRv6Internals;
    }
    export const ZodCIDRv6: core.$constructor<ZodCIDRv6>;
    export function cidrv6(params?: string | core.$ZodCIDRv6Params): ZodCIDRv6;
    export interface ZodBase64 extends ZodStringFormat<'base64'> {
      _zod: core.$ZodBase64Internals;
    }
    export const ZodBase64: core.$constructor<ZodBase64>;
    export function base64(params?: string | core.$ZodBase64Params): ZodBase64;
    export interface ZodBase64URL extends ZodStringFormat<'base64url'> {
      _zod: core.$ZodBase64URLInternals;
    }
    export const ZodBase64URL: core.$constructor<ZodBase64URL>;
    export function base64url(params?: string | core.$ZodBase64URLParams): ZodBase64URL;
    export interface ZodE164 extends ZodStringFormat<'e164'> {
      _zod: core.$ZodE164Internals;
    }
    export const ZodE164: core.$constructor<ZodE164>;
    export function e164(params?: string | core.$ZodE164Params): ZodE164;
    export interface ZodJWT extends ZodStringFormat<'jwt'> {
      _zod: core.$ZodJWTInternals;
    }
    export const ZodJWT: core.$constructor<ZodJWT>;
    export function jwt(params?: string | core.$ZodJWTParams): ZodJWT;
    export interface _ZodNumber<Input = unknown> extends ZodType {
      _zod: core.$ZodNumberInternals<Input>;
      gt(value: number, params?: string | core.$ZodCheckGreaterThanParams): this;
      /** Identical to .min() */
      gte(value: number, params?: string | core.$ZodCheckGreaterThanParams): this;
      min(value: number, params?: string | core.$ZodCheckGreaterThanParams): this;
      lt(value: number, params?: string | core.$ZodCheckLessThanParams): this;
      /** Identical to .max() */
      lte(value: number, params?: string | core.$ZodCheckLessThanParams): this;
      max(value: number, params?: string | core.$ZodCheckLessThanParams): this;
      /** Consider `z.int()` instead. This API is considered *legacy*; it will never be removed but a better alternative exists. */
      int(params?: string | core.$ZodCheckNumberFormatParams): this;
      /** @deprecated This is now identical to `.int()`. Only numbers in the safe integer range are accepted. */
      safe(params?: string | core.$ZodCheckNumberFormatParams): this;
      positive(params?: string | core.$ZodCheckGreaterThanParams): this;
      nonnegative(params?: string | core.$ZodCheckGreaterThanParams): this;
      negative(params?: string | core.$ZodCheckLessThanParams): this;
      nonpositive(params?: string | core.$ZodCheckLessThanParams): this;
      multipleOf(value: number, params?: string | core.$ZodCheckMultipleOfParams): this;
      /** @deprecated Use `.multipleOf()` instead. */
      step(value: number, params?: string | core.$ZodCheckMultipleOfParams): this;
      /** @deprecated In v4 and later, z.number() does not allow infinite values by default. This is a no-op. */
      finite(params?: unknown): this;
      minValue: number | null;
      maxValue: number | null;
      /** @deprecated Check the `format` property instead.  */
      isInt: boolean;
      /** @deprecated Number schemas no longer accept infinite values, so this always returns `true`. */
      isFinite: boolean;
      format: string | null;
    }
    export interface ZodNumber extends _ZodNumber<number> {}
    export const ZodNumber: core.$constructor<ZodNumber>;
    export function number(params?: string | core.$ZodNumberParams): ZodNumber;
    export interface ZodNumberFormat extends ZodNumber {
      _zod: core.$ZodNumberFormatInternals;
    }
    export const ZodNumberFormat: core.$constructor<ZodNumberFormat>;
    export interface ZodInt extends ZodNumberFormat {}
    export function int(params?: string | core.$ZodCheckNumberFormatParams): ZodInt;
    export interface ZodFloat32 extends ZodNumberFormat {}
    export function float32(params?: string | core.$ZodCheckNumberFormatParams): ZodFloat32;
    export interface ZodFloat64 extends ZodNumberFormat {}
    export function float64(params?: string | core.$ZodCheckNumberFormatParams): ZodFloat64;
    export interface ZodInt32 extends ZodNumberFormat {}
    export function int32(params?: string | core.$ZodCheckNumberFormatParams): ZodInt32;
    export interface ZodUInt32 extends ZodNumberFormat {}
    export function uint32(params?: string | core.$ZodCheckNumberFormatParams): ZodUInt32;
    export interface _ZodBoolean<T = unknown> extends ZodType {
      _zod: core.$ZodBooleanInternals<T>;
    }
    export interface ZodBoolean extends _ZodBoolean<boolean> {}
    export const ZodBoolean: core.$constructor<ZodBoolean>;
    export function boolean(params?: string | core.$ZodBooleanParams): ZodBoolean;
    export interface _ZodBigInt<T = unknown> extends ZodType {
      _zod: core.$ZodBigIntInternals<T>;
      gte(value: bigint, params?: string | core.$ZodCheckGreaterThanParams): this;
      /** Alias of `.gte()` */
      min(value: bigint, params?: string | core.$ZodCheckGreaterThanParams): this;
      gt(value: bigint, params?: string | core.$ZodCheckGreaterThanParams): this;
      /** Alias of `.lte()` */
      lte(value: bigint, params?: string | core.$ZodCheckLessThanParams): this;
      max(value: bigint, params?: string | core.$ZodCheckLessThanParams): this;
      lt(value: bigint, params?: string | core.$ZodCheckLessThanParams): this;
      positive(params?: string | core.$ZodCheckGreaterThanParams): this;
      negative(params?: string | core.$ZodCheckLessThanParams): this;
      nonpositive(params?: string | core.$ZodCheckLessThanParams): this;
      nonnegative(params?: string | core.$ZodCheckGreaterThanParams): this;
      multipleOf(value: bigint, params?: string | core.$ZodCheckMultipleOfParams): this;
      minValue: bigint | null;
      maxValue: bigint | null;
      format: string | null;
    }
    export interface ZodBigInt extends _ZodBigInt<bigint> {}
    export const ZodBigInt: core.$constructor<ZodBigInt>;
    export function bigint(params?: string | core.$ZodBigIntParams): ZodBigInt;
    export interface ZodBigIntFormat extends ZodBigInt {
      _zod: core.$ZodBigIntFormatInternals;
    }
    export const ZodBigIntFormat: core.$constructor<ZodBigIntFormat>;
    export function int64(params?: string | core.$ZodBigIntFormatParams): ZodBigIntFormat;
    export function uint64(params?: string | core.$ZodBigIntFormatParams): ZodBigIntFormat;
    export interface ZodSymbol extends ZodType {
      _zod: core.$ZodSymbolInternals;
    }
    export const ZodSymbol: core.$constructor<ZodSymbol>;
    export function symbol(params?: string | core.$ZodSymbolParams): ZodSymbol;
    export interface ZodUndefined extends ZodType {
      _zod: core.$ZodUndefinedInternals;
    }
    export const ZodUndefined: core.$constructor<ZodUndefined>;
    function _undefined(params?: string | core.$ZodUndefinedParams): ZodUndefined;
    export { _undefined as undefined };
    export interface ZodNull extends ZodType {
      _zod: core.$ZodNullInternals;
    }
    export const ZodNull: core.$constructor<ZodNull>;
    function _null(params?: string | core.$ZodNullParams): ZodNull;
    export { _null as null };
    export interface ZodAny extends ZodType {
      _zod: core.$ZodAnyInternals;
    }
    export const ZodAny: core.$constructor<ZodAny>;
    export function any(): ZodAny;
    export interface ZodUnknown extends ZodType {
      _zod: core.$ZodUnknownInternals;
    }
    export const ZodUnknown: core.$constructor<ZodUnknown>;
    export function unknown(): ZodUnknown;
    export interface ZodNever extends ZodType {
      _zod: core.$ZodNeverInternals;
    }
    export const ZodNever: core.$constructor<ZodNever>;
    export function never(params?: string | core.$ZodNeverParams): ZodNever;
    export interface ZodVoid extends ZodType {
      _zod: core.$ZodVoidInternals;
    }
    export const ZodVoid: core.$constructor<ZodVoid>;
    function _void(params?: string | core.$ZodVoidParams): ZodVoid;
    export { _void as void };
    export interface _ZodDate<T = unknown> extends ZodType {
      _zod: core.$ZodDateInternals<T>;
      min(value: number | Date, params?: string | core.$ZodCheckGreaterThanParams): this;
      max(value: number | Date, params?: string | core.$ZodCheckLessThanParams): this;
      /** @deprecated Not recommended. */
      minDate: Date | null;
      /** @deprecated Not recommended. */
      maxDate: Date | null;
    }
    export interface ZodDate extends _ZodDate<Date> {}
    export const ZodDate: core.$constructor<ZodDate>;
    export function date(params?: string | core.$ZodDateParams): ZodDate;
    export interface ZodArray<T extends core.$ZodType = core.$ZodType> extends ZodType {
      _zod: core.$ZodArrayInternals<T>;
      element: T;
      min(minLength: number, params?: string | core.$ZodCheckMinLengthParams): this;
      nonempty(params?: string | core.$ZodCheckMinLengthParams): this;
      max(maxLength: number, params?: string | core.$ZodCheckMaxLengthParams): this;
      length(len: number, params?: string | core.$ZodCheckLengthEqualsParams): this;
      unwrap(): T;
    }
    export const ZodArray: core.$constructor<ZodArray>;
    export function array<T extends core.$ZodType>(element: T, params?: string | core.$ZodArrayParams): ZodArray<T>;
    export function keyof<T extends ZodObject>(schema: T): ZodLiteral<keyof T['_zod']['output']>;
    export interface ZodObject<
      /** @ts-ignore Cast variance */
      out Shape extends core.$ZodShape = core.$ZodLooseShape,
      out Config extends core.$ZodObjectConfig = core.$ZodObjectConfig
    > extends ZodType {
      _zod: core.$ZodObjectInternals<Shape, Config>;
      shape: Shape;
      keyof(): ZodEnum<core.util.ToEnum<keyof Shape & string>>;
      /** Define a schema to validate all unrecognized keys. This overrides the existing strict/loose behavior. */
      catchall<T extends core.$ZodType>(schema: T): ZodObject<Shape, core.$catchall<T>>;
      /** @deprecated Use `z.looseObject()` or `.loose()` instead. */
      passthrough(): ZodObject<Shape, core.$loose>;
      /** Consider `z.looseObject(A.shape)` instead */
      loose(): ZodObject<Shape, core.$loose>;
      /** Consider `z.strictObject(A.shape)` instead */
      strict(): ZodObject<Shape, core.$strict>;
      /** This is the default behavior. This method call is likely unnecessary. */
      strip(): ZodObject<Shape, core.$strict>;
      extend<U extends core.$ZodLooseShape & Partial<Record<keyof Shape, core.$ZodType>>>(
        shape: U
      ): ZodObject<core.util.Extend<Shape, U>, Config>;
      /**
       * @deprecated Use spread syntax and the `.shape` property to combine two object schemas:
       *
       * ```ts
       * const A = z.object({ a: z.string() });
       * const B = z.object({ b: z.number() });
       *
       * const C = z.object({
       *    ...A.shape,
       *    ...B.shape
       * });
       * ```
       */
      merge<U extends ZodObject>(other: U): ZodObject<core.util.Extend<Shape, U['shape']>, U['_zod']['config']>;
      pick<M extends core.util.Exactly<core.util.Mask<keyof Shape>, M>>(
        mask: M
      ): ZodObject<core.util.Flatten<Pick<Shape, Extract<keyof Shape, keyof M>>>, Config>;
      omit<M extends core.util.Exactly<core.util.Mask<keyof Shape>, M>>(
        mask: M
      ): ZodObject<core.util.Flatten<Omit<Shape, Extract<keyof Shape, keyof M>>>, Config>;
      partial(): ZodObject<
        {
          [k in keyof Shape]: ZodOptional<Shape[k]>;
        },
        Config
      >;
      partial<M extends core.util.Exactly<core.util.Mask<keyof Shape>, M>>(
        mask: M
      ): ZodObject<
        {
          [k in keyof Shape]: k extends keyof M ? ZodOptional<Shape[k]> : Shape[k];
        },
        Config
      >;
      required(): ZodObject<
        {
          [k in keyof Shape]: ZodNonOptional<Shape[k]>;
        },
        Config
      >;
      required<M extends core.util.Exactly<core.util.Mask<keyof Shape>, M>>(
        mask: M
      ): ZodObject<
        {
          [k in keyof Shape]: k extends keyof M ? ZodNonOptional<Shape[k]> : Shape[k];
        },
        Config
      >;
    }
    export const ZodObject: core.$constructor<ZodObject>;
    export function object<T extends core.$ZodLooseShape = Partial<Record<never, core.$ZodType>>>(
      shape?: T,
      params?: string | core.$ZodObjectParams
    ): ZodObject<core.util.Writeable<T> & {}, core.$strip>;
    export function strictObject<T extends core.$ZodLooseShape>(
      shape: T,
      params?: string | core.$ZodObjectParams
    ): ZodObject<T, core.$strict>;
    export function looseObject<T extends core.$ZodLooseShape>(
      shape: T,
      params?: string | core.$ZodObjectParams
    ): ZodObject<T, core.$loose>;
    export interface ZodUnion<T extends readonly core.$ZodType[] = readonly core.$ZodType[]> extends ZodType {
      _zod: core.$ZodUnionInternals<T>;
      options: T;
    }
    export const ZodUnion: core.$constructor<ZodUnion>;
    export function union<const T extends readonly core.$ZodType[]>(
      options: T,
      params?: string | core.$ZodUnionParams
    ): ZodUnion<T>;
    export interface ZodDiscriminatedUnion<Options extends readonly core.$ZodType[] = readonly core.$ZodType[]>
      extends ZodUnion<Options> {
      _zod: core.$ZodDiscriminatedUnionInternals<Options>;
    }
    export const ZodDiscriminatedUnion: core.$constructor<ZodDiscriminatedUnion>;
    export interface $ZodTypeDiscriminableInternals extends core.$ZodTypeInternals {
      disc: core.util.DiscriminatorMap;
    }
    export interface $ZodTypeDiscriminable extends ZodType {
      _zod: $ZodTypeDiscriminableInternals;
    }
    export function discriminatedUnion<Types extends readonly [$ZodTypeDiscriminable, ...$ZodTypeDiscriminable[]]>(
      discriminator: string,
      options: Types,
      params?: string | core.$ZodDiscriminatedUnionParams
    ): ZodDiscriminatedUnion<Types>;
    export interface ZodIntersection<A extends core.$ZodType = core.$ZodType, B extends core.$ZodType = core.$ZodType>
      extends ZodType {
      _zod: core.$ZodIntersectionInternals<A, B>;
    }
    export const ZodIntersection: core.$constructor<ZodIntersection>;
    export function intersection<T extends core.$ZodType, U extends core.$ZodType>(
      left: T,
      right: U
    ): ZodIntersection<T, U>;
    export interface ZodTuple<
      T extends core.util.TupleItems = core.util.TupleItems,
      Rest extends core.$ZodType | null = core.$ZodType | null
    > extends ZodType {
      _zod: core.$ZodTupleInternals<T, Rest>;
      rest<Rest extends core.$ZodType>(rest: Rest): ZodTuple<T, Rest>;
    }
    export const ZodTuple: core.$constructor<ZodTuple>;
    export function tuple<T extends readonly [core.$ZodType, ...core.$ZodType[]]>(
      items: T,
      params?: string | core.$ZodTupleParams
    ): ZodTuple<T, null>;
    export function tuple<T extends readonly [core.$ZodType, ...core.$ZodType[]], Rest extends core.$ZodType>(
      items: T,
      rest: Rest,
      params?: string | core.$ZodTupleParams
    ): ZodTuple<T, Rest>;
    export function tuple(items: [], params?: string | core.$ZodTupleParams): ZodTuple<[], null>;
    export interface ZodRecord<
      Key extends core.$ZodRecordKey = core.$ZodRecordKey,
      Value extends core.$ZodType = core.$ZodType
    > extends ZodType {
      _zod: core.$ZodRecordInternals<Key, Value>;
      keyType: Key;
      valueType: Value;
    }
    export const ZodRecord: core.$constructor<ZodRecord>;
    export function record<Key extends core.$ZodRecordKey, Value extends core.$ZodType>(
      keyType: Key,
      valueType: Value,
      params?: string | core.$ZodRecordParams
    ): ZodRecord<Key, Value>;
    export function partialRecord<Key extends core.$ZodRecordKey, Value extends core.$ZodType>(
      keyType: Key,
      valueType: Value,
      params?: string | core.$ZodRecordParams
    ): ZodRecord<ZodUnion<[Key, ZodNever]>, Value>;
    export interface ZodMap<Key extends core.$ZodType = core.$ZodType, Value extends core.$ZodType = core.$ZodType>
      extends ZodType {
      _zod: core.$ZodMapInternals<Key, Value>;
      keyType: Key;
      valueType: Value;
    }
    export const ZodMap: core.$constructor<ZodMap>;
    export function map<Key extends core.$ZodType, Value extends core.$ZodType>(
      keyType: Key,
      valueType: Value,
      params?: string | core.$ZodMapParams
    ): ZodMap<Key, Value>;
    export interface ZodSet<T extends core.$ZodType = core.$ZodType> extends ZodType {
      _zod: core.$ZodSetInternals<T>;
      min(minSize: number, params?: string | core.$ZodCheckMinSizeParams): this;
      /** */
      nonempty(params?: string | core.$ZodCheckMinSizeParams): this;
      max(maxSize: number, params?: string | core.$ZodCheckMaxSizeParams): this;
      size(size: number, params?: string | core.$ZodCheckSizeEqualsParams): this;
    }
    export const ZodSet: core.$constructor<ZodSet>;
    export function set<Value extends core.$ZodType>(
      valueType: Value,
      params?: string | core.$ZodSetParams
    ): ZodSet<Value>;
    export interface ZodEnum<T extends core.util.EnumLike = core.util.EnumLike> extends ZodType {
      _zod: core.$ZodEnumInternals<T>;
      enum: T;
      options: Array<T[keyof T]>;
      extract<const U extends readonly (keyof T)[]>(
        values: U,
        params?: string | core.$ZodEnumParams
      ): ZodEnum<core.util.Flatten<Pick<T, U[number]>>>;
      exclude<const U extends readonly (keyof T)[]>(
        values: U,
        params?: string | core.$ZodEnumParams
      ): ZodEnum<core.util.Flatten<Omit<T, U[number]>>>;
    }
    export const ZodEnum: core.$constructor<ZodEnum>;
    function _enum<const T extends readonly string[]>(
      values: T,
      params?: string | core.$ZodEnumParams
    ): ZodEnum<core.util.ToEnum<T[number]>>;
    function _enum<const T extends core.util.EnumLike>(entries: T, params?: string | core.$ZodEnumParams): ZodEnum<T>;
    export { _enum as enum };
    /** @deprecated This API has been merged into `z.enum()`. Use `z.enum()` instead.
     *
     * ```ts
     * enum Colors { red, green, blue }
     * z.enum(Colors);
     * ```
     */
    export function nativeEnum<T extends core.util.EnumLike>(
      entries: T,
      params?: string | core.$ZodEnumParams
    ): ZodEnum<T>;
    export interface ZodLiteral<T extends core.util.Primitive = core.util.Primitive> extends ZodType {
      _zod: core.$ZodLiteralInternals<T>;
      values: Set<T>;
      /** @legacy Use `.values` instead. Accessing this property will throw an error if the literal accepts multiple values. */
      value: T;
    }
    export const ZodLiteral: core.$constructor<ZodLiteral>;
    export function literal<const T extends Array<core.util.Literal>>(
      value: T,
      params?: string | core.$ZodLiteralParams
    ): ZodLiteral<T[number]>;
    export function literal<const T extends core.util.Literal>(
      value: T,
      params?: string | core.$ZodLiteralParams
    ): ZodLiteral<T>;
    export interface ZodFile extends ZodType {
      _zod: core.$ZodFileInternals;
      min(size: number, params?: string | core.$ZodCheckMinSizeParams): this;
      max(size: number, params?: string | core.$ZodCheckMaxSizeParams): this;
      mime(types: Array<core.util.MimeTypes>, params?: string | core.$ZodCheckMimeTypeParams): this;
    }
    export const ZodFile: core.$constructor<ZodFile>;
    export function file(params?: string | core.$ZodFileParams): ZodFile;
    export interface ZodTransform<O = unknown, I = unknown> extends ZodType {
      _zod: core.$ZodTransformInternals<O, I>;
    }
    export const ZodTransform: core.$constructor<ZodTransform>;
    export function transform<I = unknown, O = I>(
      fn: (input: I, ctx: core.ParsePayload) => O
    ): ZodTransform<Awaited<O>, I>;
    export interface ZodOptional<T extends core.$ZodType = core.$ZodType> extends ZodType {
      _zod: core.$ZodOptionalInternals<T>;
      unwrap(): T;
    }
    export const ZodOptional: core.$constructor<ZodOptional>;
    export function optional<T extends core.$ZodType>(innerType: T): ZodOptional<T>;
    export interface ZodNullable<T extends core.$ZodType = core.$ZodType> extends ZodType {
      _zod: core.$ZodNullableInternals<T>;
      unwrap(): T;
    }
    export const ZodNullable: core.$constructor<ZodNullable>;
    export function nullable<T extends core.$ZodType>(innerType: T): ZodNullable<T>;
    export function nullish<T extends core.$ZodType>(innerType: T): ZodOptional<ZodNullable<T>>;
    export interface ZodDefault<T extends core.$ZodType = core.$ZodType> extends ZodType {
      _zod: core.$ZodDefaultInternals<T>;
      unwrap(): T;
      /** @deprecated Use `.unwrap()` instead. */
      removeDefault(): T;
    }
    export const ZodDefault: core.$constructor<ZodDefault>;
    export function _default<T extends core.$ZodType>(
      innerType: T,
      defaultValue: core.util.NoUndefined<core.output<T>> | (() => core.util.NoUndefined<core.output<T>>)
    ): ZodDefault<T>;
    export interface ZodPrefault<T extends core.$ZodType = core.$ZodType> extends ZodType {
      _zod: core.$ZodPrefaultInternals<T>;
      unwrap(): T;
    }
    export const ZodPrefault: core.$constructor<ZodPrefault>;
    export function prefault<T extends core.$ZodType>(
      innerType: T,
      defaultValue: core.input<T> | (() => core.input<T>)
    ): ZodPrefault<T>;
    export interface ZodNonOptional<T extends core.$ZodType = core.$ZodType> extends ZodType {
      _zod: core.$ZodNonOptionalInternals<T>;
      unwrap(): T;
    }
    export const ZodNonOptional: core.$constructor<ZodNonOptional>;
    export function nonoptional<T extends core.$ZodType>(
      innerType: T,
      params?: string | core.$ZodNonOptionalParams
    ): ZodNonOptional<T>;
    export interface ZodSuccess<T extends core.$ZodType = core.$ZodType> extends ZodType {
      _zod: core.$ZodSuccessInternals<T>;
      unwrap(): T;
    }
    export const ZodSuccess: core.$constructor<ZodSuccess>;
    export function success<T extends core.$ZodType>(innerType: T): ZodSuccess<T>;
    export interface ZodCatch<T extends core.$ZodType = core.$ZodType> extends ZodType {
      _zod: core.$ZodCatchInternals<T>;
      unwrap(): T;
      /** @deprecated Use `.unwrap()` instead. */
      removeCatch(): T;
    }
    export const ZodCatch: core.$constructor<ZodCatch>;
    function _catch<T extends core.$ZodType>(
      innerType: T,
      catchValue: core.output<T> | ((ctx: core.$ZodCatchCtx) => core.output<T>)
    ): ZodCatch<T>;
    export { _catch as catch };
    export interface ZodNaN extends ZodType {
      _zod: core.$ZodNaNInternals;
    }
    export const ZodNaN: core.$constructor<ZodNaN>;
    export function nan(params?: string | core.$ZodNaNParams): ZodNaN;
    export interface ZodPipe<A extends core.$ZodType = core.$ZodType, B extends core.$ZodType = core.$ZodType>
      extends ZodType {
      _zod: core.$ZodPipeInternals<A, B>;
      in: A;
      out: B;
    }
    export const ZodPipe: core.$constructor<ZodPipe>;
    export function pipe<
      const A extends core.$ZodType,
      B extends core.$ZodType<unknown, core.output<A>> = core.$ZodType<unknown, core.output<A>>
    >(in_: A, out: B | core.$ZodType<unknown, core.output<A>>): ZodPipe<A, B>;
    export interface ZodReadonly<T extends core.$ZodType = core.$ZodType> extends ZodType {
      _zod: core.$ZodReadonlyInternals<T>;
    }
    export const ZodReadonly: core.$constructor<ZodReadonly>;
    export function readonly<T extends core.$ZodType>(innerType: T): ZodReadonly<T>;
    export interface ZodTemplateLiteral<Template extends string = string> extends ZodType {
      _zod: core.$ZodTemplateLiteralInternals<Template>;
    }
    export const ZodTemplateLiteral: core.$constructor<ZodTemplateLiteral>;
    export function templateLiteral<const Parts extends core.$ZodTemplateLiteralPart[]>(
      parts: Parts,
      params?: string | core.$ZodTemplateLiteralParams
    ): ZodTemplateLiteral<core.$PartsToTemplateLiteral<Parts>>;
    export interface ZodLazy<T extends core.$ZodType = core.$ZodType> extends ZodType {
      _zod: core.$ZodLazyInternals<T>;
      unwrap(): T;
    }
    export const ZodLazy: core.$constructor<ZodLazy>;
    export function lazy<T extends core.$ZodType>(getter: () => T): ZodLazy<T>;
    export interface ZodPromise<T extends core.$ZodType = core.$ZodType> extends ZodType {
      _zod: core.$ZodPromiseInternals<T>;
      unwrap(): T;
    }
    export const ZodPromise: core.$constructor<ZodPromise>;
    export function promise<T extends core.$ZodType>(innerType: T): ZodPromise<T>;
    export interface ZodCustom<O = unknown, I = unknown> extends ZodType {
      _zod: core.$ZodCustomInternals<O, I>;
    }
    export const ZodCustom: core.$constructor<ZodCustom>;
    export function check<O = unknown>(fn: core.CheckFn<O>, params?: string | core.$ZodCustomParams): core.$ZodCheck<O>;
    export function custom<O>(
      fn?: (data: unknown) => unknown,
      _params?: string | core.$ZodCustomParams
    ): ZodCustom<O, O>;
    export function refine<T>(
      fn: (arg: NoInfer<T>) => core.util.MaybeAsync<unknown>,
      _params?: string | core.$ZodCustomParams
    ): core.$ZodCheck<T>;
    export function superRefine<T>(
      fn: (arg: T, payload: RefinementCtx<T>) => void | Promise<void>,
      params?: string | core.$ZodCustomParams
    ): core.$ZodCheck<T>;
    type ZodInstanceOfParams = core.Params<
      ZodCustom,
      core.$ZodIssueCustom,
      'type' | 'check' | 'checks' | 'fn' | 'abort' | 'error' | 'params' | 'path'
    >;
    function _instanceof<T extends typeof core.util.Class>(
      cls: T,
      params?: ZodInstanceOfParams
    ): ZodCustom<InstanceType<T>, InstanceType<T>>;
    export { _instanceof as instanceof };
    export const stringbool: (_params?: string | core.$ZodStringBoolParams) => ZodPipe<ZodUnknown, ZodBoolean>;
    export type ZodJSONSchema = ZodUnion<
      [ZodString, ZodNumber, ZodBoolean, ZodNull, ZodArray<ZodJSONSchema>, ZodRecord<ZodString, ZodJSONSchema>]
    > & {
      _zod: {
        input: core.util.JSONType;
        output: core.util.JSONType;
      };
    };
    export function json(params?: string | core.$ZodCustomParams): ZodJSONSchema;
    export function preprocess<A, U extends core.$ZodType>(
      fn: (arg: unknown, ctx: RefinementCtx) => A,
      schema: U
    ): ZodPipe<ZodTransform<A, unknown>, U>;
  }
  export import RefinementCtx = schemas.RefinementCtx;
  export import ZodType = schemas.ZodType;
  export import _ZodString = schemas._ZodString;
  export import ZodString = schemas.ZodString;
  export import string = schemas.string;
  export import ZodStringFormat = schemas.ZodStringFormat;
  export import ZodEmail = schemas.ZodEmail;
  export import email = schemas.email;
  export import ZodGUID = schemas.ZodGUID;
  export import guid = schemas.guid;
  export import ZodUUID = schemas.ZodUUID;
  export import uuid = schemas.uuid;
  export import uuidv4 = schemas.uuidv4;
  export import uuidv6 = schemas.uuidv6;
  export import uuidv7 = schemas.uuidv7;
  export import ZodURL = schemas.ZodURL;
  export import url = schemas.url;
  export import ZodEmoji = schemas.ZodEmoji;
  export import emoji = schemas.emoji;
  export import ZodNanoID = schemas.ZodNanoID;
  export import nanoid = schemas.nanoid;
  export import ZodCUID = schemas.ZodCUID;
  export import cuid = schemas.cuid;
  export import ZodCUID2 = schemas.ZodCUID2;
  export import cuid2 = schemas.cuid2;
  export import ZodULID = schemas.ZodULID;
  export import ulid = schemas.ulid;
  export import ZodXID = schemas.ZodXID;
  export import xid = schemas.xid;
  export import ZodKSUID = schemas.ZodKSUID;
  export import ksuid = schemas.ksuid;
  export import ZodIPv4 = schemas.ZodIPv4;
  export import ipv4 = schemas.ipv4;
  export import ZodIPv6 = schemas.ZodIPv6;
  export import ipv6 = schemas.ipv6;
  export import ZodCIDRv4 = schemas.ZodCIDRv4;
  export import cidrv4 = schemas.cidrv4;
  export import ZodCIDRv6 = schemas.ZodCIDRv6;
  export import cidrv6 = schemas.cidrv6;
  export import ZodBase64 = schemas.ZodBase64;
  export import base64 = schemas.base64;
  export import ZodBase64URL = schemas.ZodBase64URL;
  export import base64url = schemas.base64url;
  export import ZodE164 = schemas.ZodE164;
  export import e164 = schemas.e164;
  export import ZodJWT = schemas.ZodJWT;
  export import jwt = schemas.jwt;
  export import _ZodNumber = schemas._ZodNumber;
  export import ZodNumber = schemas.ZodNumber;
  export import number = schemas.number;
  export import ZodNumberFormat = schemas.ZodNumberFormat;
  export import ZodInt = schemas.ZodInt;
  export import int = schemas.int;
  export import ZodFloat32 = schemas.ZodFloat32;
  export import float32 = schemas.float32;
  export import ZodFloat64 = schemas.ZodFloat64;
  export import float64 = schemas.float64;
  export import ZodInt32 = schemas.ZodInt32;
  export import int32 = schemas.int32;
  export import ZodUInt32 = schemas.ZodUInt32;
  export import uint32 = schemas.uint32;
  export import _ZodBoolean = schemas._ZodBoolean;
  export import ZodBoolean = schemas.ZodBoolean;
  export import boolean = schemas.boolean;
  export import _ZodBigInt = schemas._ZodBigInt;
  export import ZodBigInt = schemas.ZodBigInt;
  export import bigint = schemas.bigint;
  export import ZodBigIntFormat = schemas.ZodBigIntFormat;
  export import int64 = schemas.int64;
  export import uint64 = schemas.uint64;
  export import ZodSymbol = schemas.ZodSymbol;
  export import symbol = schemas.symbol;
  export import ZodUndefined = schemas.ZodUndefined;
  export import undefined = schemas.undefined;
  export import ZodNull = schemas.ZodNull;
  export import ZodAny = schemas.ZodAny;
  export import any = schemas.any;
  export import ZodUnknown = schemas.ZodUnknown;
  export import unknown = schemas.unknown;
  export import ZodNever = schemas.ZodNever;
  export import never = schemas.never;
  export import ZodVoid = schemas.ZodVoid;
  export import _ZodDate = schemas._ZodDate;
  export import ZodDate = schemas.ZodDate;
  export import date = schemas.date;
  export import ZodArray = schemas.ZodArray;
  export import array = schemas.array;
  export import keyof = schemas.keyof;
  export import ZodObject = schemas.ZodObject;
  export import object = schemas.object;
  export import strictObject = schemas.strictObject;
  export import looseObject = schemas.looseObject;
  export import ZodUnion = schemas.ZodUnion;
  export import union = schemas.union;
  export import ZodDiscriminatedUnion = schemas.ZodDiscriminatedUnion;
  export import $ZodTypeDiscriminableInternals = schemas.$ZodTypeDiscriminableInternals;
  export import $ZodTypeDiscriminable = schemas.$ZodTypeDiscriminable;
  export import discriminatedUnion = schemas.discriminatedUnion;
  export import ZodIntersection = schemas.ZodIntersection;
  export import intersection = schemas.intersection;
  export import ZodTuple = schemas.ZodTuple;
  export import tuple = schemas.tuple;
  export import ZodRecord = schemas.ZodRecord;
  export import record = schemas.record;
  export import partialRecord = schemas.partialRecord;
  export import ZodMap = schemas.ZodMap;
  export import map = schemas.map;
  export import ZodSet = schemas.ZodSet;
  export import set = schemas.set;
  export import ZodEnum = schemas.ZodEnum;
  export import nativeEnum = schemas.nativeEnum;
  export import ZodLiteral = schemas.ZodLiteral;
  export import literal = schemas.literal;
  export import ZodFile = schemas.ZodFile;
  export import file = schemas.file;
  export import ZodTransform = schemas.ZodTransform;
  export import transform = schemas.transform;
  export import ZodOptional = schemas.ZodOptional;
  export import optional = schemas.optional;
  export import ZodNullable = schemas.ZodNullable;
  export import nullable = schemas.nullable;
  export import nullish = schemas.nullish;
  export import ZodDefault = schemas.ZodDefault;
  export import ZodPrefault = schemas.ZodPrefault;
  export import prefault = schemas.prefault;
  export import ZodNonOptional = schemas.ZodNonOptional;
  export import nonoptional = schemas.nonoptional;
  export import ZodSuccess = schemas.ZodSuccess;
  export import success = schemas.success;
  export import ZodCatch = schemas.ZodCatch;
  export import ZodNaN = schemas.ZodNaN;
  export import nan = schemas.nan;
  export import ZodPipe = schemas.ZodPipe;
  export import pipe = schemas.pipe;
  export import ZodReadonly = schemas.ZodReadonly;
  export import readonly = schemas.readonly;
  export import ZodTemplateLiteral = schemas.ZodTemplateLiteral;
  export import templateLiteral = schemas.templateLiteral;
  export import ZodLazy = schemas.ZodLazy;
  export import lazy = schemas.lazy;
  export import ZodPromise = schemas.ZodPromise;
  export import promise = schemas.promise;
  export import ZodCustom = schemas.ZodCustom;
  export import check = schemas.check;
  export import custom = schemas.custom;
  export import refine = schemas.refine;
  export import superRefine = schemas.superRefine;
  export import stringbool = schemas.stringbool;
  export import ZodJSONSchema = schemas.ZodJSONSchema;
  export import json = schemas.json;
  export import preprocess = schemas.preprocess;
  export import _default = schemas._default;

  const null_: typeof schemas.null;
  const void_: typeof schemas.void;
  const enum_: typeof schemas.enum;
  const catch_: typeof schemas.catch;
  const instanceof_: typeof schemas.instanceof;

  export { null_ as null, void_ as void, enum_ as enum, catch_ as catch, instanceof_ as instanceof };

  // CHECKS

  export import lt = core._lt;
  export import lte = core._lte;
  export import gt = core._gt;
  export import gte = core._gte;
  export import positive = core._positive;
  export import negative = core._negative;
  export import nonpositive = core._nonpositive;
  export import nonnegative = core._nonnegative;
  export import multipleOf = core._multipleOf;
  export import maxSize = core._maxSize;
  export import minSize = core._minSize;
  export import size = core._size;
  export import maxLength = core._maxLength;
  export import minLength = core._minLength;
  export import length = core._length;
  export import regex = core._regex;
  export import lowercase = core._lowercase;
  export import uppercase = core._uppercase;
  export import includes = core._includes;
  export import startsWith = core._startsWith;
  export import endsWith = core._endsWith;
  export import property = core._property;
  export import mime = core._mime;
  export import overwrite = core._overwrite;
  export import normalize = core._normalize;
  export import trim = core._trim;
  export import toLowerCase = core._toLowerCase;
  export import toUpperCase = core._toUpperCase;

  // ERRORS

  /** @deprecated Use `z.core.$ZodIssue` from `@zod/core` instead, especially if you are building a library on top of Zod. */
  export type ZodIssue = core.$ZodIssue;
  /** An Error-like class used to store Zod validation issues.  */
  export interface ZodError<T = unknown> extends core.$ZodError<T> {
    /** @deprecated Use the `z.treeifyError(err)` function instead. */
    format(): core.$ZodFormattedError<T>;
    format<U>(mapper: (issue: core.$ZodIssue) => U): core.$ZodFormattedError<T, U>;
    /** @deprecated Use the `z.treeifyError(err)` function instead. */
    flatten(): core.$ZodFlattenedError<T>;
    flatten<U>(mapper: (issue: core.$ZodIssue) => U): core.$ZodFlattenedError<T, U>;
    /** @deprecated Push directly to `.issues` instead. */
    addIssue(issue: core.$ZodIssue): void;
    /** @deprecated Push directly to `.issues` instead. */
    addIssues(issues: core.$ZodIssue[]): void;
    /** @deprecated Check `err.issues.length === 0` instead. */
    isEmpty: boolean;
  }

  export const ZodError: core.$constructor<ZodError>;

  export const ZodRealError: core.$constructor<ZodError>;

  /** @deprecated Use `z.core.$ZodFlattenedError` instead. */
  export import ZodFlattenedError = core.$ZodFlattenedError;

  /** @deprecated Use `z.core.$ZodFormattedError` instead. */
  export import ZodFormattedError = core.$ZodFormattedError;

  /** @deprecated Use `z.core.$ZodErrorMap` instead. */
  export import ZodErrorMap = core.$ZodErrorMap;

  /** @deprecated Use `z.core.$ZodRawIssue` instead. */
  export type IssueData = core.$ZodRawIssue;

  export type ZodSafeParseResult<T> = ZodSafeParseSuccess<T> | ZodSafeParseError<T>;
  export type ZodSafeParseSuccess<T> = {
    success: true;
    data: T;
    error?: never;
  };
  export type ZodSafeParseError<T> = {
    success: false;
    data?: never;
    error: ZodError<T>;
  };
  export const parse: <T extends core.$ZodType>(
    schema: T,
    value: unknown,
    _ctx?: core.ParseContext<core.$ZodIssue>,
    _params?: {
      callee?: core.util.AnyFunc;
      Err?: core.$ZodErrorClass;
    }
  ) => core.output<T>;
  export const parseAsync: <T extends core.$ZodType>(
    schema: T,
    value: unknown,
    _ctx?: core.ParseContext<core.$ZodIssue>,
    _params?: {
      callee?: core.util.AnyFunc;
      Err?: core.$ZodErrorClass;
    }
  ) => Promise<core.output<T>>;
  export const safeParse: <T extends core.$ZodType>(
    schema: T,
    value: unknown,
    _ctx?: core.ParseContext<core.$ZodIssue>
  ) => ZodSafeParseResult<core.output<T>>;
  export const safeParseAsync: <T extends core.$ZodType>(
    schema: T,
    value: unknown,
    _ctx?: core.ParseContext<core.$ZodIssue>
  ) => Promise<ZodSafeParseResult<core.output<T>>>;

  // COMPAT

  /** @deprecated Use `z.output<T>` instead. */
  export import TypeOf = core.output;

  /** @deprecated Use `z.output<T>` instead. */
  export import Infer = core.output;

  /** @deprecated Use `z.core.$$ZodFirstPartyTypes` instead */
  export import ZodFirstPartySchemaTypes = core.$ZodTypes;

  /** @deprecated Use the raw string literal codes instead, e.g. "invalid_type". */
  export const ZodIssueCode: {
    readonly invalid_type: 'invalid_type';
    readonly too_big: 'too_big';
    readonly too_small: 'too_small';
    readonly invalid_format: 'invalid_format';
    readonly not_multiple_of: 'not_multiple_of';
    readonly unrecognized_keys: 'unrecognized_keys';
    readonly invalid_union: 'invalid_union';
    readonly invalid_key: 'invalid_key';
    readonly invalid_element: 'invalid_element';
    readonly invalid_value: 'invalid_value';
    readonly custom: 'custom';
  };
  /** A special constant with type `never` */
  export const NEVER: never;
  /** @deprecated Use `z.$ZodFlattenedError` */
  export type inferFlattenedErrors<T extends core.$ZodType, U = string> = core.$ZodFlattenedError<core.output<T>, U>;
  /** @deprecated Use `z.$ZodFormattedError` */
  export type inferFormattedError<T extends core.$ZodType<any, any>, U = string> = core.$ZodFormattedError<
    core.output<T>,
    U
  >;
  /** Use `z.$brand` instead */
  export type BRAND<T extends string | number | symbol = string | number | symbol> = {
    [core.$brand]: {
      [k in T]: true;
    };
  };

  /** @deprecated Use `z.config(params)` instead. */
  export function setErrorMap(map: core.$ZodErrorMap): void;
  /** @deprecated Use `z.config()` instead. */
  export function getErrorMap(): core.$ZodErrorMap<core.$ZodIssue> | undefined;
  export type {
    /** @deprecated Use z.ZodType (without generics) instead. */
    ZodType as ZodTypeAny,
    /** @deprecated Use `z.ZodType` */
    ZodType as ZodSchema,
    /** @deprecated Use `z.ZodType` */
    ZodType as Schema
  };
  export type ZodRawShape = core.$ZodShape;

  // ISO

  export namespace iso {
    export interface ZodISODateTime extends schemas.ZodStringFormat {
      _zod: core.$ZodISODateTimeInternals;
    }
    export const ZodISODateTime: core.$constructor<ZodISODateTime>;
    export function datetime(params?: string | core.$ZodISODateTimeParams): ZodISODateTime;
    export interface ZodISODate extends schemas.ZodStringFormat {
      _zod: core.$ZodISODateInternals;
    }
    export const ZodISODate: core.$constructor<ZodISODate>;
    export function date(params?: string | core.$ZodISODateParams): ZodISODate;
    export interface ZodISOTime extends schemas.ZodStringFormat {
      _zod: core.$ZodISOTimeInternals;
    }
    export const ZodISOTime: core.$constructor<ZodISOTime>;
    export function time(params?: string | core.$ZodISOTimeParams): ZodISOTime;
    export interface ZodISODuration extends schemas.ZodStringFormat {
      _zod: core.$ZodISODurationInternals;
    }
    export const ZodISODuration: core.$constructor<ZodISODuration>;
    export function duration(params?: string | core.$ZodISODurationParams): ZodISODuration;
  }

  // COERCE

  export namespace coerce {
    export interface ZodCoercedString<T = unknown> extends schemas._ZodString<T> {}
    export function string<T = unknown>(params?: string | core.$ZodStringParams): ZodCoercedString<T>;
    export interface ZodCoercedNumber<T = unknown> extends schemas._ZodNumber<T> {}
    export function number<T = unknown>(params?: string | core.$ZodNumberParams): ZodCoercedNumber<T>;
    export interface ZodCoercedBoolean<T = unknown> extends schemas._ZodBoolean<T> {}
    export function boolean<T = unknown>(params?: string | core.$ZodBooleanParams): ZodCoercedBoolean<T>;
    export interface ZodCoercedBigInt<T = unknown> extends schemas._ZodBigInt<T> {}
    export function bigint<T = unknown>(params?: string | core.$ZodBigIntParams): ZodCoercedBigInt<T>;
    export interface ZodCoercedDate<T = unknown> extends schemas._ZodDate<T> {}
    export function date<T = unknown>(params?: string | core.$ZodDateParams): ZodCoercedDate<T>;
  }

  // OWN EXPORTS

  export import infer = core.infer;
  export import output = core.output;
  export import input = core.input;

  export import globalRegistry = core.globalRegistry;
  export import GlobalMeta = core.globalRegistry;
  export import registry = core.registry;
  export import config = core.config;
  export import $output = core.$output;
  export import $input = core.$input;
  export import $brand = core.$brand;
  export import clone = core.clone;
  export import regexes = core.regexes;
  export import treeifyError = core.treeifyError;
  export import prettifyError = core.prettifyError;
  export import formatError = core.formatError;
  export import flattenError = core.flattenError;
  export import toJSONSchema = core.toJSONSchema;
  export import locales = core.locales;

  const __function: typeof core.function;
  export { __function as function };
}

export default z;
