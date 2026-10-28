import { cloneElement } from 'react';
import type { ReactElement } from 'react';

import { i18n } from '@douglasneuroinformatics/libui/i18n';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { RecordChartSeries } from '@/hooks/useRecordChartSeries';

import { RecordScatterChart } from '../RecordScatterChart';

import '@/services/i18n';

// happy-dom computes no layout, so the container would measure 0x0 and recharts would draw nothing.
vi.mock('recharts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('recharts')>()),
  ResponsiveContainer: ({ children }: { children: ReactElement<{ height: number; width: number }> }) => {
    return cloneElement(children, { height: 400, width: 800 });
  }
}));

const JANUARY_SECOND = new Date(2026, 0, 2, 12).getTime();

const seriesOf = (key: string, color: string): RecordChartSeries => ({
  color,
  key,
  label: key,
  points: [
    { time: new Date(2026, 0, 1, 12).getTime(), value: 10 },
    { time: JANUARY_SECOND, value: 20 }
  ]
});

const renderChart = ({
  series = [seriesOf('a', '#111111')],
  trend
}: { series?: RecordChartSeries[]; trend?: { intercept: number; slope: number } } = {}) => {
  const { container } = render(
    <RecordScatterChart measureLabel="Total Score" series={series} trend={trend} xLabel="Date Collected" />
  );
  return container;
};

/**
 * A scatter's tooltip is triggered by the mark rather than by the chart area, and recharts draws the
 * marks only once its animation, driven by requestAnimationFrame, has finished.
 */
const hoverFirstMark = async (container: HTMLElement) => {
  await act(() => vi.advanceTimersByTimeAsync(2000));
  fireEvent.mouseOver(container.querySelector('.recharts-symbols')!);
};

describe('RecordScatterChart', () => {
  beforeEach(() => {
    void i18n.changeLanguage('en');
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    window.localStorage.clear();
  });

  it('should draw one scatter per group, so a group can be read apart from the rest', () => {
    const container = renderChart({ series: [seriesOf('a', '#111111'), seriesOf('b', '#222222')] });
    expect(container.querySelectorAll('.recharts-scatter')).toHaveLength(2);
  });

  // Recharts draws the marks only once the scatter animation, driven by requestAnimationFrame, has finished.
  it('should draw a mark in the colour its series was assigned', async () => {
    vi.useFakeTimers({
      toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance', 'setTimeout', 'clearTimeout', 'Date']
    });
    const container = renderChart();
    await act(() => vi.advanceTimersByTimeAsync(2000));
    expect(container.querySelector('.recharts-symbols')?.getAttribute('fill')).toBe('#111111');
  });

  it('should label the x axis ticks with ISO dates, so time points read the same in every locale', () => {
    const ticks = [
      ...renderChart().querySelectorAll('.recharts-xAxis-tick-labels .recharts-cartesian-axis-tick-value')
    ].map((tick) => tick.textContent);
    expect(ticks).toContain('2026-01-02');
  });

  it('should label the x axis with what the dates are', () => {
    const labels = [...renderChart().querySelectorAll('.recharts-label')].map((label) => label.textContent);
    expect(labels).toStrictEqual(['Date Collected']);
  });

  // The regression is computed group-wide, so it is drawn rather than recomputed per selection.
  it('should draw a trend line across the plotted range when a regression is given', () => {
    expect(renderChart({ trend: { intercept: 0, slope: 1 } }).querySelector('.recharts-reference-line')).toBeTruthy();
  });

  it('should span the trend line from the earliest point even when it comes last in the data', () => {
    const reversed: RecordChartSeries = {
      color: '#111111',
      key: 'a',
      label: 'a',
      points: [
        { time: JANUARY_SECOND, value: 20 },
        { time: new Date(2026, 0, 1, 12).getTime(), value: 10 }
      ]
    };
    expect(
      renderChart({ series: [reversed], trend: { intercept: 0, slope: 1 } }).querySelector('.recharts-reference-line')
    ).toBeTruthy();
  });

  it('should draw no trend line when there is no regression', () => {
    expect(renderChart().querySelector('.recharts-reference-line')).toBeNull();
  });

  // A regression with nothing plotted has no range to span, so there is no segment to draw.
  it('should draw no trend line for a regression with no points to span', () => {
    const empty: RecordChartSeries = { color: '#111111', key: 'a', label: 'a', points: [] };
    expect(
      renderChart({ series: [empty], trend: { intercept: 0, slope: 1 } }).querySelector('.recharts-reference-line')
    ).toBeNull();
  });

  it('should omit the legend for a single series', () => {
    expect(renderChart().querySelector('.recharts-legend-wrapper')).toBeNull();
  });

  it('should name each group in the legend once there is more than one', () => {
    const container = renderChart({ series: [seriesOf('a', '#111111'), seriesOf('b', '#222222')] });
    expect([...container.querySelectorAll('.recharts-legend-item-text')].map((item) => item.textContent)).toStrictEqual(
      ['a', 'b']
    );
  });

  const tooltipRows = (container: HTMLElement) => {
    return [...container.querySelectorAll('.recharts-tooltip-item')].map((item) => [
      item.querySelector('.recharts-tooltip-item-name')?.textContent,
      item.querySelector('.recharts-tooltip-item-value')?.textContent
    ]);
  };

  it('should name the tooltip rows after the axes rather than the underlying keys', async () => {
    vi.useFakeTimers({
      toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance', 'setTimeout', 'clearTimeout', 'Date']
    });
    const container = renderChart();
    await hoverFirstMark(container);
    expect(tooltipRows(container).map(([name]) => name)).toStrictEqual(['Date Collected', 'Total Score']);
  });

  // The axis ticks are ISO, but the tooltip is prose and so follows the interface language. A raw
  // epoch is what the row shows if the date is left unformatted.
  it('should show the collection date in the interface language rather than its epoch', async () => {
    void i18n.changeLanguage('fr');
    vi.useFakeTimers({
      toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance', 'setTimeout', 'clearTimeout', 'Date']
    });
    const container = renderChart();
    await hoverFirstMark(container);
    expect(tooltipRows(container)).toStrictEqual([
      ['Date Collected', '1 janv. 2026'],
      ['Total Score', '10']
    ]);
  });

  it('should draw the axes in the dark theme ink, so they stay legible on a dark page', () => {
    window.localStorage.setItem('theme', 'dark');
    expect(renderChart().querySelector('.recharts-label')?.getAttribute('fill')).toBe('#cbd5e1');
  });
});
