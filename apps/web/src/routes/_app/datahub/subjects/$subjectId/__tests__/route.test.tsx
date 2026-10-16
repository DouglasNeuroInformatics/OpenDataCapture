import type { PropsWithChildren, ReactNode } from 'react';

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Route } from '@/routes/_app/datahub/subjects/$subjectId/route';

import '@/services/i18n';

const mocks = vi.hoisted(() => ({
  config: { setup: { isGatewayEnabled: true } },
  currentGroup: null as null | { settings: { subjectIdDisplayLength?: number } },
  outlet: (): ReactNode => 'Outlet Content',
  pathname: '/datahub/subjects/root$abcdefghijkl/table'
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
vi.mock('@/config', () => ({ config: mocks.config }));
vi.mock('@/store', () => ({
  useAppStore: (selector: (store: { currentGroup: typeof mocks.currentGroup }) => unknown) =>
    selector({ currentGroup: mocks.currentGroup })
}));

const renderLayout = () => {
  const Component = Route.options.component!;
  render(<Component />);
};

beforeEach(() => {
  mocks.config.setup.isGatewayEnabled = true;
  mocks.currentGroup = null;
  mocks.outlet = () => 'Outlet Content';
  mocks.pathname = '/datahub/subjects/root$abcdefghijkl/table';
  vi.spyOn(Route, 'useParams').mockReturnValue({ subjectId: 'root$abcdefghijkl' });
  vi.spyOn(Route, 'useSearch').mockReturnValue({});
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('subject layout route', () => {
  it('should show the unscoped subject id truncated to nine characters when the group sets no display length', () => {
    renderLayout();
    expect(screen.getByRole('heading').textContent).toBe('Instrument Records for Subject abcdefghi');
  });

  it("should truncate the subject id to the current group's display length", () => {
    mocks.currentGroup = { settings: { subjectIdDisplayLength: 4 } };
    renderLayout();
    expect(screen.getByRole('heading').textContent).toBe('Instrument Records for Subject abcd');
  });

  it('should link each tab to its page under the subject', () => {
    renderLayout();
    expect(screen.getByTestId('subject-table-tab').getAttribute('href')).toBe(
      '/datahub/subjects/root$abcdefghijkl/table'
    );
    expect(screen.getByTestId('subject-graph').getAttribute('href')).toBe('/datahub/subjects/root$abcdefghijkl/graph');
  });

  it('should highlight only the tab whose page is open', () => {
    mocks.pathname = '/datahub/subjects/root$abcdefghijkl/graph';
    renderLayout();
    expect(screen.getByTestId('subject-graph').classList.contains('border-sky-500')).toBe(true);
    expect(screen.getByTestId('subject-table-tab').classList.contains('border-sky-500')).toBe(false);
  });

  it('should offer the assignments tab when the gateway is deployed', () => {
    renderLayout();
    expect(screen.getByTestId('subject-assignment').getAttribute('href')).toBe(
      '/datahub/subjects/root$abcdefghijkl/assignments'
    );
  });

  it('should hide the assignments tab when the gateway is not deployed, since its page would redirect away', () => {
    mocks.config.setup.isGatewayEnabled = false;
    renderLayout();
    expect(screen.queryByTestId('subject-assignment')).toBeNull();
  });

  it('should return to the subject index when the subject was opened from it', () => {
    renderLayout();
    expect(screen.getByTestId('subject-hub-back').getAttribute('href')).toBe('/datahub/subjects');
  });

  // Reached from an instrument's record table, the subject belongs to that listing — returning to
  // the subject index would drop the reader somewhere they never were.
  it('should return to the instrument record table the subject was opened from', () => {
    vi.spyOn(Route, 'useSearch').mockReturnValue({ fromInstrument: 'hq-1' });
    renderLayout();
    expect(screen.getByTestId('subject-hub-back').getAttribute('href')).toBe(
      '/datahub/instruments/$instrumentId/table'
    );
  });

  it('should render the selected tab page below the tabs', () => {
    renderLayout();
    expect(screen.getByText('Outlet Content')).toBeTruthy();
  });

  it('should show a loading fallback instead of the page while the page suspends', () => {
    mocks.outlet = () => {
      throw new Promise<never>(() => undefined);
    };
    renderLayout();
    expect(screen.getByText('Loading Fallback')).toBeTruthy();
  });
});
