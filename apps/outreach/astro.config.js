import fs from 'fs/promises';
import module from 'module';
import path from 'path';

import sitemap from '@astrojs/sitemap';
import starlight from '@astrojs/starlight';
import tailwind from '@astrojs/tailwind';
import { symlink } from '@opendatacapture/vite-plugin-symlink';
import { defineConfig, squooshImageService } from 'astro/config';
import { toString } from 'mdast-util-to-string';
import getReadingTime from 'reading-time';

const require = module.createRequire(import.meta.dirname);

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
        SiteTitle: path.resolve(import.meta.dirname, './src/components/SiteTitle.astro')
      },
      customCss: [path.resolve(import.meta.dirname, './src/styles/starlight-custom.css')],
      defaultLocale: 'en',
      disable404Route: true,
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
        },
        {
          autogenerate: { directory: '6-changelogs' },
          label: 'Changelogs'
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
      symlink({
        collections: {
          blog: '../../blog',
          docs: '../../docs'
        }
      })
    ],
    // this is necessary because the MDX imports will attempt to resolve from their actual location
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, 'src'),
        '@astrojs/starlight': path.dirname(require.resolve('@astrojs/starlight'))
      },
      // this is the default, but is noted explicitly since this is handled by vite-plugin-symlink
      preserveSymlinks: false
    }
  }
});
