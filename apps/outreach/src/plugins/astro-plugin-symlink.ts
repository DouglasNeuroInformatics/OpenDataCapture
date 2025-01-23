import fs from 'fs';
import path from 'path';
import url from 'url';

import type { ViteUserConfig } from 'astro';

type PluginOption = NonNullable<ViteUserConfig['plugins']>[number];
type Plugin = Extract<PluginOption, { name: string }>;

/** Finds the plugin object with the specified name */
function resolveTargetPlugin(plugins: null | PluginOption[] | undefined, targetName: string): null | Plugin {
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

/** Attempt to resolve the symbolic link for the real path 'id'*/
function resolveSymbolicLink({
  collections,
  id,
  root
}: {
  collections: { [key: string]: string };
  id: string;
  root: string;
}): string {
  const contentDir = path.resolve(root, './src/content');
  for (const [name, relpath] of Object.entries(collections)) {
    const targetPrefix = path.resolve(root, relpath);
    if (!id.startsWith(targetPrefix)) {
      continue;
    }
    const resolvedId = path.join(contentDir, name, id.replace(targetPrefix, ''));
    const resolvedFilepath = url.fileURLToPath(new URL(`file://${resolvedId}`));
    if (!fs.existsSync(resolvedFilepath)) {
      throw new Error(`File does not exist: ${resolvedFilepath}`);
    }
    return resolvedId;
  }
  throw new Error(`Failed to resolve symbolic link for ID: ${id}`);
}

/**
 * Workaround to allow Astro content collections to work with symlinks and pnpm

 * @param options
 * @param options.collections a mapping of collection names (or directories in collections) to directories, relative to the root defined in astro.config.js
 */
function symlink({ collections }: { collections: { [key: string]: string } }): Plugin {
  return {
    config: ({ plugins, root }) => {
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
        let result: ReturnType<Extract<Plugin['transform'], (...args: any[]) => any>>;
        try {
          result = await transform.call(this, code, id, options);
        } catch (err) {
          if (!(err instanceof Error && err.name === 'UnknownContentCollectionError')) {
            throw err;
          }
          id = resolveSymbolicLink({ collections, id, root });
          result = await transform.call(this, code, id, options);
        }
        return result;
      };
    },
    name: 'astro-plugin-symlink'
  };
}

export default symlink;
