import fs from 'fs/promises';
import path from 'path';
import url from 'url';

import sitemap from '@astrojs/sitemap';
import starlight from '@astrojs/starlight';
import tailwind from '@astrojs/tailwind';
import { defineConfig, squooshImageService } from 'astro/config';
import { toString } from 'mdast-util-to-string';
import getReadingTime from 'reading-time';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

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
        SiteTitle: path.resolve(__dirname, './src/components/SiteTitle.astro')
      },
      customCss: [path.resolve(__dirname, './src/styles/starlight-custom.css')],
      defaultLocale: 'en',
      favicon: '/favicon.ico',
      head: [
        {
          content: await fs.readFile(path.resolve(__dirname, './src/scripts/theme-observer.js'), 'utf-8'),
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
      configFile: path.resolve(__dirname, 'tailwind.config.cjs')
    })
  ],
  markdown: {
    remarkPlugins: [
      () => {
        return function (tree, { data }) {
          const textOnPage = toString(tree);
          const readingTime = getReadingTime(textOnPage);
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
    port: parseInt(process.env.OUTREACH_DEV_SERVER_PORT ?? 4000)
  },
  site: 'https://opendatacapture.org',
  vite: {
    resolve: {
      preserveSymlinks: true
    }
  }
});
