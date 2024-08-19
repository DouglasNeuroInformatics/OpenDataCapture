import fs from 'fs';
import module from 'module';
import path from 'path';
import url from 'url';

import sitemap from '@astrojs/sitemap';
import starlight from '@astrojs/starlight';
import tailwind from '@astrojs/tailwind';
import { defineConfig, squooshImageService } from 'astro/config';
import { toString } from 'mdast-util-to-string';
import getReadingTime from 'reading-time';
import starlightTypeDoc, { typeDocSidebarGroup } from 'starlight-typedoc';

const require = module.createRequire(import.meta.dirname);

const runtimeCoreRoot = path.dirname(require.resolve('@opendatacapture/runtime-core/package.json'));

/** @typedef {NonNullable<import('astro').ViteUserConfig['plugins']>[number]} PluginOption */
/** @typedef {Extract<PluginOption, {name: string}>} Plugin */

/**
 * Finds the plugin object with the specified name
 * @param {PluginOption[] | null | undefined} plugins
 * @param {string} targetName
 * @returns {Plugin | null}
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
 * Attempt to resolve the symbolic link for the real path 'id'
 * @param {Object} options
 * @param {Record<string, string>} options.collections
 * @param {string} options.id
 * @param {string} options.root
 * @returns {Promise<string>}
 */
async function resolveSymbolicLink({ collections, id, root }) {
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

 * @param {Object} options
 * @param {Record<string, string>} options.collections - a mapping of collection names (or directories in collections) to directories, relative to the root defined in astro.config.js
 * @returns {Plugin}
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
        /** @type {ReturnType<Extract<Plugin['transform'], Function>>} */
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

// https://astro.build/config
export default defineConfig({
  build: {
    assets: '_assets'
  },
  compressHTML: true,
  image: {
    service: squooshImageService()
  },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en',
          fr: 'fr'
        }
      }
    }),
    starlight({
      components: {
        SiteTitle: path.resolve(import.meta.dirname, './src/components/common/SiteTitle.astro')
      },
      customCss: [path.resolve(import.meta.dirname, './src/styles/starlight.css')],
      defaultLocale: 'en',
      disable404Route: true,
      favicon: '/favicon.ico',
      head: [
        {
          content: await fs.promises.readFile(
            path.resolve(import.meta.dirname, './src/scripts/theme-observer.js'),
            'utf-8'
          ),
          tag: 'script'
        }
      ],
      locales: {
        en: {
          label: 'English'
        },
        fr: {
          label: 'Français'
        }
      },
      plugins: [
        starlightTypeDoc({
          entryPoints: [path.resolve(runtimeCoreRoot, 'src/index.d.ts')],
          output: 'en/docs/7-runtime-core',
          sidebar: {
            collapsed: true,
            label: 'Runtime Core API'
          },
          tsconfig: path.resolve(runtimeCoreRoot, 'tsconfig.json')
        })
      ],
      sidebar: [
        {
          autogenerate: { directory: 'docs/1-introduction' },
          label: 'Introduction'
        },
        {
          autogenerate: { directory: 'docs/2-tutorials' },
          label: 'Tutorials'
        },
        {
          autogenerate: { directory: 'docs/3-guides' },
          label: 'Guides'
        },
        {
          autogenerate: { directory: 'docs/4-concepts' },
          label: 'Concepts'
        },
        {
          autogenerate: { directory: 'docs/5-reference' },
          label: 'Reference'
        },
        {
          autogenerate: { directory: 'docs/6-changelogs' },
          label: 'Changelogs'
        },
        typeDocSidebarGroup
      ],
      social: {
        github: 'https://github.com/DouglasNeuroInformatics/OpenDataCapture'
      },
      tableOfContents: {
        maxHeadingLevel: 4,
        minHeadingLevel: 2
      },
      title: 'Open Data Capture'
    }),
    tailwind({
      applyBaseStyles: false,
      configFile: path.resolve(import.meta.dirname, 'tailwind.config.cjs')
    })
  ],
  markdown: {
    remarkPlugins: [
      () => {
        return function (tree, { data }) {
          const textOnPage = toString(tree);
          const readingTime = getReadingTime(textOnPage);
          // @ts-ignore
          data.astro.frontmatter.readingTime = readingTime.minutes;
        };
      }
    ]
  },
  output: 'static',
  redirects: {
    '/docs': '/en/docs/introduction/home',
    '/en/docs': '/en/docs/introduction/home',
    '/fr/docs': '/fr/docs/introduction/home'
  },
  server: {
    port: parseInt(process.env.OUTREACH_DEV_SERVER_PORT ?? '4000')
  },
  site: 'https://opendatacapture.org',
  vite: {
    plugins: [
      symlink({
        collections: {
          blog: '../../blog',
          'docs/en/docs': '../../docs/en',
          'docs/fr/docs': '../../docs/fr'
        }
      })
    ],
    // this is necessary because the MDX imports will attempt to resolve from their actual location
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, 'src'),
        '@astrojs/starlight': path.dirname(require.resolve('@astrojs/starlight'))
      }
    }
  }
});
