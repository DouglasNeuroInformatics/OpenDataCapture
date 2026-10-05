import type { FC } from 'react';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import '@/routes/_app/instruments/accessible-instruments';
import '@/services/i18n';

type InstrumentInfoStub = { details: { title: string }; id: string; kind: 'FORM' };

type MockState = {
  instrumentInfo: InstrumentInfoStub[] | undefined;
  route: { component: FC };
  store: { currentGroup: null | { accessibleInstrumentIds: string[] } };
};

const mocks = vi.hoisted(() => {
  const state: MockState = {
    instrumentInfo: undefined,
    route: { component: () => null },
    store: { currentGroup: null }
  };
  return { ...state, navigate: vi.fn() };
});

vi.mock('@tanstack/react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tanstack/react-router')>()),
  createFileRoute: () => (options: { component: FC }) => {
    mocks.route = options;
    return { options };
  },
  useNavigate: () => mocks.navigate
}));
vi.mock('@/components/InstrumentShowcase', () => ({
  InstrumentShowcase: ({
    data,
    onSelect
  }: {
    data: InstrumentInfoStub[];
    onSelect: (info: InstrumentInfoStub) => void;
  }) => (
    <div data-testid="instrument-search-bar">
      <input />
      {data.map((instrument) => (
        <button key={instrument.id} type="button" onClick={() => onSelect(instrument)}>
          {instrument.details.title}
        </button>
      ))}
    </div>
  )
}));
vi.mock('@/hooks/useInstrumentInfoQuery', () => ({
  useInstrumentInfoQuery: () => ({ data: mocks.instrumentInfo })
}));
vi.mock('@/store', () => ({
  useAppStore: (selector: (store: typeof mocks.store) => unknown) => selector(mocks.store)
}));

const AccessibleInstrumentsPage = mocks.route.component;

const allowed: InstrumentInfoStub = { details: { title: 'Allowed' }, id: 'instrument-1', kind: 'FORM' };
const excluded: InstrumentInfoStub = { details: { title: 'Excluded' }, id: 'instrument-2', kind: 'FORM' };

beforeEach(() => {
  mocks.instrumentInfo = [allowed, excluded];
  mocks.store.currentGroup = { accessibleInstrumentIds: ['instrument-1'] };
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('AccessibleInstrumentsPage', () => {
  it('should show the page title', () => {
    render(<AccessibleInstrumentsPage />);
    expect(screen.getByRole('heading', { name: 'Administer Instrument' })).toBeTruthy();
  });

  it('should list only the instruments the current group may administer', () => {
    render(<AccessibleInstrumentsPage />);
    expect(screen.getByRole('button', { name: 'Allowed' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Excluded' })).toBeNull();
  });

  it('should show a loading fallback instead of the showcase while the instruments load', () => {
    mocks.instrumentInfo = undefined;
    render(<AccessibleInstrumentsPage />);
    expect(screen.queryByTestId('instrument-search-bar')).toBeNull();
  });

  it('should focus the search bar on arrival, so the clinician can type a name straight away', () => {
    render(<AccessibleInstrumentsPage />);
    expect(document.activeElement).toBe(screen.getByRole('textbox'));
  });

  it('should open the selected instrument, passing its info along to avoid refetching it', () => {
    render(<AccessibleInstrumentsPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Allowed' }));
    expect(mocks.navigate).toHaveBeenCalledWith({
      params: { id: 'instrument-1' },
      state: { info: allowed },
      to: '/instruments/render/$id'
    });
  });
});
