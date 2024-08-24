import { resolveInput } from './resolve.js';
import { inferLoader, isHttpImport } from './utils.js';

import type { BundlerInput } from './schemas.js';
import type { Plugin } from './vendor/esbuild.js';

export const plugin = (options: { inputs: BundlerInput[] }): Plugin => {
  return {
    name: 'instrument-bundler-plugin',
    setup(build) {
      const namespaces = { bundle: 'bundle' };
      build.onResolve({ filter: /.*/ }, (args) => {
        if (args.kind === 'dynamic-import') {
          return isHttpImport(args.path)
            ? { external: true }
            : { errors: [{ text: `Invalid dynamic import '${args.path}': must be http import` }] };
        } else if (/\/runtime\/v1\/(@.*\/)?[^/]+$/.test(args.path)) {
          console.log(args.path);
          return { external: true, path: `${args.path}/index.js` };
        } else if (args.path.startsWith('/runtime/v1/')) {
          return { external: true, path: args.path.endsWith('.js') ? args.path : `${args.path}.js` };
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
                location: { file: args.path },
                text: `Failed to resolve '${args.path}' from input filenames: ${options.inputs.map((file) => `'${file.name}'`).join(', ')}`
              }
            ]
          };
        }
        return {
          contents: input.content,
          loader: inferLoader(input.name)
        };
      });
    }
  };
};
