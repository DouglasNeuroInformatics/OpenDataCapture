import fs from 'fs/promises';
import path from 'path';
import url from 'url';

import { transformTranslations } from '@douglasneuroinformatics/ui';
import copy from 'rollup-plugin-copy';
import type { PluginOption, ViteDevServer } from 'vite';

const projectDir = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');

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
            const translations = JSON.parse(contents.toString()) as Record<string, unknown>;
            return JSON.stringify(transformTranslations(translations, 'en'), null, 2);
          }
        },
        {
          dest: 'dist/locales/fr',
          src: 'src/translations/*',
          transform: (contents) => {
            const translations = JSON.parse(contents.toString()) as Record<string, unknown>;
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
            .then((text) => JSON.parse(text) as Record<string, unknown>)
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
