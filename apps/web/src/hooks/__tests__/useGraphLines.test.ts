import { i18n } from '@douglasneuroinformatics/libui/i18n';
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { useGraphLines } from '../useGraphLines';

import '@/services/i18n';

const SCORE = { key: 'score', label: 'Score' };
const MOOD = { key: 'mood', label: 'Mood' };

// The lines are rebuilt whenever the selection changes identity, so each selection must be stable
// across renders, as it is when the graph page holds it in state.
const NO_MEASURES: { key: string; label: string }[] = [];
const ONLY_SCORE = [SCORE];
const SCORE_AND_MOOD = [SCORE, MOOD];

describe('useGraphLines', () => {
  beforeEach(() => {
    i18n.changeLanguage('en');
  });

  afterEach(cleanup);

  it('should draw no lines when no measure is selected', () => {
    const { result } = renderHook(() => useGraphLines({ selectedMeasures: NO_MEASURES }));
    expect(result.current).toEqual([]);
  });

  it('should pair each measure with a dashed group trend line in the same colour', () => {
    const { result } = renderHook(() => useGraphLines({ selectedMeasures: ONLY_SCORE }));
    expect(result.current).toEqual([
      { name: 'Score', stroke: '#D81B60', val: 'score' },
      {
        legendType: 'none',
        name: 'Score (Group Trend)',
        stroke: '#D81B60',
        strokeDasharray: '5 5',
        strokeWidth: 0.5,
        val: 'scoreGroup'
      }
    ]);
  });

  it('should give each measure its own colour, so the lines can be told apart', () => {
    const { result } = renderHook(() => useGraphLines({ selectedMeasures: SCORE_AND_MOOD }));
    expect(result.current.map((line) => [line.val, line.stroke])).toEqual([
      ['score', '#D81B60'],
      ['scoreGroup', '#D81B60'],
      ['mood', '#1E88E5'],
      ['moodGroup', '#1E88E5']
    ]);
  });

  it('should relabel the group trend when the language changes', () => {
    const { result } = renderHook(() => useGraphLines({ selectedMeasures: ONLY_SCORE }));
    act(() => {
      i18n.changeLanguage('fr');
    });
    expect(result.current[1]!.name).toBe('Score (Tendance du groupe)');
  });
});
