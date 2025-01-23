import fs from 'fs';
import module from 'module';
import path from 'path';

import sitemap from '@astrojs/sitemap';
import starlight from '@astrojs/starlight';
import tailwind from '@astrojs/tailwind';
import { defineConfig, sharpImageService } from 'astro/config';
import { toString } from 'mdast-util-to-string';
import getReadingTime from 'reading-time';

import symlink from './src/plugins/astro-plugin-symlink';
import { starlightTypeDocPlugin, starlightTypeDocSidebarGroup } from './src/plugins/starlight-plugin-typedoc';

const require = module.createRequire(import.meta.dirname);

const runtimeCoreRoot = path.dirname(require.resolve('@opendatacapture/runtime-core/package.json'));

// https://astro.build/config
export default defineConfig({
  build: {
    assets: '_assets'
  },
  compressHTML: true,
  image: {
    service: sharpImageService()
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
        starlightTypeDocPlugin({
          entryPoints: [path.resolve(runtimeCoreRoot, 'lib/index.d.ts')],
          locale: 'en',
          output: 'runtime-core-docs',
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
          autogenerate: { directory: 'docs/6-updating' },
          label: 'Updating'
        },
        starlightTypeDocSidebarGroup
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
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          (data.astro as any).frontmatter.readingTime = readingTime.minutes;
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
