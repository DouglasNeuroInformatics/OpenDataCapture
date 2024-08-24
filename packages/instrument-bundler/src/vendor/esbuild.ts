if (typeof window === 'undefined') {
  var { build, transform } = await import('esbuild');
} else {
  var { build, transform } = await import('esbuild-wasm');
}

export { build, transform };
export type { BuildFailure, BuildResult, Loader, Location, Message, Plugin } from 'esbuild';
