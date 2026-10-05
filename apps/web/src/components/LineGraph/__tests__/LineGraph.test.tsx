import { cloneElement } from 'react';
import type { ReactElement } from 'react';

import { i18n } from '@douglasneuroinformatics/libui/i18n';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LineGraph } from '../LineGraph';

import type { LineGraphLine } from '../LineGraph';

import '@/services/i18n';

// happy-dom computes no layout, so the container would measure 0x0 and recharts would draw nothing.
vi.mock('recharts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('recharts')>()),
  ResponsiveContainer: ({ children }: { children: ReactElement<{ height: number; width: number }> }) =>
    cloneElement(children, { height: 400, width: 800 })
}));

const data = [
  { score: 10, scoreError: 1, time: new Date(2026, 0, 1, 12).getTime() },
  { score: 25, scoreError: 2, time: new Date(2026, 0, 2, 12).getTime() },
  { score: 15, scoreError: 3, time: new Date(2026, 0, 3, 12).getTime() }
];

type Line = LineGraphLine<typeof data>;

const scoreLine: Line = { name: 'Score', val: 'score' };

const renderGraph = (
  lines: Line[] = [scoreLine],
  xAxis: undefined | { key?: 'time'; label?: string } = { key: 'time' }
) => {
  const { container } = render(<LineGraph data={data} lines={lines} xAxis={xAxis} />);
  return container;
};

const lineCurves = (container: HTMLElement) => [...container.querySelectorAll('.recharts-line-curve')];

const xAxisTicks = (container: HTMLElement) =>
  [...container.querySelectorAll('.recharts-xAxis .recharts-cartesian-axis-tick-value')].map(
    (tick) => tick.textContent
  );

/** happy-dom's MouseEvent has no pageX/pageY, which recharts reads to find the hovered point. */
const hover = (container: HTMLElement, { pageX, pageY }: { pageX: number; pageY: number }) => {
  const event = new MouseEvent('mousemove', { bubbles: true });
  Object.defineProperties(event, { pageX: { value: pageX }, pageY: { value: pageY } });
  fireEvent(container.querySelector('.recharts-wrapper')!, event);
};

describe('LineGraph', () => {
  beforeEach(() => {
    void i18n.changeLanguage('en');
  });

  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it('should label the x axis ticks with ISO dates, so time points read the same in every locale', () => {
    expect(xAxisTicks(renderGraph())).toContain('2026-01-02');
  });

  it('should show the x axis label beneath the axis', () => {
    const container = renderGraph([scoreLine], { key: 'time', label: 'Date of visit' });
    expect(container.querySelector('.recharts-label')?.textContent).toBe('Date of visit');
  });

  it('should still draw the lines when no x axis is configured', () => {
    expect(lineCurves(renderGraph([scoreLine], undefined))).toHaveLength(1);
  });

  it('should label the tooltip with the full date in the interface language', () => {
    void i18n.changeLanguage('fr');
    const container = renderGraph();
    hover(container, { pageX: 420, pageY: 200 });
    expect(container.querySelector('.recharts-tooltip-label')?.textContent).toMatch(/^vendredi 2 janvier 2026/);
  });

  it('should name each line in the legend', () => {
    const container = renderGraph([scoreLine, { name: 'Error', val: 'scoreError' }]);
    expect([...container.querySelectorAll('.recharts-legend-item-text')].map((item) => item.textContent)).toEqual([
      'Score',
      'Error'
    ]);
  });

  it('should draw a line in the light theme stroke color when none is given', () => {
    expect(lineCurves(renderGraph())[0]?.getAttribute('stroke')).toBe('#475569');
  });

  it('should draw a line in the dark theme stroke color when none is given, so it stays visible on a dark page', () => {
    window.localStorage.setItem('theme', 'dark');
    expect(lineCurves(renderGraph())[0]?.getAttribute('stroke')).toBe('#cbd5e1');
  });

  it('should draw a line in the stroke color it is given', () => {
    expect(lineCurves(renderGraph([{ ...scoreLine, stroke: '#ff0000' }]))[0]?.getAttribute('stroke')).toBe('#ff0000');
  });

  it('should draw straight segments between points by default', () => {
    expect(lineCurves(renderGraph())[0]?.getAttribute('d')).not.toContain('C');
  });

  it('should draw the curve type it is given', () => {
    expect(lineCurves(renderGraph([{ ...scoreLine, type: 'monotone' }]))[0]?.getAttribute('d')).toContain('C');
  });

  // Recharts draws error bars only once the line animation has finished.
  it('should draw error bars only for the lines given an error key', { timeout: 10_000 }, async () => {
    const container = renderGraph([
      { ...scoreLine, err: 'scoreError' },
      { name: 'Error', val: 'scoreError' }
    ]);
    await waitFor(() => expect(container.querySelectorAll('.recharts-errorBars')).toHaveLength(1), { timeout: 5000 });
    expect(container.querySelectorAll('.recharts-errorBar')).toHaveLength(data.length);
  });
});
