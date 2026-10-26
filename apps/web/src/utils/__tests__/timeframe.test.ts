import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { timeframeMinDate } from '@/utils/timeframe';

describe('timeframeMinDate', () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: new Date(2026, 2, 15, 12), toFake: ['Date'] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should admit every record for all time, having no bound to apply', () => {
    expect(timeframeMinDate('all')).toBeNull();
  });

  it('should bound the past year to one year before now', () => {
    expect(timeframeMinDate('pastYear')).toStrictEqual(new Date(2025, 2, 15, 12));
  });

  it('should bound the past month to one month before now', () => {
    expect(timeframeMinDate('pastMonth')).toStrictEqual(new Date(2026, 1, 15, 12));
  });

  // The bound is relative, so a stored key answers against the day it is read rather than the day it
  // was chosen -- which is why only the key is kept in the url.
  it('should answer relative to when it is called, not when the timeframe was chosen', () => {
    const chosen = timeframeMinDate('pastYear');
    vi.setSystemTime(new Date(2027, 2, 15, 12));
    expect(timeframeMinDate('pastYear')).not.toStrictEqual(chosen);
    expect(timeframeMinDate('pastYear')).toStrictEqual(new Date(2026, 2, 15, 12));
  });
});
