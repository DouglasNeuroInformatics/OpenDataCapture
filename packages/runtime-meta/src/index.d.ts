/** Contains the relative paths of assets for a given runtime version. */
export type RuntimeManifest = {
  /** Relative paths to TypeScript declaration files (.d.ts). */
  declarations: string[];
  /** Relative paths to HTML files (.html). */
  html: string[];
  /** Relative paths to JavaScript source files (.js). */
  sources: string[];
  /** Relative paths to CSS stylesheets (.css). */
  styles: string[];
};

/**
 * Metadata for a given runtime version.
 *
 * @example
 * {
 *   baseDir: "/root/OpenDataCapture/runtime/v1/dist",
 *   importPaths: [
 *     "/runtime/v1/@opendatacapture/runtime-core/index.js",
 *     ...
 *   ],
 *   manifest: {
 *     declarations: [
 *       "@opendatacapture/runtime-core/index.d.ts",
 *       ...
 *     ],
 *     html: [],
 *     sources: [
 *       "@opendatacapture/runtime-core/index.js",
 *       ...
 *     ],
 *     styles: [
 *       "normalize.css@8.x/normalize.css",
 *       ...
 *     ]
 *   }
 * }
 * */
export type RuntimeVersionMetadata = {
  /** Absolute path to the root directory where runtime files are located. */
  baseDir: string;
  /** List of fully-qualified import paths available at runtime. */
  importPaths: string[];
  /** Manifest containing relative paths to declarations, html, sources, and styles. */
  manifest: RuntimeManifest;
};

export type RuntimeMetadataMap = Map<string, RuntimeVersionMetadata>;

export type RuntimeOptions = {
  disabled?: boolean;
  rootDir: string;
};

/** Name of the manifest JSON file (e.g., `"runtime.json"`). */
export declare const MANIFEST_FILENAME: string;

/**
 * Generate the `RuntimeManifest` from a given directory.
 * @param baseDir Absolute path of the base runtime directory.
 */
export declare function generateManifest(baseDir: string): Promise<RuntimeManifest>;

/**
 * Generate metadata for all available runtime versions.
 * @returns A Map keyed by version name, with corresponding metadata.
 */
export declare function generateMetadata(options: { rootDir: string }): Promise<RuntimeMetadataMap>;

export declare function resolveRuntimeAsset(
  url: string | undefined,
  metadata: RuntimeMetadataMap
): Promise<null | { content: string; contentType: string }>;
