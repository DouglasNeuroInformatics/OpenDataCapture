import { cloneElement } from 'react';
import type { ReactElement } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { RecordChartSeries } from '@/hooks/useRecordChartSeries';

import { RecordDistributionChart } from '../RecordDistributionChart';

import '@/services/i18n';

// happy-dom computes no layout, so the container would measure 0x0 and recharts would draw nothing.
vi.mock('recharts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('recharts')>()),
  ResponsiveContainer: ({ children }: { children: ReactElement<{ height: number; width: number }> }) =>
    cloneElement(children, { height: 400, width: 800 })
}));

const seriesOf = (key: string, color: string, values: number[]): RecordChartSeries => ({
  color,
  key,
  label: key,
  points: values.map((value, index) => ({ time: index, value }))
});

const renderChart = (series: RecordChartSeries[], isNumeric = true) => {
  const { container } = render(
    <RecordDistributionChart countLabel="Records" isNumeric={isNumeric} measureLabel="Total Score" series={series} />
  );
  return container;
};

const bars = (container: HTMLElement) => [...container.querySelectorAll('.recharts-bar')];

const tickLabels = (container: HTMLElement) =>
  [...container.querySelectorAll('.recharts-xAxis .recharts-cartesian-axis-tick-value')].map(
    (tick) => tick.textContent
  );

describe('RecordDistributionChart', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    window.localStorage.clear();
  });

  it('should draw one bar series per group, so groups can be compared bin by bin', () => {
    expect(bars(renderChart([seriesOf('a', '#111111', [1, 2]), seriesOf('b', '#222222', [2, 3])]))).toHaveLength(2);
  });

  // Recharts draws the rectangles only once the bar animation, driven by requestAnimationFrame, has finished.
  it('should draw a bar in the colour its series was assigned', async () => {
    vi.useFakeTimers({
      toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance', 'setTimeout', 'clearTimeout', 'Date']
    });
    const container = renderChart([seriesOf('a', '#111111', [1, 2])]);
    await act(() => vi.advanceTimersByTimeAsync(2000));
    expect(container.querySelector('.recharts-bar-rectangle path')?.getAttribute('fill')).toBe('#111111');
  });

  it('should label the axis with the measure being distributed', () => {
    expect(renderChart([seriesOf('a', '#111111', [1, 2])]).querySelector('.recharts-label')?.textContent).toBe(
      'Total Score'
    );
  });

  // Binning a category is meaningless, so a categorical measure gets one bar per distinct value.
  it('should count a categorical measure per distinct value rather than binning it', () => {
    const series: RecordChartSeries = {
      color: '#111111',
      key: 'a',
      label: 'a',
      points: [
        { time: 0, value: 'high' },
        { time: 1, value: 'low' }
      ]
    };
    expect(tickLabels(renderChart([series], false))).toStrictEqual(['high', 'low']);
  });

  // A single series needs no legend — the axis label already says what the bars count.
  it('should omit the legend for a single series', () => {
    expect(renderChart([seriesOf('a', '#111111', [1, 2])]).querySelector('.recharts-legend-wrapper')).toBeNull();
  });

  it('should name each group in the legend once there is more than one', () => {
    const container = renderChart([seriesOf('a', '#111111', [1, 2]), seriesOf('b', '#222222', [2, 3])]);
    expect([...container.querySelectorAll('.recharts-legend-item-text')].map((item) => item.textContent)).toStrictEqual(
      ['a', 'b']
    );
  });

  it('should draw the axes in the dark theme ink, so they stay legible on a dark page', () => {
    window.localStorage.setItem('theme', 'dark');
    const container = renderChart([seriesOf('a', '#111111', [1, 2])]);
    expect(container.querySelector('.recharts-xAxis .recharts-cartesian-axis-line')?.getAttribute('stroke')).toBe(
      '#64748b'
    );
    expect(container.querySelector('.recharts-label')?.getAttribute('fill')).toBe('#cbd5e1');
  });
});
