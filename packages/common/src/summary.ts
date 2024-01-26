import { z } from 'zod';

export type Summary = z.infer<typeof $Summary>;
export const $Summary = z.object({
  counts: z.object({
    instruments: z.number().int(),
    records: z.number().int(),
    subjects: z.number().int(),
    users: z.number().int()
  })
});

