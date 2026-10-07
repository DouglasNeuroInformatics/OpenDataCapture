import { describe, expect, it } from 'vitest';

import {
  DEFAULT_COLLECTED_FILTER,
  matchesCollectedFilter,
  presetMinDate,
  selectCollectedPreset
} from '@/utils/collected-filter';

const daysAgo = (count: number) => new Date(Date.now() - count * 24 * 60 * 60 * 1000);

describe('presetMinDate', () => {
  it('should leave the window open at both ends for any time, so nothing is excluded by default', () => {
    expect(presetMinDate('all')).toBeNull();
  });

  // `custom` means the user owns the bounds, so the preset itself contributes none.
  it('should contribute no lower bound for a custom window', () => {
    expect(presetMinDate('custom')).toBeNull();
  });

  it.each(['pastWeek', 'pastMonth', 'pastThreeMonths', 'pastSixMonths', 'pastYear', 'pastTwoYears'] as const)(
    'should put the %s lower bound in the past',
    (preset) => {
      expect(presetMinDate(preset)!.getTime()).toBeLessThan(Date.now());
    }
  );

  it('should order the windows so a longer one reaches further back', () => {
    expect(presetMinDate('pastWeek')!.getTime()).toBeGreaterThan(presetMinDate('pastYear')!.getTime());
  });
});

describe('matchesCollectedFilter', () => {
  it('should admit a date inside the window', () => {
    expect(matchesCollectedFilter(daysAgo(2), { max: null, min: daysAgo(7), preset: 'pastWeek' })).toBe(true);
  });

  it('should reject a date before the lower bound', () => {
    expect(matchesCollectedFilter(daysAgo(30), { max: null, min: daysAgo(7), preset: 'pastWeek' })).toBe(false);
  });

  it('should reject a date after the upper bound', () => {
    expect(matchesCollectedFilter(daysAgo(1), { max: daysAgo(7), min: null, preset: 'custom' })).toBe(false);
  });

  // A row with nothing collected has no date to compare, so only an open window can keep it.
  it('should keep a row with no date only while the window is any time', () => {
    expect(matchesCollectedFilter(null, DEFAULT_COLLECTED_FILTER)).toBe(true);
    expect(matchesCollectedFilter(null, { max: null, min: daysAgo(7), preset: 'pastWeek' })).toBe(false);
  });
});

describe('selectCollectedPreset', () => {
  it('should let a preset own both bounds, so an earlier custom window does not linger', () => {
    const previous = { max: daysAgo(1), min: daysAgo(90), preset: 'custom' } as const;
    const next = selectCollectedPreset('pastWeek', previous);
    expect(next.max).toBeNull();
    expect(next.min).toStrictEqual(expect.any(Date));
  });

  // Switching to custom seeds the dates from the window already on screen, so the inputs open as a
  // nudge rather than blank.
  it('should seed a custom window from the preset it replaces', () => {
    const next = selectCollectedPreset('custom', DEFAULT_COLLECTED_FILTER);
    expect(next.preset).toBe('custom');
    expect(next.min).toBe(presetMinDate('all'));
  });

  it('should keep the bounds the user typed while the window stays custom', () => {
    const previous = { max: daysAgo(1), min: daysAgo(30), preset: 'custom' } as const;
    expect(selectCollectedPreset('custom', previous)).toStrictEqual(previous);
  });
});
