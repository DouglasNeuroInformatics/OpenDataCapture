import type { Plugin } from 'esbuild';

export const transformRuntimeImportsPlugin = (): Plugin => {
  const filter = /^\/runtime\//;
  return {
    name: 'runtime-import',
    setup(build) {
      build.onResolve({ filter }, (args) => {
        return {
          external: true,
          path: args.path.replace(filter, './runtime/')
        };
      });
    }
  };
};
