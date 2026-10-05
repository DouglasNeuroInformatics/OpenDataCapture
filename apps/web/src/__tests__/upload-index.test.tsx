import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Route } from '@/routes/_app/upload/index';

import '@/services/i18n';

const mocks = vi.hoisted(() => ({
  instruments: [] as { details: { title: string }; id: string; kind: string }[],
  loadingRenders: 0,
  navigate: vi.fn(),
  useInstrumentInfoQuery: vi.fn()
}));

vi.mock('@tanstack/react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tanstack/react-router')>()),
  useNavigate: () => mocks.navigate
}));
vi.mock('@/hooks/useInstrumentInfoQuery', () => ({
  useInstrumentInfoQuery: (options: unknown) => {
    mocks.useInstrumentInfoQuery(options);
    if (mocks.loadingRenders > 0) {
      mocks.loadingRenders--;
      return { data: undefined };
    }
    return { data: mocks.instruments };
  }
}));

const INSTRUMENTS = [
  { details: { title: 'Happiness Questionnaire' }, id: 'happiness', kind: 'FORM' },
  { details: { title: 'Sleep Diary' }, id: 'sleep', kind: 'FORM' }
];

const renderPage = () => {
  const Component = Route.options.component!;
  return render(<Component />);
};

describe('upload instrument selection page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.instruments = INSTRUMENTS;
    mocks.loadingRenders = 0;
  });

  afterEach(cleanup);

  it('should only request form instruments, since only forms can be uploaded from a CSV', () => {
    renderPage();
    expect(mocks.useInstrumentInfoQuery).toHaveBeenCalledWith({ params: { kind: 'FORM' } });
  });

  it('should list the title and kind of every uploadable instrument', () => {
    renderPage();
    expect(screen.getByText('Happiness Questionnaire')).toBeTruthy();
    expect(screen.getByText('Sleep Diary')).toBeTruthy();
    expect(screen.getAllByText('FORM')).toHaveLength(2);
  });

  it('should list the instruments once a query that started out loading resolves', () => {
    mocks.loadingRenders = 1;
    renderPage();
    expect(mocks.useInstrumentInfoQuery.mock.calls.length).toBeGreaterThan(1);
    expect(screen.getByText('Happiness Questionnaire')).toBeTruthy();
  });

  it('should narrow the list to instruments whose title matches the search term', () => {
    renderPage();
    fireEvent.change(screen.getByPlaceholderText('Search by Instrument Title'), { target: { value: 'sleep' } });
    expect(screen.queryByText('Happiness Questionnaire')).toBeNull();
    expect(screen.getByText('Sleep Diary')).toBeTruthy();
  });

  it('should open the upload page of the instrument that was clicked', () => {
    renderPage();
    fireEvent.click(screen.getByText('Sleep Diary'));
    expect(mocks.navigate).toHaveBeenCalledWith({ params: { instrumentId: 'sleep' }, to: '/upload/$instrumentId' });
  });
});
