let esbuild: typeof import('esbuild');
if (typeof window === 'undefined') {
  ({ default: esbuild } = await import('esbuild'));
} else {
  ({ default: esbuild } = await import('esbuild-wasm'));
}

export default esbuild;

export type * from 'esbuild';
