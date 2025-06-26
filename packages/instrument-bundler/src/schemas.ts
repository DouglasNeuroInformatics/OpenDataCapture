import { z } from 'zod/v4';

import type { BuildFailure, Location, Message } from './vendor/esbuild.js';

const $BundlerInput = z.object({
  content: z.union([z.string(), z.instanceof(Uint8Array)]),
  name: z.string()
});
type BundlerInput = z.infer<typeof $BundlerInput>;

const $BundleOptions = z.object({
  inputs: z.array($BundlerInput),
  minify: z.boolean().optional()
});
type BundleOptions = z.infer<typeof $BundleOptions>;

const $Location: z.ZodType<Location> = z.object({
  column: z.number(),
  file: z.string(),
  length: z.number(),
  line: z.number(),
  lineText: z.string(),
  namespace: z.string(),
  suggestion: z.string()
});

const $Note = z.object({
  location: $Location.nullable(),
  text: z.string()
});

// Zod interprets 'any' as including optional, which is why this is required
// https://github.com/colinhacks/zod/issues/2966
const $Message = z.object({
  detail: z.unknown(),
  id: z.string(),
  location: $Location.nullable(),
  notes: z.array($Note),
  pluginName: z.string(),
  text: z.string()
}) satisfies z.ZodType<Omit<Message, 'detail'>> as z.ZodType<Message>;

export const $BuildFailure = z.object({
  cause: z.unknown(),
  errors: z.array($Message),
  message: z.string(),
  name: z.string(),
  stack: z.string().optional(),
  warnings: z.array($Message)
}) satisfies z.ZodType<BuildFailure>;

export { $BundleOptions, $BundlerInput };
export type { BundleOptions, BundlerInput };
