/* eslint-disable @typescript-eslint/consistent-type-definitions */
declare namespace Papa {
  /**
   * Parse local files
   * @param file a File object obtained from the DOM.
   * @param config a config object which contains a callback.
   * @returns Doesn't return anything. Results are provided asynchronously to a callback function.
   */
  export function parse<T, TFile extends LocalFile = LocalFile>(file: TFile, config: ParseLocalConfig<T, TFile>): void;
  /**
   * Parse remote files
   * @param url the path or URL to the file to download.
   * @param config a config object.
   * @returns Doesn't return anything. Results are provided asynchronously to a callback function.
   */
  export function parse<T>(url: string, config: ParseRemoteConfig<T>): void;
  /**
   * Parse string in web worker
   * @param csvString a string of delimited text to be parsed.
   * @param config an optional config object.
   * @returns Doesn't return anything. Results are provided asynchronously to a callback function.
   */
  // tslint:disable-next-line:unified-signatures
  export function parse<T>(csvString: string, config: { download?: false | undefined } & ParseWorkerConfig<T>): void;
  /**
   * Parse string
   * @param csvString a string of delimited text to be parsed.
   * @param config an optional config object.
   * @returns a parse results object
   */
  export function parse<T>(
    csvString: string,
    config?: { download?: false | undefined; worker?: false | undefined } & ParseConfig<T>
  ): ParseResult<T>;
  /**
   * Parse string, remote files or  local files
   * @param source data to be parsed.
   * @param config a config object.
   * @returns Doesn't return anything. Results are provided asynchronously to a callback function.
   */
  export function parse<T>(
    source: LocalFile | string,
    config: (
      | ({ download?: false | undefined } & ParseWorkerConfig<T>)
      | ({ download?: false | undefined; worker?: false | undefined } & ParseConfig<T>)
      | ParseRemoteConfig<T>
    ) &
      ParseLocalConfig<T, LocalFile>
  ): void;

  /**
   * Unparses javascript data objects and returns a csv string
   * @param data can be one of: An array of arrays; An array of objects; An object explicitly defining `fields` and `data`
   * @param config an optional config object
   */
  export function unparse<T>(data: T[] | UnparseObject<T>, config?: UnparseConfig): string;

  /**
   * Read-Only Properties
   */

  /** An array of characters that are not allowed as delimiters. `\r`, `\n`, `"`, `\ufeff` */
  export const BAD_DELIMITERS: readonly string[];

  /** The true delimiter. Invisible. ASCII code 30. Should be doing the job we strangely rely upon commas and tabs for. */
  export const RECORD_SEP: '\x1E';

  /** Also sometimes used as a delimiting character. ASCII code 31. */
  export const UNIT_SEP: '\x1F';
  /**
   * Whether or not the browser supports HTML5 Web Workers.
   * If false, `worker: true` will have no effect.
   */
  export const WORKERS_SUPPORTED: boolean;

  /**
   * Configurable Properties
   */

  /**
   * The size in bytes of each file chunk. Used when streaming files obtained from the DOM that exist on the local computer. Default 10 MB.
   * @default 10485760
   */
  export let LocalChunkSize: number;

  /**
   * Same as `LocalChunkSize`, but for downloading files from remote locations. Default 5 MB.
   * @default 5242880
   */
  export let RemoteChunkSize: number;

  /**
   * The delimiter used when it is left unspecified and cannot be detected automatically. Default is comma.
   * @default ','
   */
  export let DefaultDelimiter: string;

  /**
   * On Papa there are actually more classes exposed
   * but none of them are officially documented
   * Since we can interact with the Parser from one of the callbacks
   * I have included the API for this class.
   */
  export class Parser {
    constructor(config: ParseConfig);
    abort(): void;
    getCharIndex(): number;
    parse(input: string, baseIndex: number, ignoreLastRow: boolean): any;
    pause(): void;
    resume(): void;
  }
  /** File object */
  export type LocalFile = File;

