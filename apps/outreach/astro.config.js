import fs from 'fs/promises';
import module from 'module';
import path from 'path';

import sitemap from '@astrojs/sitemap';
import starlight from '@astrojs/starlight';
import tailwind from '@astrojs/tailwind';
import { defineConfig, squooshImageService } from 'astro/config';
import { toString } from 'mdast-util-to-string';
import getReadingTime from 'reading-time';

const require = module.createRequire(import.meta.dirname);

/** @typedef {NonNullable<import('astro').ViteUserConfig['plugins']>[number] } VitePluginOption */
/** @typedef {Extract<VitePluginOption, { name: string}>} VitePlugin */

/**
 * Workaround to allow Astro content collections to work with symlinks and pnpm

 * @param {Object} options
 * @param {Record<string, string>} options.collections - a mapping of collection names to directories, relative to the root defined in astro.config.js
 * @returns {VitePlugin}
 */
const plugin = ({ collections }) => {
  /**
   * Finds the plugin object with the specified name
   * @param {VitePluginOption[] | null | undefined} plugins
   * @param {string} targetName
   * @returns {VitePlugin | null}
   */
  const resolveTargetPlugin = (plugins, targetName) => {
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
  };

  return {
    config: async ({ plugins, root }) => {
      if (!root) {
        throw new TypeError('Expected root to be defined in astro config');
      }
      const contentDir = path.resolve(root, './src/content');
      const collectionDirents = await fs.readdir(contentDir, { encoding: 'utf-8', withFileTypes: true });

      const targetName = 'astro:content-imports';
      const target = resolveTargetPlugin(plugins, targetName);
      const transform = target?.transform;
      if (!target) {
        throw new Error(`Failed to find target plugin: ${targetName}`);
      } else if (typeof transform !== 'function') {
        throw new Error(`Unexpected type of transform method: ${typeof transform}`);
      }

      /**
       * Attempt to resolve the absolute path to the symbolic link for the real directory 'id'
       * @param {string} id
       */
      const resolveSymbolicLink = (id) => {
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
      };

      target.transform = async function (code, id, options) {
        /** @type {ReturnType<Extract<VitePlugin['transform'], Function>>} */
        let result;
        try {
          result = await transform.call(this, code, id, options);
        } catch (err) {
          if (!(err instanceof Error && err.name === 'UnknownContentCollectionError')) {
            throw err;
          }
          id = resolveSymbolicLink(id);
          result = await transform.call(this, code, id, options);
        }
        return result;
      };
    },
    name: 'symlink-plugin'
  };
};

// https://astro.build/config
export default defineConfig({
  build: {
    assets: '_assets'
  },
  compressHTML: true,
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fr'],
    routing: {
      prefixDefaultLocale: true
    }
  },
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
        SiteTitle: path.resolve(import.meta.dirname, './src/components/SiteTitle.astro')
      },
      customCss: [path.resolve(import.meta.dirname, './src/styles/starlight-custom.css')],
      defaultLocale: 'en',
      favicon: '/favicon.ico',
      head: [
        {
          content: await fs.readFile(path.resolve(import.meta.dirname, './src/scripts/theme-observer.js'), 'utf-8'),
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
      sidebar: [
        {
          autogenerate: { directory: '1-introduction' },
          label: 'Introduction'
        },
        {
          autogenerate: { directory: '2-tutorials' },
          label: 'Tutorials'
        },
        {
          autogenerate: { directory: '3-guides' },
          label: 'Guides'
        },
        {
          autogenerate: { directory: '4-concepts' },
          label: 'Concepts'
        },
        {
          autogenerate: { directory: '5-reference' },
          label: 'Reference'
        }
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
  redirects: {
    '/docs': '/en/introduction/home',
    '/en/docs': '/en/introduction/home',
    '/fr/docs': '/fr/introduction/home'
  },
  server: {
    port: parseInt(process.env.OUTREACH_DEV_SERVER_PORT ?? '4000')
  },
  site: 'https://opendatacapture.org',
  vite: {
    plugins: [
      plugin({
        collections: {
          blog: '../../blog',
          docs: '../../docs'
        }
      })
    ],
    // this is necessary because the MDX imports will attempt to resolve from their actual location
    resolve: {
      alias: {
        '@astrojs/starlight': path.dirname(require.resolve('@astrojs/starlight'))
      }
    }
  }
});
