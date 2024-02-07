import module from 'module';

/**
 * Adds support to esbuild for loading native node modules
 *
 * This works by intercepting import paths for .node files in the "file" namespace
 * and adding them to the 'node-file' namespace instead.
 *
 * @returns {import('esbuild').Plugin}
 */
export function nativeModulesPlugin() {
  const require = module.createRequire(import.meta.url);
  return {
    name: 'native-modules',
    setup(build) {
      // If a ".node" file is imported within a module in the "file" namespace, resolve
      // it to an absolute path and put it into the "node-file" virtual namespace.
      build.onResolve({ filter: /\.node$/, namespace: 'file' }, (args) => ({
        namespace: 'node-file',
        path: require.resolve(args.path, { paths: [args.resolveDir] })
      }));

      // Files in the "node-file" virtual namespace call "require()" on the
      // path from esbuild of the ".node" file in the output directory.
      build.onLoad({ filter: /.*/, namespace: 'node-file' }, (args) => ({
        contents: `
        import path from ${JSON.stringify(args.path)}
        try { module.exports = require(path) }
        catch {}
      `
      }));

      // If a ".node" file is imported within a module in the "node-file" namespace, put
      // it in the "file" namespace where esbuild's default loading behavior will handle
      // it. It is already an absolute path since we resolved it to one above.
      build.onResolve({ filter: /\.node$/, namespace: 'node-file' }, (args) => ({
        namespace: 'file',
        path: args.path
      }));

      // Tell esbuild's default loading behavior to use the "file" loader for
      // these ".node" files.
      let opts = build.initialOptions;
      opts.loader = opts.loader || {};
      opts.loader['.node'] = 'file';
    }
  };
}
