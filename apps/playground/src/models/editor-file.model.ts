import { z } from 'zod';

export const $EditorFile = z.object({
  id: z.string(),
  name: z.string(),
  value: z.string()
});
export type EditorFile = z.infer<typeof $EditorFile>;
