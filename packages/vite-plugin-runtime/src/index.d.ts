import type { PluginOption } from 'vite';

export type RuntimeManifest = {
  declarations: string[];
  sources: string[];
  styles: string[];
};

export type RuntimeVersionInfo = {
  baseDir: string;
  importPaths: string[];
  manifest: RuntimeManifest;
  version: string;
};

export declare function runtime(options?: { disabled?: boolean; packageRoot?: string }): PluginOption;
