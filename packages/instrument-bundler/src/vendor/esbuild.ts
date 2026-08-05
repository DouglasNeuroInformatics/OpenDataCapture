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

/**
 * The exports below are assigned by a side effect, so this file must stay listed in the `sideEffects`
 * field of package.json: a bundler permitted to treat it as pure drops the assignments while inlining
 * the imports of it, leaving consumers with a bare `ReferenceError: build is not defined` at runtime.
 */
if (typeof window === 'undefined') {
  var { build, transform } = await import('esbuild');
} else {
  var { build, transform } = await import('esbuild-wasm');
}

export { build, transform };
export type { BuildFailure, BuildResult, Loader, Location, Message, Plugin } from 'esbuild';