  export interface ParseConfig<T = any, TInput = undefined> {
    beforeFirstChunk?(chunk: string): string | void;
    /**
     * A string that indicates a comment (for example, "#" or "//").
     * When Papa encounters a line starting with this string, it will skip the line.
     * @default false
     */
    comments?: false | string | undefined;
    /**
     * The callback to execute when parsing is complete.
     * It receives the parse results. If parsing a local file, the File is passed in, too.
     * When streaming, parse results are not available in this callback.
     */
    complete?(results: ParseResult<T>, file: TInput): void;
    /**
     * The delimiting character.
     * Leave blank to auto-detect from a list of most common delimiters, or any values passed in through `delimitersToGuess`.
     * It can be a string or a function.
     * If a string, it can be of any length (so multi-character delimiters are supported).
     * If a function, it must accept the input as first parameter and it must return a string which will be used as delimiter.
     * In both cases it cannot be found in `Papa.BAD_DELIMITERS`.
     * @default // auto-detect
     */
    delimiter?: ((input: string) => string) | string | undefined;
    /**
     * An array of delimiters to guess from if the delimiter option is not set.
     * @default [',', '\t', '|', ';', Papa.RECORD_SEP, Papa.UNIT_SEP]
     */
    delimitersToGuess?: string[] | undefined;
    /**
     * If `true`, numeric and boolean data will be converted to their type instead of remaining strings.
     * Numeric data must conform to the definition of a decimal literal.
     * Numerical values greater than 2^53 or less than -2^53 will not be converted to numbers to preserve precision.
     * European-formatted numbers must have commas and dots swapped.
     * If also accepts an object or a function.
     * If object it's values should be a boolean to indicate if dynamic typing should be applied for each column number (or header name if using headers).
     * If it's a function, it should return a boolean value for each field number (or name if using headers) which will be passed as first argument.
     * @default false
     */
    dynamicTyping?:
      | ((field: number | string) => boolean)
      | { [columnNumber: number]: boolean; [headerName: string]: boolean }
      | boolean
      | undefined;
    /**
     * The character used to escape the quote character within a field.
     * If not set, this option will default to the value of `quoteChar`,
     * meaning that the default escaping of quote character within a quoted field is using the quote character two times.
     * (e.g. `"column with ""quotes"" in text"`)
     * @default '"'
     */
    escapeChar?: string | undefined;
    /**
     * Fast mode speeds up parsing significantly for large inputs.
     * However, it only works when the input has no quoted fields.
     * Fast mode will automatically be enabled if no " characters appear in the input.
     * You can force fast mode either way by setting it to true or false.
     */
    fastMode?: boolean | undefined;
    /**
     * If `true`, the first row of parsed data will be interpreted as field names.
     * An array of field names will be returned in meta, and each row of data will be an object of values keyed by field name instead of a simple array.
     * Rows with a different number of fields from the header row will produce an error.
     * Warning: Duplicate field names will overwrite values in previous fields having the same name.
     * @default false
     */
    header?: boolean | undefined;
    /**
     * The newline sequence. Leave blank to auto-detect. Must be one of `\r`, `\n`, or `\r\n`.
     * @default // auto-detect
     */
    newline?: '\n' | '\r' | '\r\n' | undefined;
    /** If > 0, only that many rows will be parsed. */
    preview?: number | undefined;
    /**
     * The character used to quote fields. The quoting of all fields is not mandatory. Any field which is not quoted will correctly read.
     * @default '"'
     */
    quoteChar?: string | undefined;
    /**
     * If `true`, lines that are completely empty (those which evaluate to an empty string) will be skipped.
     * If set to `'greedy'`, lines that don't have any content (those which have only whitespace after parsing) will also be skipped.
     * @default false
     */
    skipEmptyLines?: 'greedy' | boolean | undefined;
    /**
     * To stream the input, define a callback function.
     * Streaming is necessary for large files which would otherwise crash the browser.
     * You can call parser.abort() to abort parsing.
     * And, except when using a Web Worker, you can call parser.pause() to pause it, and parser.resume() to resume.
     */
    step?(results: ParseStepResult<T>, parser: Parser): void;
    /**
     * A function to apply on each value.
     * The function receives the value as its first argument and the column number or header name when enabled as its second argument.
     * The return value of the function will replace the value it received.
     * The transform function is applied before `dynamicTyping`.
     */
    transform?(value: string, field: number | string): any;
    /**
     * A function to execute before parsing the first chunk.
     * Can be used with chunk or step streaming modes.
     * The function receives as an argument the chunk about to be parsed, and it may return a modified chunk to parse.
     * This is useful for stripping header lines (as long as the header fits in a single chunk).
     */
    /**
     * A function to apply on each header. Requires header to be true. The function receives the header as its first argument and the index as second.
     */
    transformHeader?(header: string, index: number): string;
  }

  export interface ParseWorkerConfig<T = any> extends ParseConfig<T> {
    /**
     * The callback to execute when parsing is complete.
     * It receives the parse results. If parsing a local file, the File is passed in, too.
     * When streaming, parse results are not available in this callback.
     */
    complete(results: ParseResult<T>): void;
    /**
     * Whether or not to use a worker thread.
     * Using a worker will keep your page reactive, but may be slightly slower.
     */
    worker: true;
  }

