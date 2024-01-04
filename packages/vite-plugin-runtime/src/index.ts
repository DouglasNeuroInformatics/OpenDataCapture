import fs from 'fs/promises';
import path from 'path';
import url from 'url';

import type { PluginOption, ViteDevServer } from 'vite';

const PACKAGE_DIR = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const RUNTIME_DIR = path.resolve(PACKAGE_DIR, '..', '..', 'runtime');

const resolveManifest = async (sourceDir: string) => {
  const files = await fs.readdir(sourceDir, 'utf-8');
  return {
    declarations: files.filter((filename) => filename.endsWith('.d.ts')),
    sources: files.filter((filename) => filename.endsWith('.js'))
  };
};

const resolveBundle = async (version: string, filename: string) => {
  const filepath = path.resolve(RUNTIME_DIR, version, 'dist', filename);
  const isFile = await fs.exists(filepath);
  if (!isFile) {
    return null;
  }
  return fs.readFile(filepath, 'utf-8');
};

const runtime = () => {
  return {
    name: 'vite-plugin-runtime',
    async buildStart() {
      const versions = await fs.readdir(RUNTIME_DIR, 'utf-8');
      for (const version of versions) {
        const source = path.resolve(RUNTIME_DIR, version, 'dist');
        const destination = `dist/runtime/${version}`;
        const manifest = await resolveManifest(source);
        await fs.cp(source, destination, { recursive: true });
        await fs.writeFile(path.resolve(destination, 'runtime.json'), JSON.stringify(manifest), 'utf-8');
      }
    },
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
            const contentType = filename.endsWith('.js') ? 'text/javascript' : 'text/plain';
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(file);
          })
          .catch(next);
      });
    }
  } as PluginOption;
};

export default runtime;
