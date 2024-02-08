import { $BooleanString } from '@open-data-capture/common/core';
import { z } from 'zod';

export const $Configuration = z.object({
  API_DEV_SERVER_PORT: z.coerce.number().positive().int().optional(),
  API_PROD_SERVER_PORT: z.coerce.number().positive().int().default(80),
  DEBUG: $BooleanString,
  GATEWAY_API_KEY: z.string().min(32),
  GATEWAY_BASE_URL: z.string().url(),
  GATEWAY_ENABLED: $BooleanString,
  GATEWAY_REFRESH_INTERVAL: z.coerce.number().positive().int(),
  MONGO_DIRECT_CONNECTION: z.string().optional(),
  MONGO_REPLICA_SET: z.string().optional(),
  MONGO_RETRY_WRITES: z.string().optional(),
  MONGO_URI: z.string().url(),
  MONGO_WRITE_CONCERN: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'testing']),
  SECRET_KEY: z.string().min(32),
  VERBOSE: $BooleanString
});

export type Configuration = z.infer<typeof $Configuration>;
