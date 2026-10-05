import type { FC } from 'react';

import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import type { InstrumentSubmitHandler } from '@opendatacapture/react-core';
import type { Session } from '@opendatacapture/schemas/session';
import type { Subject } from '@opendatacapture/schemas/subject';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import '@/routes/_app/instruments/render/$id';
import '@/services/i18n';

type InstrumentRendererProps = { onSubmit: InstrumentSubmitHandler; subject?: Subject; target: unknown };

type AxiosRequestConfigStub = { onUploadProgress: (event: { loaded: number }) => void };

type MockState = {
  bundle: unknown;
  locationState: { info?: { clientDetails?: { title?: string }; details: { title: string } } };
  route: { component: FC };
  store: { currentGroup: null | { id: string }; currentSession: null | Session };
};

const mocks = vi.hoisted(() => {
  const state: MockState = {
    bundle: undefined,
    locationState: {},
    route: { component: () => null },
    store: { currentGroup: null, currentSession: null }
  };
  return {
    ...state,
    axios: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
    InstrumentRenderer: vi.fn((_props: InstrumentRendererProps) => <div data-testid="instrument-renderer" />),
    navigate: vi.fn()
  };
});

vi.mock('axios', () => ({ default: mocks.axios }));
vi.mock('@tanstack/react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tanstack/react-router')>()),
  createFileRoute: () => (options: { component: FC }) => {
    mocks.route = options;
    return { options, useParams: () => ({ id: 'instrument-1' }) };
  },
  useLocation: () => ({ state: mocks.locationState }),
  useNavigate: () => mocks.navigate
}));
vi.mock('@opendatacapture/react-core', () => ({ InstrumentRenderer: mocks.InstrumentRenderer }));
vi.mock('@/hooks/useInstrumentBundle', () => ({ useInstrumentBundle: () => ({ data: mocks.bundle }) }));
vi.mock('@/store', () => ({
  useAppStore: (selector: (store: typeof mocks.store) => unknown) => selector(mocks.store)
}));

const subject: Subject = {
  createdAt: new Date('2026-01-01'),
  groupIds: ['group-1'],
  id: 'subject-1',
  updatedAt: new Date('2026-01-01')
};

const createSession = (sessionSubject: null | Subject = subject): Session => ({
  createdAt: new Date('2026-01-01'),
  date: new Date('2026-02-01'),
  groupId: 'group-1',
  id: 'session-1',
  subject: sessionSubject,
  subjectId: 'subject-1',
  type: 'IN_PERSON',
  updatedAt: new Date('2026-01-01')
});

const InstrumentRenderPage = mocks.route.component;

const rendererProps = () => mocks.InstrumentRenderer.mock.lastCall![0];

const submit: InstrumentSubmitHandler = async (context) => {
  render(<InstrumentRenderPage />);
  await rendererProps().onSubmit(context);
};

const createFileContext = (uploadMap: { [basename: string]: File[] }) => ({
  data: {},
  instrumentId: 'instrument-1',
  kind: 'FILE' as const,
  onNext: vi.fn(),
  onProgress: vi.fn(),
  uploadMap
});

const scanA = new File(['a'], 'a.nii', { type: 'application/octet-stream' });
const scanB = new File(['bb'], 'b.nii', { type: 'application/octet-stream' });

const presignedUrl = (index: number) => ({ location: { basename: 'scans', index }, url: `https://s3/${index}` });

