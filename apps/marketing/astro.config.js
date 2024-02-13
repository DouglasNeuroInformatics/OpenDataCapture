import path from 'path';
import url from 'url';

import sitemap from '@astrojs/sitemap';
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
