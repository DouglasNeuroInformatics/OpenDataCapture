import { z } from 'zod/v4';

export type $Trend = z.infer<typeof $Trend>;
export const $Trend = z.array(
  z.object({
    timestamp: z.int().nonnegative(),
    value: z.int().nonnegative()
  })
);

export type Summary = z.infer<typeof $Summary>;
export const $Summary = z.object({
  counts: z.object({
    instruments: z.number().int().nonnegative(),
    records: z.number().int().nonnegative(),
    sessions: z.number().int().nonnegative(),
    subjects: z.number().int().nonnegative(),
    users: z.number().int().nonnegative()
  }),
  trends: z.object({
    records: $Trend,
    sessions: $Trend,
    subjects: $Trend
  })
});
