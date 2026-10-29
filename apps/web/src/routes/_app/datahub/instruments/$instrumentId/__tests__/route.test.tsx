import type { PropsWithChildren, ReactNode } from 'react';

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Route } from '@/routes/_app/datahub/instruments/$instrumentId/route';

import '@/services/i18n';

const mocks = vi.hoisted(() => ({
  facets: { isSeries: false, title: null as null | string },
  outlet: (): ReactNode => 'Outlet Content',
  pathname: '/datahub/instruments/hq-1/table'
}));

vi.mock('@tanstack/react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tanstack/react-router')>()),
  Link: ({ children, className, to, ...props }: PropsWithChildren<{ className: string; to: string }>) => (
    <a className={className} href={to} {...props}>
      {children}
    </a>
  ),
  Outlet: () => mocks.outlet(),
  useLocation: () => ({ pathname: mocks.pathname })
}));
vi.mock('@/components/LoadingFallback', () => ({ LoadingFallback: () => 'Loading Fallback' }));
vi.mock('@/hooks/useInstrumentHubFacets', () => ({ useInstrumentHubFacets: () => mocks.facets }));

const renderLayout = () => {
  const Component = Route.options.component!;
  render(<Component />);
};

const noop = () => undefined;

describe('Route', () => {
  beforeEach(() => {
    mocks.facets = { isSeries: false, title: 'Happiness Questionnaire' };
    mocks.outlet = () => 'Outlet Content';
    mocks.pathname = '/datahub/instruments/hq-1/table';
    vi.spyOn(Route, 'useParams').mockReturnValue({ instrumentId: 'hq-1' });
    vi.spyOn(Route, 'useSearch').mockReturnValue({ chart: 'scatter', colourBy: 'none', palette: 'default' });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('should name the opened instrument in the heading', () => {
    renderLayout();
    expect(screen.getByRole('heading').textContent).toBe('Happiness Questionnaire');
  });

  // The catalog resolves after the first paint, so the heading needs something to show meanwhile.
  it('should fall back to a generic heading before the instrument is named', () => {
    mocks.facets = { isSeries: false, title: null };
    renderLayout();
    expect(screen.getByRole('heading').textContent).toBe('Instrument');
  });

  it('should link each tab to its page under the instrument', () => {
    renderLayout();
    expect(screen.getByTestId('instrument-hub-table-tab').getAttribute('href')).toBe('/datahub/instruments/hq-1/table');
    expect(screen.getByTestId('instrument-hub-graph-tab').getAttribute('href')).toBe('/datahub/instruments/hq-1/graph');
  });

  it('should highlight only the tab whose page is open', () => {
    mocks.pathname = '/datahub/instruments/hq-1/graph';
    renderLayout();
    expect(screen.getByTestId('instrument-hub-graph-tab').classList.contains('border-sky-500')).toBe(true);
    expect(screen.getByTestId('instrument-hub-table-tab').classList.contains('border-sky-500')).toBe(false);
  });

  // A series orchestrates records across the instruments it composes, so it has no shared measures
  // to chart and the graph tab would open on nothing.
  it('should offer no tabs for a series, which has no measures to chart', () => {
    mocks.facets = { isSeries: true, title: 'Happiness Series' };
    renderLayout();
    expect(screen.queryByTestId('instrument-hub-graph-tab')).toBeNull();
    expect(screen.queryByTestId('instrument-hub-table-tab')).toBeNull();
  });

  it('should return to the instrument index when the instrument was opened from it', () => {
    renderLayout();
    expect(screen.getByTestId('instrument-hub-back').getAttribute('href')).toBe('/datahub/instruments');
  });

  // Reached by drilling into a series, the instrument belongs to that series' listing — returning to
  // the index would drop the reader somewhere they never were.
  it('should return to the series the instrument was opened from', () => {
    vi.spyOn(Route, 'useSearch').mockReturnValue({
      chart: 'scatter',
      colourBy: 'none',
      fromSeries: 'series-1',
      palette: 'default'
    });
    renderLayout();
    expect(screen.getByTestId('instrument-hub-back').getAttribute('href')).toBe(
      '/datahub/instruments/$instrumentId/table'
    );
  });

  it('should render the selected tab page below the tabs', () => {
    renderLayout();
    expect(screen.getByText('Outlet Content')).toBeTruthy();
  });

  it('should show a loading fallback instead of the page while the page suspends', () => {
    mocks.outlet = () => {
      throw new Promise<never>(noop);
    };
    renderLayout();
    expect(screen.getByText('Loading Fallback')).toBeTruthy();
  });

  // The router JSON-parses each search value before validating it, so `?minRecords=5` arrives as a number.
  describe('minRecords search', () => {
    type SearchValidator = { safeParse: (search: unknown) => { data?: { minRecords: number }; success: boolean } };
    const validateSearch = Route.options.validateSearch as SearchValidator;

    it('should default to no minimum', () => {
      expect(validateSearch.safeParse({}).data?.minRecords).toBe(0);
    });

    it.each([0, 5])('should accept %j', (minRecords) => {
      expect(validateSearch.safeParse({ minRecords }).data?.minRecords).toBe(minRecords);
    });

    it.each(['', '5', 'many', null, -1, 1.5])(
      'should reject %j, rather than filter on some other minimum',
      (minRecords) => {
        expect(validateSearch.safeParse({ minRecords }).success).toBe(false);
      }
    );
  });
});
