import { $BooleanString } from '@open-data-capture/common/core';
import { z } from 'zod';

export const $Configuration = z.object({
  API_DEV_SERVER_PORT: z.coerce.number().positive().int().optional(),
  API_PROD_SERVER_PORT: z.coerce.number().positive().int().default(80),
  GATEWAY_API_KEY: z.string().min(32),
  GATEWAY_BASE_URL: z.string().url(),
  GATEWAY_ENABLED: $BooleanString,
  GATEWAY_REFRESH_INTERVAL: z.coerce.number().positive().int(),
  MONGO_URI: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'testing']),
  SECRET_KEY: z.string().min(32)
});

export type Configuration = z.infer<typeof $Configuration>;
