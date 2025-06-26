import { z } from 'zod/v4';

export type Summary = z.infer<typeof $Summary>;
export const $Summary = z.object({
  counts: z.object({
    instruments: z.number().int().nonnegative(),
    records: z.number().int().nonnegative(),
    subjects: z.number().int().nonnegative(),
    users: z.number().int().nonnegative()
  })
});
