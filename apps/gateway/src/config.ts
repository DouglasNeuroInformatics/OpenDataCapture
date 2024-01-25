import path from 'path';
import url from 'url';

import { z } from 'zod';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const $Config = z
  .object({
    base: z.string().default('/'),
    devServerPort: z.coerce.number().int().positive().optional(),
    mode: z.enum(['development', 'production']),
    root: z.string().min(1)
  })
  .refine((config) => config.mode === 'production' || config.devServerPort, {
    message: 'Server port must be specified in development mode!'
  })
  .transform(({ devServerPort, ...config }) => ({
    datasource: path.resolve(config.root, 'db.json'),
    port: config.mode === 'development' ? devServerPort : 80,
    ...config
  }));

export const CONFIG = await $Config.parseAsync({
  base: process.env.BASE,
  devServerPort: process.env.GATEWAY_DEV_SERVER_PORT,
  mode: process.env.NODE_ENV,
  root: path.resolve(__dirname, '..')
});
