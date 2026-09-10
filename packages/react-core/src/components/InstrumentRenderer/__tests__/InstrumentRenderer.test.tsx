import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../ScalarInstrumentRenderer', () => ({
  ScalarInstrumentRenderer: () => <div data-testid="scalar-instrument-renderer" />
}));
vi.mock('../SeriesInstrumentRenderer', () => ({
  SeriesInstrumentRenderer: () => <div data-testid="series-instrument-renderer" />
}));

const { InstrumentRenderer } = await import('../InstrumentRenderer');

describe('InstrumentRenderer', () => {
  afterEach(cleanup);

  it('should render SeriesInstrumentRenderer for a SERIES target', () => {
    render(<InstrumentRenderer target={{ kind: 'SERIES' } as any} onSubmit={vi.fn()} />);
    expect(screen.getByTestId('series-instrument-renderer')).toBeTruthy();
  });

  it('should render ScalarInstrumentRenderer for a non-SERIES target', () => {
    render(<InstrumentRenderer target={{ kind: 'FORM' } as any} onSubmit={vi.fn()} />);
    expect(screen.getByTestId('scalar-instrument-renderer')).toBeTruthy();
  });
});
