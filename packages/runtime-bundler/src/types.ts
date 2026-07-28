import type { Config } from './schemas.js';

type ExportCondition = 'default' | 'import' | 'types';

/** An export declared with conditions: an ES module bundled into the shared module graph. */
type ModuleExport = {
  [K in ExportCondition]?: string;
};

/**
 * An export declared as a bare path: a static asset (classic script, stylesheet, html)
 * emitted byte-for-byte, never bundled — classic scripts cannot carry chunk imports.
 */
type AssetExport = {
  copy: string;
};

type PackageExport = AssetExport | ModuleExport;

type ResolvedPackage = {
  exports: {
    [key: string]: PackageExport;
  };
  name: string;
  packageJsonPath: string;
  packageRoot: string;
};

type EntryPoint = {
  in: string;
  out: string;
};

export type BundlerOptions = Config & { configFilepath: string };

export type { AssetExport, EntryPoint, ExportCondition, ModuleExport, PackageExport, ResolvedPackage };
