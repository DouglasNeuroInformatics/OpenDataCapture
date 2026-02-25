import * as fs from 'fs';
import * as module from 'module';
import * as path from 'path';

/** @type {(path: string) => Promise<boolean>} */
const isDirectory = async (path) => fs.existsSync(path) && fs.lstatSync(path).isDirectory();

const RUNTIME_DIST_DIRNAME = 'dist';

export const RUNTIME_VERSIONS = ['v1'];

/** @type {import('.').MANIFEST_FILENAME} */
export const MANIFEST_FILENAME = 'runtime.json';

/** @type {import('.').generateManifest} */
export async function generateManifest(baseDir) {
  /** @type {{ declarations: string[], html: string[], sources: string[], styles: string[] }} */
  const results = { declarations: [], html: [], sources: [], styles: [] };
  /** @param {string} dir */
  await (async function resolveDir(dir) {
    const files = await fs.promises.readdir(dir, 'utf-8');
    for (const file of files) {
      const abspath = path.join(dir, file);
      if (await isDirectory(abspath)) {
        await resolveDir(abspath);
      } else if (abspath.endsWith('.css')) {
        results.styles.push(abspath.replace(`${baseDir}/`, ''));
      } else if (abspath.endsWith('.js')) {
        results.sources.push(abspath.replace(`${baseDir}/`, ''));
      } else if (abspath.endsWith('.d.ts')) {
        results.declarations.push(abspath.replace(`${baseDir}/`, ''));
      } else if (abspath.endsWith('.html')) {
        results.html.push(abspath.replace(`${baseDir}/`, ''));
      }
    }
  })(baseDir);
  return results;
}

/** @type {import('.').generateMetadata} */
export async function generateMetadata(options) {
  const require = module.createRequire(options.rootDir);

  /** @type {import('.').RuntimeMetadataMap} */
  const metadata = new Map();

  for (const v of RUNTIME_VERSIONS) {
    const packageDir = path.dirname(require.resolve(`@opendatacapture/runtime-${v}/package.json`));
    const baseDir = path.resolve(packageDir, RUNTIME_DIST_DIRNAME);
    const { declarations, html, sources, styles } = await generateManifest(baseDir);

    const importPathPattern = /^(@?[^@/]+(?:\/[^@/]+)?)(?:@([^/]+))?/;

    /** @type {Map<string, import('.').RuntimePackageMetadata>} */
    const packages = new Map();

    /** @param {string} filename @param {'css' | 'html' | 'js'} kind */
    const addToPackage = (filename, kind) => {
      const match = filename.match(importPathPattern);
      if (!match) {
        throw new Error(`Unexpected import path pattern: ${filename}`);
      }
      const [name, version] = /** @type {[string, string]} */ (match.slice(1, 3));
      const key = name + '$' + version;
      if (!packages.has(key)) {
        packages.set(key, { exports: { css: [], html: [], js: [] }, name, version });
      }
      packages.get(key)?.exports[kind].push(`/runtime/${v}/${filename}`);
    };

    sources.forEach((source) => addToPackage(source, 'js'));
    html.forEach((file) => addToPackage(file, 'html'));
    styles.forEach((style) => addToPackage(style, 'css'));

    metadata.set(v, {
      baseDir,
      manifest: {
        declarations,
        html,
        sources,
        styles
      },
      packages: [...packages.values()]
    });
  }
  return metadata;
}

/** @type {import('.').resolveRuntimeAsset} */
export async function resolveRuntimeAsset(url, metadata) {
  const [version, ...paths] = url?.split('/').filter(Boolean) ?? [];
  const filepath = paths.join('/');

  if (!(version && filepath) || !metadata.has(version)) {
    return null;
  }

  const { baseDir, manifest } = /** @type {import('.').RuntimeVersionMetadata} */ (metadata.get(version));

  if (filepath === MANIFEST_FILENAME) {
    return {
      content: JSON.stringify(manifest),
      contentType: 'application/json'
    };
  } else if (manifest.declarations.includes(filepath)) {
    return {
      content: await fs.promises.readFile(path.resolve(baseDir, filepath), 'utf-8'),
      contentType: 'text/plain'
    };
  } else if (manifest.html.includes(filepath)) {
    return {
      content: await fs.promises.readFile(path.resolve(baseDir, filepath), 'utf-8'),
      contentType: 'text/html'
    };
  } else if (manifest.styles.includes(filepath)) {
    return {
      content: await fs.promises.readFile(path.resolve(baseDir, filepath), 'utf-8'),
      contentType: 'text/css'
    };
  } else if (manifest.sources.includes(filepath)) {
    return {
      content: await fs.promises.readFile(path.resolve(baseDir, filepath), 'utf-8'),
      contentType: 'text/javascript'
    };
  }

  return null;
}
