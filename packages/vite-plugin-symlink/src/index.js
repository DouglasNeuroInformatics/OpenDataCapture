import fs from 'fs/promises';
import path from 'path';

/**
 * Finds the plugin object with the specified name
 * @param {import('vite').PluginOption[] | null | undefined} plugins
 * @param {string} targetName
 * @returns {import('vite').Plugin | null}
 */
function resolveTargetPlugin(plugins, targetName) {
  for (const plugin of plugins ?? []) {
    if (!plugin || typeof plugin !== 'object' || plugin instanceof Promise) {
      continue;
    } else if (Array.isArray(plugin)) {
      const target = resolveTargetPlugin(plugin, targetName);
      if (target) return target;
    } else if (plugin.name === targetName) {
      return plugin;
    }
  }
  return null;
}

/**
 * Attempt to resolve the absolute path to the symbolic link for the real directory 'id'
 * @param {Object} options
 * @param {Record<string, string>} options.collections
 * @param {string} options.id
 * @param {string} options.root
 * @returns {Promise<string>}
 */
async function resolveSymbolicLink({ collections, id, root }) {
  const contentDir = path.resolve(root, './src/content');
  const collectionDirents = await fs.readdir(contentDir, { encoding: 'utf-8', withFileTypes: true });
  for (const [name, relpath] of Object.entries(collections)) {
    const targetPrefix = path.resolve(root, relpath);
    if (id.startsWith(targetPrefix)) {
      const dirent = collectionDirents.find((dirent) => dirent.name === name);
      if (!dirent) {
        throw new Error(`Expected collection '${name}' does not exist in directory: ${contentDir}`);
      } else if (!dirent.isSymbolicLink()) {
        throw new Error(`File is not a symbolic link: ${path.join(dirent.path, dirent.name)}`);
      }
      return id.replace(targetPrefix, path.join(dirent.path, dirent.name));
    }
  }
  throw new Error(`Failed to resolve symbolic link for ID: ${id}`);
}

/**
 * Workaround to allow Astro content collections to work with symlinks and pnpm

 * @param {Object} options
 * @param {Record<string, string>} options.collections - a mapping of collection names to directories, relative to the root defined in astro.config.js
 * @returns {import('vite').Plugin}
 */
export function symlink({ collections }) {
  return {
    config: async ({ plugins, root }) => {
      if (!root) {
        throw new TypeError('Expected root to be defined in astro config');
      }
      const targetName = 'astro:content-imports';
      const target = resolveTargetPlugin(plugins, targetName);
      const transform = target?.transform;
      if (!target) {
        throw new Error(`Failed to find target plugin: ${targetName}`);
      } else if (typeof transform !== 'function') {
        throw new Error(`Unexpected type of transform method: ${typeof transform}`);
      }
      target.transform = async function (code, id, options) {
        /** @type {ReturnType<Extract<import('vite').Plugin['transform'], Function>>} */
        let result;
        try {
          result = await transform.call(this, code, id, options);
        } catch (err) {
          if (!(err instanceof Error && err.name === 'UnknownContentCollectionError')) {
            throw err;
          }
          id = await resolveSymbolicLink({ collections, id, root });
          result = await transform.call(this, code, id, options);
        }
        return result;
      };
    },
    name: 'vite-plugin-symlink'
  };
}
