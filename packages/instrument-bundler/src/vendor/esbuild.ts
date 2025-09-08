/* eslint-disable no-var */

declare module 'esbuild' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/consistent-type-definitions
  export interface BuildResult<ProvidedOptions extends BuildOptions = BuildOptions> {
    legacyScripts?: string[];
  }
}

declare module 'esbuild-wasm' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/consistent-type-definitions
  export interface BuildResult<ProvidedOptions extends BuildOptions = BuildOptions> {
    legacyScripts?: string[];
  }
}

if (typeof window === 'undefined') {
  var { build, transform } = await import('esbuild');
} else {
  var { build, transform } = await import('esbuild-wasm');
}

export { build, transform };
export type { BuildFailure, BuildResult, Loader, Location, Message, Plugin } from 'esbuild';
