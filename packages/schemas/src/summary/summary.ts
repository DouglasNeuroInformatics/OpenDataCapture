import { z } from 'zod/v4';

const $Trend = z.array(
  z.object({
    timestamp: z.int().nonnegative(),
    value: z.int().nonnegative()
  })
);

/** How far back a dashboard trend reaches; `default` is the original five points thirty days apart. */
export type SummaryTrendWindow = z.infer<typeof $SummaryTrendWindow>;
export const $SummaryTrendWindow = z.enum([
  'default',
  'pastMonth',
  'past3Months',
  'past6Months',
  'pastYear',
  'past2Years',
  'past5Years',
  'all'
]);

export type SummaryQueryParams = z.infer<typeof $SummaryQueryParams>;
export const $SummaryQueryParams = z.object({
  groupId: z.string().optional(),
  /** The window of the records and sessions trends, which share a chart */
  recordTrendWindow: $SummaryTrendWindow.default('default'),
  subjectTrendWindow: $SummaryTrendWindow.default('default')
});

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
