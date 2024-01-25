import { z } from 'zod';

export const config = await z
  .object({
    base: z.string().default('/'),
    mode: z.enum(['development', 'production']),
    port: z.coerce.number().int().positive().default(80)
  })
  .transform(({ port, ...config }) => ({
    port: config.mode === 'development' ? port : 80,
    ...config
  }))
  .parseAsync({
    base: process.env.BASE,
    mode: process.env.NODE_ENV,
    port: process.env.GATEWAY_DEV_SERVER_PORT
  });
