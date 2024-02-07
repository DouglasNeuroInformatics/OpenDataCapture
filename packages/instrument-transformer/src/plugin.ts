import path from 'path';

import type { Plugin } from 'esbuild';

export type TransformRuntimeImportsOptions = {
  parent?: string;
};

export const transformRuntimeImportsPlugin = ({ parent }: TransformRuntimeImportsOptions = {}): Plugin => {
  const filter = /^\/runtime\//;
  if (parent && !path.isAbsolute(parent)) {
    throw new Error(`Invalid parent path '${parent}': must be absolute if defined`);
  }
  return {
    name: 'runtime-import',
    setup(build) {
      build.onResolve({ filter }, (args) => {
        const relpath = args.path.replace(filter, './runtime/');
        return {
          external: true,
          path: parent ? path.resolve(parent, relpath) : relpath
        };
      });
    }
  };
};
