import type { Config } from './schemas.js';

type ExportCondition = 'default' | 'import' | 'types';

type PackageExport = {
  [K in ExportCondition]?: string;
};

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

export type { EntryPoint, ExportCondition, PackageExport, ResolvedPackage };
