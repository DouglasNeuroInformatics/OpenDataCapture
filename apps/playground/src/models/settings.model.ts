import { z } from 'zod';

export const $Settings = z.object({
  enableInstrumentStorage: z.boolean(),
  refreshInterval: z.number().positive().int()
});
export type Settings = z.infer<typeof $Settings>;
