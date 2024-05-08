import path from 'path';

import { z } from 'zod';

const $Config = z
  .object({
    apiKey: z.string().min(32),
    devServerPort: z.coerce.number().int().positive().optional(),
    mode: z.enum(['development', 'production']),
    prodServerPort: z.coerce.number().int().positive().default(80),
    root: z.string().min(1)
  })
  .refine((config) => config.mode === 'production' || config.devServerPort, {
    message: 'Server port must be specified in development mode!'
  })
  .transform(({ devServerPort, prodServerPort, ...config }) => ({
    port: config.mode === 'development' ? devServerPort : prodServerPort,
    ...config
  }));

export const CONFIG = await $Config.parseAsync({
  apiKey: process.env.GATEWAY_API_KEY,
  devServerPort: process.env.GATEWAY_DEV_SERVER_PORT,
  mode: process.env.NODE_ENV,
  prodServerPort: process.env.GATEWAY_PROD_SERVER_PORT,
  root: path.resolve(import.meta.dirname, '..')
});
