/**
 * This used to be used to handle converting our translation format to the default
 * to use with i18next-http-backend. However, since our bundle size is already quite large
 * given the context of our app, and for our use case that is fine, this seemed like a lot
 * of added complexity for negligible benefit.
 *
 * If this is ever added back, it should be moved into a separate package to be consistant
 * with our other custom vite plugins.
 */

import fs from 'fs/promises';
import path from 'path';

import { transformTranslations } from '@douglasneuroinformatics/libui/i18n';
import copy from 'rollup-plugin-copy';
import type { PluginOption, ViteDevServer } from 'vite';

const projectDir = path.resolve(import.meta.dirname, '..');

export const translations = () => {
  return {
    ...copy({
      copySync: true,
      hook: 'buildStart',
      targets: [
        {
          dest: 'dist/locales/en',
          src: 'src/translations/*',
          transform: (contents) => {
            const translations = JSON.parse(contents.toString()) as { [key: string]: unknown };
            return JSON.stringify(transformTranslations(translations, 'en'), null, 2);
          }
        },
        {
          dest: 'dist/locales/fr',
          src: 'src/translations/*',
          transform: (contents) => {
            const translations = JSON.parse(contents.toString()) as { [key: string]: unknown };
            return JSON.stringify(transformTranslations(translations, 'fr'), null, 2);
          }
        }
      ]
    }),
    configureServer(server: ViteDevServer) {
      server.middlewares.use('/locales', (req, res, next) => {
        const [locale, namespace] = req.url?.split('/').filter(Boolean) ?? [];
        if (locale && namespace) {
          const translationsFile = path.resolve(projectDir, 'src', 'translations', namespace);
          fs.readFile(translationsFile, 'utf8')
            .then((text) => JSON.parse(text) as { [key: string]: unknown })
            .then((translations) => {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(transformTranslations(translations, locale)));
            })
            .catch((error) => {
              console.error(error);
              next(new Error(`Failed to read file: ${translationsFile}`));
            });
        } else {
          next();
        }
      });
    }
  } as PluginOption;
};
