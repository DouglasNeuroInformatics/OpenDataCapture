import type { BundlerInput } from '@opendatacapture/instrument-bundler';
import { z } from 'zod';

export const $EditorFile = z.object({
  content: z.string(),
  id: z.string(),
  name: z.string()
}) satisfies z.ZodType<BundlerInput>;
export type EditorFile = z.infer<typeof $EditorFile>;