  // Base interface for all async parsing
  interface ParseAsyncConfigBase<T = any, TInput = undefined> extends ParseConfig<T, TInput> {
    /**
     * A callback function, identical to `step`, which activates streaming.
     * However, this function is executed after every chunk of the file is loaded and parsed rather than every row.
     * Works only with local and remote files.
     * Do not use both `chunk` and `step` callbacks together.
     */
    chunk?(results: ParseResult<T>, parser: Parser): void;
    /**
     * Overrides `Papa.LocalChunkSize` and `Papa.RemoteChunkSize`.
     */
    chunkSize?: number | undefined;
    /**
     * A callback to execute if FileReader encounters an error.
     * The function is passed two arguments: the error and the File.
     */
    error?(error: Error, file: TInput): void;
    /**
     * Whether or not to use a worker thread.
     * Using a worker will keep your page reactive, but may be slightly slower.
     * @default false
     */
    worker?: boolean | undefined;
  }

  // Async parsing local file can specify encoding
  interface ParseLocalConfigBase<T = any, TInput = undefined> extends ParseAsyncConfigBase<T, TInput> {
    /** The encoding to use when opening local files. If specified, it must be a value supported by the FileReader API. */
    encoding?: string | undefined;
  }

  interface ParseLocalConfigStep<T = any, TInput = undefined> extends ParseLocalConfigBase<T, TInput> {
    /** @inheritdoc */
    step(results: ParseStepResult<T>, parser: Parser): void;
  }
  interface ParseLocalConfigNoStep<T = any, TInput = undefined> extends ParseLocalConfigBase<T, TInput> {
    /** @inheritdoc */
    complete(results: ParseResult<T>, file: TInput): void;
  }

  // Local parsing is async and thus must specify either `step` or `complete` (but may specify both)
  export type ParseLocalConfig<T = any, TInput = undefined> =
    | ParseLocalConfigNoStep<T, TInput>
    | ParseLocalConfigStep<T, TInput>;

  // Remote parsing has options for the backing web request
  interface ParseRemoteConfigBase<T = any> extends ParseAsyncConfigBase<T, string> {
    /**
     * This indicates that the string you passed as the first argument to `parse()`
     * is actually a URL from which to download a file and parse its contents.
     */
    download: true;
    /**
     * Use POST request on the URL of the download option. The value passed will be set as the body of the request.
     * @default undefined
     */
    downloadRequestBody?: Blob | BufferSource | FormData | string | undefined | URLSearchParams;
    /**
     * If defined, should be an object that describes the headers.
     * @example { 'Authorization': 'token 123345678901234567890' }
     * @default undefined
     */
    downloadRequestHeaders?: { [headerName: string]: string } | undefined;
    /**
     * A boolean value passed directly into XMLHttpRequest's "withCredentials" property.
     * @default undefined
     */
    withCredentials?: boolean | undefined;
  }

  interface ParseRemoteConfigStep<T = any> extends ParseRemoteConfigBase<T> {
    /** @inheritdoc */
    step(results: ParseStepResult<T>, parser: Parser): void;
  }
  interface ParseRemoteConfigNoStep<T = any> extends ParseRemoteConfigBase<T> {
    /** @inheritdoc */
    complete(results: ParseResult<T>, file: string): void;
  }

  // Remote parsing is async and thus must specify either `step` or `complete` (but may specify both)
  export type ParseRemoteConfig<T = any> = ParseRemoteConfigNoStep<T> | ParseRemoteConfigStep<T>;

