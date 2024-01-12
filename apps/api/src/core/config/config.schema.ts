import { z } from 'zod';

export const $EnvironmentConfig = z.object({
  GATEWAY_BASE_URL: z.string().url(),
  GATEWAY_ENABLED: z.coerce.boolean(),
  GATEWAY_REFRESH_INTERVAL: z.number().positive().int(),
  MONGO_URI: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'testing']),
  SECRET_KEY: z.string().min(32)
});

export type EnvironmentConfig = z.infer<typeof $EnvironmentConfig>;