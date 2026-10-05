import type { LinearRegressionResults } from '@opendatacapture/schemas/instrument-records';
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useGraphData } from '../useGraphData';

import type { InstrumentVisualizationRecord } from '../useInstrumentVisualization';

const record = (time: number, measures: { [key: string]: number }): InstrumentVisualizationRecord => ({
  __date__: new Date(time),
  __id__: `record-${time}`,
  __instrumentId__: 'instrument-1',
  __method__: 'IN_PERSON',
  __seriesId__: null,
  __seriesName__: null,
  __subjectId__: 'subject-1',
  __time__: time,
  ...measures
});

const SCORE = { key: 'score', label: 'Score' };

describe('useGraphData', () => {
  it('should keep only the selected measures, so unselected ones are not plotted', () => {
    const { result } = renderHook(() =>
      useGraphData({ records: [record(1, { mood: 3, score: 10 })], selectedMeasures: [SCORE] })
    );
    expect(result.current).toEqual([{ __time__: 1, score: 10 }]);
  });

  it('should order the points by time, so the line is drawn left to right', () => {
    const { result } = renderHook(() =>
      useGraphData({
        records: [
          record(3, { score: 30 }),
          record(1, { score: 10 }),
          record(2, { score: 20 }),
          record(2, { score: 21 })
        ],
        selectedMeasures: [SCORE]
      })
    );
    expect(result.current.map(({ __time__ }) => __time__)).toEqual([1, 2, 2, 3]);
  });

  it('should add the regression line for a measure with a model, rounded to two decimals', () => {
    const models: LinearRegressionResults = { score: { intercept: 1, slope: 0.3333, stdErr: 0 } };
    const { result } = renderHook(() =>
      useGraphData({ models, records: [record(2, { mood: 3, score: 10 })], selectedMeasures: [SCORE] })
    );
    expect(result.current).toEqual([{ __time__: 2, score: 10, scoreGroup: 1.67 }]);
  });

  it('should plot no points when there are no records', () => {
    const { result } = renderHook(() => useGraphData({ records: [], selectedMeasures: [SCORE] }));
    expect(result.current).toEqual([]);
  });
});