  export interface UnparseConfig {
    /**
     * If `data` is an array of objects this option can be used to manually specify the keys (columns) you expect in the objects.
     * If not set the keys of the first objects are used as column.
     * @default undefined
     */
    columns?: string[] | undefined;
    /**
     * The delimiting character. Multi-character delimiters are supported. It must not be found in `Papa.BAD_DELIMITERS`.
     * @default ','
     */
    delimiter?: string | undefined;
    /**
     * The character used to escape `quoteChar` inside field values.
     * @default '"'
     */
    escapeChar?: string | undefined;
    /**
     * If `true`, field values that begin with `=`, `+`, `-`, or `@`,
     * will be prepended with a ` to defend against [injection attacks](https://www.contextis.com/en/blog/comma-separated-vulnerabilities),
     * because Excel and LibreOffice will automatically parse such cells as formulae.
     * @default false
     */
    escapeFormulae?: boolean | RegExp | undefined;
    /**
     * If `false`, will omit the header row.
     * If `data` is an array of arrays this option is ignored.
     * If `data` is an array of objects the keys of the first object are the header row.
     * If `data` is an object with the `keys` fields and `data` the `fields` are the header row.
     * @default true
     */
    header?: boolean | undefined;
    /**
     * The character used to determine newline sequence.
     * @default '\r\n'
     */
    newline?: string | undefined;
    /**
     * The character used to quote fields.
     * @default '"'
     */
    quoteChar?: string | undefined;
    /**
     * If `true`, forces all fields to be enclosed in quotes.
     * If an array of `true`/`false` values, specifies which fields should be force-quoted (first boolean is for the first column, second boolean for the second column, ...).
     * A function that returns a boolean values can be used to determine the quotes value of a cell.
     * This function accepts the cell value and column index as parameters.
     * Note that this option is ignored for `undefined`, `null` and `date-object` values.
     * The option `escapeFormulae` also takes precedence over this.
     *
     * @default false
     */
    quotes?: ((value: any, columnIndex: number) => boolean) | boolean | boolean[] | undefined;
    /**
     * If `true`, lines that are completely empty (those which evaluate to an empty string) will be skipped.
     * If set to `'greedy'`, lines that don't have any content (those which have only whitespace after parsing) will also be skipped.
     * @default false
     */
    skipEmptyLines?: 'greedy' | boolean | undefined;
  }

  export interface UnparseObject<T> {
    data: T[];
    fields: string[];
  }

  /** Error structure */
  export interface ParseError {
    /** Standardized error code */
    code: 'InvalidQuotes' | 'MissingQuotes' | 'TooFewFields' | 'TooManyFields' | 'UndetectableDelimiter';
    /** Index within the row where error is */
    index?: number | undefined;
    /** Human-readable details */
    message: string;
    /** Row index of parsed data where error is */
    row?: number | undefined;
    /** A generalization of the error */
    type: 'Delimiter' | 'FieldMismatch' | 'Quotes';
  }

  export interface ParseMeta {
    /** Whether process was aborted */
    aborted: boolean;
    cursor: number;
    /** Delimiter used */
    delimiter: string;
    /** Array of field names */
    fields?: string[] | undefined;
    /** Line break sequence used */
    linebreak: string;
    /** Whether preview consumed all input */
    truncated: boolean;
  }

  /**
   * A parse result always contains three objects: data, errors, and meta.
   * Data and errors are arrays, and meta is an object. In the step callback, the data array will only contain one element.
   */
  export interface ParseStepResult<T> {
    /**
     * In the step callback, the data array will only contain one element.
     */
    data: T;
    /** an array of errors. */
    errors: ParseError[];
    /**
     * contains extra information about the parse, such as delimiter used,
     * the newline sequence, whether the process was aborted, etc.
     * Properties in this object are not guaranteed to exist in all situations.
     */
    meta: ParseMeta;
  }

  /**
   * A parse result always contains three objects: data, errors, and meta.
   * Data and errors are arrays, and meta is an object. In the step callback, the data array will only contain one element.
   */
  export interface ParseResult<T> {
    /**
     * an array of rows. If header is false, rows are arrays; otherwise they are objects of data keyed by the field name.
     */
    data: T[];
    /** an array of errors. */
    errors: ParseError[];
    /**
     * contains extra information about the parse, such as delimiter used,
     * the newline sequence, whether the process was aborted, etc.
     * Properties in this object are not guaranteed to exist in all situations.
     */
    meta: ParseMeta;
  }
}

export import BAD_DELIMITERS = Papa.BAD_DELIMITERS;
export import DefaultDelimiter = Papa.DefaultDelimiter;
export import LocalChunkSize = Papa.LocalChunkSize;
export import parse = Papa.parse;
export import Parser = Papa.Parser;
export import RECORD_SEP = Papa.RECORD_SEP;
export import RemoteChunkSize = Papa.RemoteChunkSize;
export import UNIT_SEP = Papa.UNIT_SEP;
export import unparse = Papa.unparse;
export import WORKERS_SUPPORTED = Papa.WORKERS_SUPPORTED;

export import LocalFile = Papa.LocalFile;
export import ParseConfig = Papa.ParseConfig;
export import ParseWorkerConfig = Papa.ParseWorkerConfig;
export import ParseLocalConfig = Papa.ParseLocalConfig;
export import ParseRemoteConfig = Papa.ParseRemoteConfig;
export import UnparseConfig = Papa.UnparseConfig;
export import UnparseObject = Papa.UnparseObject;
export import ParseError = Papa.ParseError;
export import ParseMeta = Papa.ParseMeta;
export import ParseStepResult = Papa.ParseStepResult;
export import ParseResult = Papa.ParseResult;

export default Papa;
