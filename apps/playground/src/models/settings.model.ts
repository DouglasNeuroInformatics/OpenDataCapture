import { z } from 'zod';

export const $Settings = z.object({
  rebuildInterval: z.number().positive().int()
});
export type Settings = z.infer<typeof $Settings>;
