import fs from 'fs/promises';
import path from 'path';
import url from 'url';

import copy from 'rollup-plugin-copy';
import type { PluginOption, ViteDevServer } from 'vite';

// The directory containing the `vite-plugin-runtime` package
const pkgDir = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');

// The root directory of the monorepo
const projectDir = path.resolve(pkgDir, '..', '..');

const resolveBundle = async (version: string, filename: string) => {
  const filepath = path.resolve(projectDir, 'runtime', version, 'dist', filename);
  const isFile = await fs.exists(filepath);
  if (!(isFile && filename.endsWith('.js'))) {
    return null;
  }
  return fs.readFile(filepath, 'utf8');
};

const runtime = () => {
  return {
    ...copy({
      copySync: true,
      hook: 'buildStart',
      targets: [
        {
          dest: 'dist/runtimes',
          src: path.resolve(projectDir, 'runtime')
        }
      ]
    }),
    configureServer(server: ViteDevServer) {
      server.middlewares.use('/runtime', (req, res, next) => {
        const [version, filename] = req.url?.split('/').filter(Boolean) ?? [];
        if (!(version && filename)) {
          return next();
        }
        resolveBundle(version, filename)
          .then((file) => {
            if (!file) {
              return next();
            }
            res.writeHead(200, { 'Content-Type': 'application/javascript' });
            res.end(file);
          })
          .catch(next);
      });
    }
  } as PluginOption;
};

export default runtime;
