import type { BundlerInput } from '@opendatacapture/instrument-bundler';
import { z } from 'zod/v4';

export type EditorFile = z.infer<typeof $EditorFile>;
export const $EditorFile = z.object({
  content: z.string(),
  name: z.string()
}) satisfies z.ZodType<BundlerInput>;
