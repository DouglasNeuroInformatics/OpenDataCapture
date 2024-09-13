import path from 'path';

import { z } from 'zod';

const $Config = z
  .object({
    apiKey: z.string().min(32),
    devServerPort: z.coerce.number().int().positive().optional(),
    prodServerPort: z.coerce.number().int().positive().default(80),
    root: z.string().min(1)
  })
  .refine((config) => Boolean(import.meta.env.PROD || config.devServerPort), {
    message: 'Server port must be specified in development mode!'
  })
  .transform(({ devServerPort, prodServerPort, ...config }) => ({
    port: import.meta.env.DEV ? devServerPort : prodServerPort,
    ...config
  }));

export const config = await $Config.parseAsync({
  apiKey: process.env.GATEWAY_API_KEY,
  devServerPort: process.env.GATEWAY_DEV_SERVER_PORT,
  prodServerPort: process.env.GATEWAY_PROD_SERVER_PORT,
  root: path.resolve(import.meta.dirname, '..')
});
