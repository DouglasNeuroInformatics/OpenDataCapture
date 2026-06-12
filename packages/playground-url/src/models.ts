import { z } from 'zod/v4';

/**
 * A single source file of a playground instrument. The content must be a UTF-8
 * string, mirroring the playground editor's own file model — binary assets
 * (images, audio, video) cannot be represented in a share URL.
 */
export type EditorFile = z.infer<typeof $EditorFile>;
export const $EditorFile = z.object({
  content: z.string(),
  name: z.string()
});

export const $EditorFiles = z.array($EditorFile);

/** The minimal description of an instrument needed to (de)serialize a share URL. */
export type PlaygroundInstrument = {
  files: EditorFile[];
  label: string;
};
