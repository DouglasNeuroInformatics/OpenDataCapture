import { resolveInput } from './resolve.js';
import { inferLoader } from './utils.js';

import type { BundlerInput } from './types.js';
import type { Plugin } from './vendor/esbuild.js';

export const resolvePlugin = (options: { inputs: BundlerInput[] }): Plugin => {
  return {
    name: 'resolve',
    setup(build) {
      const namespace = 'bundle';
      build.onResolve({ filter: /.*/ }, (args) => {
        if (args.kind === 'dynamic-import') {
          if (!args.path.startsWith('/')) {
            return { errors: [{ text: `Invalid dynamic import '${args.path}': must start with '/'` }] };
          }
          return { external: true, path: args.path };
        }
        return {
          namespace,
          path: args.path
        };
      });
      build.onLoad({ filter: /.*/, namespace }, (args) => {
        const input = resolveInput(args.path, options.inputs);

        if (!input) {
          return {
            errors: [
              {
                text: `Failed to resolve '${args.path}' from input filenames: ${options.inputs.map((file) => `'${file.name}'`).join(', ')}`
              }
            ]
          };
        }
        return {
          contents: input?.content,
          loader: inferLoader(input.name)
        };
      });
    }
  };
};
