/** The timeframe a record listing can be narrowed to, as stored in the URL. */
type TimeframeKey = (typeof TIMEFRAME_KEYS)[number];

const TIMEFRAME_KEYS = ['all', 'pastMonth', 'pastYear'] as const;

/**
 * The earliest collection date a timeframe admits, or `null` for `all`, which admits every record.
 *
 * The bound is relative to now, so only the key is ever stored and the date is derived from it. A
 * link carrying an absolute date would still read "past year" months later while bounded to the
 * instant it was shared.
 */
function timeframeMinDate(key: TimeframeKey): Date | null {
  const now = new Date();
  if (key === 'pastMonth') {
    return new Date(new Date(now).setMonth(now.getMonth() - 1));
  }
  if (key === 'pastYear') {
    return new Date(new Date(now).setFullYear(now.getFullYear() - 1));
  }
  return null;
}

export { TIMEFRAME_KEYS, timeframeMinDate };
export type { TimeframeKey };