beforeEach(() => {
  mocks.bundle = { bundle: '__BUNDLE__', id: 'instrument-1', kind: 'FORM' };
  mocks.locationState = { info: { details: { title: 'Details Title' } } };
  mocks.store.currentGroup = { id: 'group-1' };
  mocks.store.currentSession = createSession();
  mocks.axios.post.mockResolvedValue({ data: { id: 'record-1' } });
  mocks.axios.put.mockResolvedValue({});
  useNotificationsStore.setState({ notifications: [] });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('InstrumentRenderPage', () => {
  it('should show a spinner instead of the instrument while its bundle loads', () => {
    mocks.bundle = undefined;
    render(<InstrumentRenderPage />);
    expect(screen.queryByTestId('instrument-renderer')).toBeNull();
    expect(screen.queryByRole('heading')).toBeNull();
  });

  it('should render the loaded bundle for the subject of the current session', () => {
    render(<InstrumentRenderPage />);
    expect(rendererProps()).toMatchObject({ subject, target: mocks.bundle });
  });

  it('should render without a subject when the session has none', () => {
    mocks.store.currentSession = createSession(null);
    render(<InstrumentRenderPage />);
    expect(rendererProps().subject).toBeUndefined();
  });

  it('should render without a subject when there is no session', () => {
    mocks.store.currentSession = null;
    render(<InstrumentRenderPage />);
    expect(rendererProps().subject).toBeUndefined();
  });

  it('should title the page with the client-facing title when the instrument has one', () => {
    mocks.locationState = { info: { clientDetails: { title: 'Client Title' }, details: { title: 'Details Title' } } };
    render(<InstrumentRenderPage />);
    expect(screen.getByRole('heading', { name: 'Client Title' })).toBeTruthy();
  });

  it('should title the page with the instrument title when there is no client-facing one', () => {
    render(<InstrumentRenderPage />);
    expect(screen.getByRole('heading', { name: 'Details Title' })).toBeTruthy();
  });

  it('should fall back to a generic title when the page is opened without instrument info', () => {
    mocks.locationState = {};
    render(<InstrumentRenderPage />);
    expect(screen.getByRole('heading', { name: 'Instrument' })).toBeTruthy();
  });

  it('should send the user back to the instrument list when there is no session to record into', () => {
    mocks.store.currentSession = null;
    render(<InstrumentRenderPage />);
    expect(mocks.navigate).toHaveBeenCalledWith({ ignoreBlocker: true, to: '/instruments/accessible-instruments' });
  });

  it('should stay on the page while a session is active', () => {
    render(<InstrumentRenderPage />);
    expect(mocks.navigate).not.toHaveBeenCalled();
  });
});

describe('submitting a result', () => {
  it('should record a form result against the current session, subject and group', async () => {
    await submit({ data: { score: 1 }, instrumentId: 'instrument-1', kind: 'FORM' });
    expect(mocks.axios.post).toHaveBeenCalledWith('/v1/instrument-records', {
      data: { score: 1 },
      date: new Date('2026-02-01'),
      groupId: 'group-1',
      instrumentId: 'instrument-1',
      seriesInstrumentId: undefined,
      sessionId: 'session-1',
      subjectId: 'subject-1'
    });
  });

  it('should notify the user once a non-file result is recorded', async () => {
    await submit({ data: {}, instrumentId: 'instrument-1', kind: 'INTERACTIVE' });
    expect(useNotificationsStore.getState().notifications).toMatchObject([{ type: 'success' }]);
  });

  it('should record a series item with the id of the series that orchestrated it', async () => {
    await submit({
      complete: false,
      data: {},
      index: 0,
      instrumentId: 'item-1',
      kind: 'SERIES',
      seriesInstrumentId: 'series-1'
    });
    expect(mocks.axios.post).toHaveBeenCalledWith(
      '/v1/instrument-records',
      expect.objectContaining({ instrumentId: 'item-1', seriesInstrumentId: 'series-1' })
    );
  });

  it('should record a result without a group when none is selected', async () => {
    mocks.store.currentGroup = null;
    await submit({ data: {}, instrumentId: 'instrument-1', kind: 'FORM' });
    expect(mocks.axios.post).toHaveBeenCalledWith(
      '/v1/instrument-records',
      expect.objectContaining({ groupId: undefined })
    );
  });

  it('should upload each file of a file result to its presigned url, without the app credentials', async () => {
    mocks.axios.get.mockResolvedValue({ data: { scans: [presignedUrl(0), presignedUrl(1)] } });
    await submit(createFileContext({ scans: [scanA, scanB] }));
    expect(mocks.axios.get).toHaveBeenCalledWith('/v1/instrument-records/record-1/files/upload-urls');
    expect(mocks.axios.put.mock.calls).toEqual([
      [
        'https://s3/0',
        scanA,
        expect.objectContaining({ meta: { disableDefaultAuth: true, disableDefaultTimeout: true } })
      ],
      ['https://s3/1', scanB, expect.objectContaining({ headers: { 'Content-Type': 'application/octet-stream' } })]
    ]);
  });

  it('should report upload progress and each finished file back to the instrument', async () => {
    const context = createFileContext({ scans: [scanA] });
    mocks.axios.get.mockResolvedValue({ data: { scans: [presignedUrl(0)] } });
    mocks.axios.put.mockImplementation((_url: string, _file: File, config: AxiosRequestConfigStub) => {
      config.onUploadProgress({ loaded: 1 });
      return Promise.resolve({});
    });
    await submit(context);
    expect(context.onProgress).toHaveBeenCalledWith(scanA, { loaded: 1 });
    expect(context.onNext).toHaveBeenCalledOnce();
  });

  it('should confirm the uploads with the location, name and size of every file', async () => {
    mocks.axios.get.mockResolvedValue({ data: { scans: [presignedUrl(0), presignedUrl(1)] } });
    await submit(createFileContext({ scans: [scanA, scanB] }));
    expect(mocks.axios.post).toHaveBeenLastCalledWith('/v1/instrument-records/record-1/files/upload-complete', {
      uploads: {
        scans: [
          { location: { basename: 'scans', index: 0 }, name: 'a.nii', size: 1 },
          { location: { basename: 'scans', index: 1 }, name: 'b.nii', size: 2 }
        ]
      }
    });
  });

  it('should refuse to upload anything when a file group has more files than presigned urls', async () => {
    mocks.axios.get.mockResolvedValue({ data: { scans: [presignedUrl(0)] } });
    await expect(submit(createFileContext({ scans: [scanA, scanB] }))).rejects.toThrow(
      "Files to upload (2) for file group with basename 'scans' exceeds available presigned URLs (1)"
    );
    expect(mocks.axios.put).not.toHaveBeenCalled();
  });

  it('should refuse to upload a file group the server offers no urls for', async () => {
    mocks.axios.get.mockResolvedValue({ data: { scans: null } });
    await expect(submit(createFileContext({ scans: [scanA] }))).rejects.toThrow(
      /basename 'scans' exceeds available presigned URLs/
    );
    expect(mocks.axios.put).not.toHaveBeenCalled();
  });

  it('should check every file group before uploading, so one the instrument lacks does not mask an oversized one', async () => {
    mocks.axios.get.mockResolvedValue({ data: { extra: [presignedUrl(0)], scans: [presignedUrl(0)] } });
    await expect(submit(createFileContext({ scans: [scanA, scanB] }))).rejects.toThrow(
      "Files to upload (2) for file group with basename 'scans' exceeds available presigned URLs (1)"
    );
    expect(mocks.axios.put).not.toHaveBeenCalled();
  });

  it('should not notify on a file result, since the upload progress already reports completion', async () => {
    mocks.axios.get.mockResolvedValue({ data: {} });
    await submit(createFileContext({}));
    expect(useNotificationsStore.getState().notifications).toEqual([]);
  });
});
