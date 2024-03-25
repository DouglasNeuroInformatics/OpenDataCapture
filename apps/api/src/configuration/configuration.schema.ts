import { $BooleanString } from '@open-data-capture/schemas/core';
import { z } from 'zod';

const $OptionalURL = z.preprocess(
  (arg) => arg || undefined,
  z
    .string()
    .url()
    .optional()
    .transform((arg) => (arg ? new URL(arg) : undefined))
);

export const $Configuration = z
  .object({
    API_DEV_SERVER_PORT: z.coerce.number().positive().int().optional(),
    API_PROD_SERVER_PORT: z.coerce.number().positive().int().default(80),
    DEBUG: $BooleanString,
    GATEWAY_API_KEY: z.string().min(32),
    GATEWAY_DEV_SERVER_PORT: z.coerce.number().positive().int().optional(),
    GATEWAY_ENABLED: $BooleanString,
    GATEWAY_INTERNAL_NETWORK_URL: $OptionalURL,
    GATEWAY_REFRESH_INTERVAL: z.coerce.number().positive().int(),
    GATEWAY_SITE_ADDRESS: $OptionalURL,
    MONGO_DIRECT_CONNECTION: z.string().optional(),
    MONGO_REPLICA_SET: z.string().optional(),
    MONGO_RETRY_WRITES: z.string().optional(),
    MONGO_URI: z
      .string()
      .url()
      .transform((arg) => new URL(arg)),
    MONGO_WRITE_CONCERN: z.string().optional(),
    NODE_ENV: z.enum(['development', 'production', 'test']),
    SECRET_KEY: z.string().min(32),
    VERBOSE: $BooleanString
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV === 'production') {
      if (!env.GATEWAY_SITE_ADDRESS) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'GATEWAY_SITE_ADDRESS must be defined in production'
        });
      }
    } else if (env.NODE_ENV === 'development') {
      if (!env.API_DEV_SERVER_PORT) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'API_DEV_SERVER_PORT must be defined in development'
        });
      }
      if (!env.GATEWAY_DEV_SERVER_PORT) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'GATEWAY_DEV_SERVER_PORT must be defined in development'
        });
      }
    }
  });

export type Configuration = z.infer<typeof $Configuration>;
