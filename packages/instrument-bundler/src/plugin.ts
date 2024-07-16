import { resolveInput } from './resolve.js';
import { inferLoader } from './utils.js';

import type { BundleOptions, BundlerInput } from './types.js';
import type { Plugin } from './vendor/esbuild.js';

export const resolvePlugin = (options: {
  dynamicImport?: BundleOptions['dynamicImport'];
  inputs: BundlerInput[];
}): Plugin => {
  return {
    name: 'resolve',
    setup(build) {
      const namespaces = { bundle: 'bundle', dynamic: 'dynamic' };
      build.onResolve({ filter: /.*/ }, (args) => {
        if (args.kind === 'dynamic-import') {
          if (!args.path.startsWith('/')) {
            return { errors: [{ text: `Invalid dynamic import '${args.path}': must start with '/'` }] };
          }
          return {
            external: true,
            path: options.dynamicImport === 'mapped' ? args.path.replace('/runtime', '#runtime') : args.path
          };
        }
        return {
          namespace: namespaces.bundle,
          path: args.path
        };
      });
      build.onLoad({ filter: /.*/, namespace: namespaces.bundle }, (args) => {
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
