import type { FC } from 'react';

import type { Language } from '@opendatacapture/schemas/core';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Route } from '@/routes/_app/instruments/accessible-instruments';

import '@/services/i18n';

type InstrumentInfoStub = {
  details: { title: string };
  id: string;
  /** A file instrument needs neither, so the stubs that stand in for one carry neither. */
  internal?: { edition: number; name: string };
  kind: 'FILE' | 'FORM';
  supportedLanguages?: string[];
};

type MockState = {
  activeLanguages: string[];
  instrumentInfo: InstrumentInfoStub[] | undefined;
  store: { currentGroup: null | { accessibleInstrumentIds: string[] } };
};

const mocks = vi.hoisted(() => {
  const state: MockState = {
    activeLanguages: ['en', 'fr', 'es'],
    instrumentInfo: undefined,
    store: { currentGroup: null }
  };
  return { ...state, navigate: vi.fn(), showcaseProps: vi.fn() };
});

vi.mock('@tanstack/react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tanstack/react-router')>()),
  createFileRoute: () => (options: { component: FC }) => ({ options }),
  useNavigate: () => mocks.navigate
}));
// The real showcase owns the per-card language dropdown; this stub reports the languages it was
// given and hands one back, which is all this route is responsible for.
vi.mock('@/components/InstrumentShowcase', () => ({
  InstrumentShowcase: (props: {
    allowedLanguages?: readonly Language[];
    data: InstrumentInfoStub[];
    onSelect: (info: InstrumentInfoStub, language?: Language) => void;
  }) => {
    mocks.showcaseProps(props);
    return (
      <div data-testid="instrument-search-bar">
        <input />
        {props.data.map((instrument) => (
          <button key={instrument.id} type="button" onClick={() => props.onSelect(instrument, 'fr')}>
            {instrument.details.title}
          </button>
        ))}
      </div>
    );
  }
}));
vi.mock('@/hooks/useInstrumentInfoQuery', () => ({
  useInstrumentInfoQuery: () => ({ data: mocks.instrumentInfo })
}));
vi.mock('@/hooks/useSetupStateQuery', () => ({
  useSetupStateQuery: () => ({ data: { activeLanguages: mocks.activeLanguages } })
}));
vi.mock('@/store', () => ({
  useAppStore: (selector: (store: typeof mocks.store) => unknown) => selector(mocks.store)
}));

const AccessibleInstrumentsPage = Route.options.component!;

const allowed: InstrumentInfoStub = {
  details: { title: 'Allowed' },
  id: 'instrument-1',
  internal: { edition: 1, name: 'Allowed' },
  kind: 'FORM',
  supportedLanguages: ['en', 'fr']
};
const excluded: InstrumentInfoStub = {
  details: { title: 'Excluded' },
  id: 'instrument-2',
  internal: { edition: 1, name: 'Excluded' },
  kind: 'FORM',
  supportedLanguages: ['en']
};

describe('Route', () => {
  beforeEach(() => {
    mocks.activeLanguages = ['en', 'fr', 'es'];
    mocks.instrumentInfo = [allowed, excluded];
    mocks.store.currentGroup = { accessibleInstrumentIds: ['instrument-1'] };
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('should show the page title', () => {
    render(<AccessibleInstrumentsPage />);
    expect(screen.getByRole('heading', { name: 'Administer Instrument' })).toBeTruthy();
  });

  it('should list only the instruments the current group may administer', () => {
    render(<AccessibleInstrumentsPage />);
    expect(screen.getByRole('button', { name: 'Allowed' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Excluded' })).toBeNull();
  });

  // Only the gateway cannot deliver a file instrument's uploads, so the in-person list must not
  // inherit the remote assignment page's exclusion.
  it('should offer a file instrument the group may administer, since an in-person session can take its uploads', () => {
    mocks.instrumentInfo = [{ details: { title: 'File Upload' }, id: 'instrument-3', kind: 'FILE' }];
    mocks.store.currentGroup = { accessibleInstrumentIds: ['instrument-3'] };
    render(<AccessibleInstrumentsPage />);
    expect(screen.getByRole('button', { name: 'File Upload' })).toBeTruthy();
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

  it('should offer the showcase only the languages the instance has active', () => {
    mocks.activeLanguages = ['en', 'fr'];
    render(<AccessibleInstrumentsPage />);
    expect(mocks.showcaseProps).toHaveBeenCalledWith(expect.objectContaining({ allowedLanguages: ['en', 'fr'] }));
  });

  it('should open the instrument in the language its card was left on, with no further step', () => {
    render(<AccessibleInstrumentsPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Allowed' }));
    expect(mocks.navigate).toHaveBeenCalledWith({
      params: { id: 'instrument-1' },
      search: { language: 'fr' },
      state: { info: allowed },
      to: '/instruments/render/$id'
    });
  });
});
