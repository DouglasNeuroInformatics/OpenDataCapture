import { describe, expect, it } from 'vitest';

import { resolveTheme } from '@/utils/chart-theme';

describe('resolveTheme', () => {
  it('should resolve the dark surface, which the chart colour maps are keyed on', () => {
    expect(resolveTheme('dark')).toBe('dark');
  });

  // `useTheme` may report 'system' or nothing at all, and neither keys the colour maps.
  it('should resolve anything other than dark to light, so a chart is never keyed on a missing mode', () => {
    expect(resolveTheme('light')).toBe('light');
    expect(resolveTheme('system')).toBe('light');
    expect(resolveTheme(undefined)).toBe('light');
  });
});
