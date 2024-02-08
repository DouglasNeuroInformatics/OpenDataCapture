import type { BuildFailure, Location, Message } from 'esbuild';
import { z } from 'zod';

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

const $Message: z.ZodType<Omit<Message, 'detail'>> = z.object({
  detail: z.unknown(),
  id: z.string(),
  location: $Location.nullable(),
  notes: z.array($Note),
  pluginName: z.string(),
  text: z.string()
});

// Zod interprets 'any' as including optional, which is why this is required
type ESBuildFailure = {
  [K in keyof BuildFailure]: BuildFailure[K] extends (infer T extends Message)[]
    ? Omit<T, 'detail'>[]
    : BuildFailure[K];
};

export const $BuildFailure: z.ZodType<ESBuildFailure> = z.object({
  cause: z.unknown(),
  errors: z.array($Message),
  message: z.string(),
  name: z.string(),
  stack: z.string().optional(),
  warnings: z.array($Message)
});
