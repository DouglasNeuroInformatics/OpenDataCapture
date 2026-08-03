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

// The bindings must be initialized by their own declaration, not by a detached `if`/`else`.
// This package declares `sideEffects: ['**/cli.ts']`, so a bundler is free to drop a
// standalone statement here, which silently leaves `build` undeclared in the output.
const { build, transform } = typeof window === 'undefined' ? await import('esbuild') : await import('esbuild-wasm');

export { build, transform };
export type { BuildFailure, BuildResult, Loader, Location, Message, Plugin } from 'esbuild';
