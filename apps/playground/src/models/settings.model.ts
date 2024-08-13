import { z } from 'zod';

export const $Settings = z.object({
  apiBaseUrl: z.string().optional(),
  enableVimMode: z.boolean().optional(),
  refreshInterval: z.number().positive().int()
});

export type Settings = z.infer<typeof $Settings>;
