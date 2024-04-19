import { z } from 'zod';

export const $EditorLanguage = z.enum(['typescript']);
export type EditorLanguage = z.infer<typeof $EditorLanguage>;

export const $EditorFile = z.object({
  id: z.string(),
  language: $EditorLanguage,
  name: z.string(),
  value: z.string()
});
export type EditorFile = z.infer<typeof $EditorFile>;
