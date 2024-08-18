import type { Config } from './schemas.js';

type PackageExport = {
  import?: string;
  types?: string;
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

export type BundlerOptions = { configFilepath: string } & Config;

export type { EntryPoint, PackageExport, ResolvedPackage };
