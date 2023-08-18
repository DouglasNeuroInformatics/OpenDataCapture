import { defineConfig, sharpImageService } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import getReadingTime from 'reading-time';
import { toString } from 'mdast-util-to-string';

// https://astro.build/config
export default defineConfig({
  build: {
    assets: '_assets'
  },
  //compressHTML: true,
  experimental: {
    assets: true
  },
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
    tailwind()
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
  site: 'https://douglasneuroinformatics.github.io'
});
