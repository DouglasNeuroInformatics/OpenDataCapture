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
      customCss: [path.resolve(__dirname, './src/styles/starlight-custom.css')],
      defaultLocale: 'en',
      favicon: '/favicon.ico',
      locales: {
        en: {
          label: 'English'
        },
        fr: {
          label: 'Français'
        }
      },
      logo: {
        dark: path.resolve(__dirname, './src/assets/logos/logo-dark.svg'),
        light: path.resolve(__dirname, './src/assets/logos/logo-light.svg')
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
      configFile: path.resolve(__dirname, 'tailwind.config.js')
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
  server: {
    port: parseInt(process.env.MARKETING_DEV_SERVER_PORT ?? 4000)
  },
  site: 'https://opendatacapture.org'
});
