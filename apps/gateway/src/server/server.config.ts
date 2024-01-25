import path from 'path';
import url from 'url';

import { z } from 'zod';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const SERVER_CONFIG = await z
  .object({
    base: z.string().default('/'),
    mode: z.enum(['development', 'production']),
    port: z.coerce.number().int().positive().default(80),
    root: z.string()
  })
  .transform(({ port, ...config }) => ({
    port: config.mode === 'development' ? port : 80,
    ...config
  }))
  .parseAsync({
    base: process.env.BASE,
    mode: process.env.NODE_ENV,
    port: process.env.GATEWAY_DEV_SERVER_PORT,
    root: path.resolve(__dirname, '../..')
  });
