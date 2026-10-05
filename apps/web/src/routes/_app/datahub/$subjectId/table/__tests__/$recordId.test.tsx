import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import { bilingualFileInstrument } from '@opendatacapture/instrument-stubs/file';
import { unilingualFormInstrument } from '@opendatacapture/instrument-stubs/forms';
import { translateInstrument } from '@opendatacapture/instrument-utils';
import type { InstrumentSummaryProps } from '@opendatacapture/react-core';
import type { AnyUnilingualInstrument } from '@opendatacapture/runtime-core';
import type { $InstrumentRecordFiles, InstrumentRecord } from '@opendatacapture/schemas/instrument-records';
import type { Subject } from '@opendatacapture/schemas/subject';
import { QueryClient } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Route } from '@/routes/_app/datahub/$subjectId/table/$recordId';

import '@/services/i18n';

const mocks = vi.hoisted(() => ({
  instrumentRecordQueryOptions: vi.fn(({ params }: { params: { id: string } }) => ({
    queryKey: ['record', params.id]
  })),
  subjectQueryOptions: vi.fn(({ params }: { params: { id: string } }) => ({ queryKey: ['subject', params.id] })),
  useInstrument: vi.fn(),
  useInstrumentRecordFilesQuery: vi.fn(),
  useInstrumentRecordQuery: vi.fn(),
  useSubjectQuery: vi.fn()
}));

vi.mock('@/hooks/useInstrument', () => ({ useInstrument: mocks.useInstrument }));
vi.mock('@/hooks/useInstrumentRecordFilesQuery', () => ({
  useInstrumentRecordFilesQuery: mocks.useInstrumentRecordFilesQuery
}));
vi.mock('@/hooks/useInstrumentRecordQuery', () => ({
  instrumentRecordQueryOptions: mocks.instrumentRecordQueryOptions,
  useInstrumentRecordQuery: mocks.useInstrumentRecordQuery
}));
vi.mock('@/hooks/useSubjectQuery', () => ({
  subjectQueryOptions: mocks.subjectQueryOptions,
  useSubjectQuery: mocks.useSubjectQuery
}));
vi.mock('@opendatacapture/react-core', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@opendatacapture/react-core')>()),
  InstrumentSummary: ({ data, displayAllMeasures, subject, timeCollected }: InstrumentSummaryProps) => (
    <span
      data-all-measures={String(displayAllMeasures)}
      data-record-data={JSON.stringify(data)}
      data-subject-id={subject?.id}
      data-testid="instrument-summary"
      data-time-collected={timeCollected}
    />
  )
}));

const subject: Subject = {
  createdAt: new Date(2025, 0, 1),
  groupIds: ['group-1'],
  id: 'subject-1',
  updatedAt: new Date(2025, 0, 1)
};

const createRecord = (overrides: Partial<InstrumentRecord> = {}): InstrumentRecord => ({
  createdAt: new Date(2026, 0, 16),
  data: { score: 7 },
  date: new Date(2026, 0, 15, 10, 30),
  id: 'record-1',
  instrumentId: 'instrument-1',
  sessionId: 'session-1',
  subjectId: 'subject-1',
  updatedAt: new Date(2026, 0, 16),
  ...overrides
});

const fileInstrument = translateInstrument(bilingualFileInstrument.instance, 'en');
const formInstrument: AnyUnilingualInstrument = { ...unilingualFormInstrument.instance, measures: null };

let files: $InstrumentRecordFiles = {};
let currentInstrument: AnyUnilingualInstrument | null = null;
let currentRecord = createRecord();

const scan = { exp: 0, name: 'scan.nii', size: 2048, url: 'https://storage.example.org/scan.nii' };

const renderRecord = ({
  instrument = fileInstrument,
  record = createRecord()
}: { instrument?: AnyUnilingualInstrument | null; record?: InstrumentRecord } = {}) => {
  currentInstrument = instrument;
  currentRecord = record;
  const Component = Route.options.component!;
  return render(<Component />);
};

const clickDownload = () => {
  fireEvent.click(screen.getByRole('button', { name: 'Download' }));
};

beforeEach(() => {
  files = {};
  mocks.useInstrument.mockImplementation(() => currentInstrument);
  mocks.useInstrumentRecordFilesQuery.mockImplementation(() => ({ data: files }));
  mocks.useInstrumentRecordQuery.mockImplementation(() => ({ data: currentRecord }));
  mocks.useSubjectQuery.mockImplementation(() => ({ data: subject }));
  useNotificationsStore.setState({ notifications: [] });
  vi.spyOn(Route, 'useParams').mockImplementation((opts) =>
    opts!.select!({ recordId: 'record-1', subjectId: 'subject-1' })
  );
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('instrument record loader', () => {
  it('should prefetch the record in the url and then the subject it belongs to', async () => {
    const queryClient = new QueryClient();
    const ensureQueryData = vi
      .spyOn(queryClient, 'ensureQueryData')
      .mockResolvedValueOnce(createRecord({ subjectId: 'subject-9' }))
      .mockResolvedValueOnce(subject);
    const { loader } = Route.options;
    if (typeof loader !== 'function') {
      throw new Error('Expected the route to define a loader function');
    }
    await loader({ context: { queryClient }, params: { recordId: 'record-1', subjectId: 'subject-1' } } as Parameters<
      typeof loader
    >[0]);
    expect(ensureQueryData.mock.calls).toEqual([
      [{ queryKey: ['record', 'record-1'] }],
      [{ queryKey: ['subject', 'subject-9'] }]
    ]);
  });
});

describe('instrument record route', () => {
  it('should query the record in the url and the subject it belongs to', () => {
    renderRecord({ record: createRecord({ subjectId: 'subject-9' }) });
    expect(mocks.useInstrumentRecordQuery).toHaveBeenCalledWith({ params: { id: 'record-1' } });
    expect(mocks.useSubjectQuery).toHaveBeenCalledWith({ params: { id: 'subject-9' } });
  });

  it('should render nothing while the instrument of the record has not loaded', () => {
    const { container } = renderRecord({ instrument: null });
    expect(container.childElementCount).toBe(0);
  });

  it('should summarize a non-file record with every measure, its data, subject and collection time', () => {
    renderRecord({ instrument: formInstrument });
    const summary = screen.getByTestId('instrument-summary');
    expect(summary.dataset).toMatchObject({
      allMeasures: 'true',
      recordData: '{"score":7}',
      subjectId: 'subject-1',
      timeCollected: String(new Date(2026, 0, 16).getTime())
    });
  });
});

describe('file instrument record view', () => {
  it('should show the instrument title and the date the record was completed', () => {
    renderRecord();
    expect(screen.getByRole('heading', { level: 3 }).textContent).toBe('Arbitrary File');
    expect(screen.getByText(/^Completed on January 15, 2026/)).toBeTruthy();
  });

  it('should show that the upload is pending instead of the files of a pending record', () => {
    files = { file: [scan] };
    renderRecord({ record: createRecord({ pending: true }) });
    expect(screen.getByText('Upload pending')).toBeTruthy();
    expect(screen.queryByText('scan.nii')).toBeNull();
  });

  it('should query the files of the record', () => {
    renderRecord();
    expect(mocks.useInstrumentRecordFilesQuery).toHaveBeenCalledWith({ params: { id: 'record-1' } });
  });

  it('should show that a file group has no files when none were uploaded to it', () => {
    renderRecord();
    expect(screen.getByRole('heading', { level: 5 }).textContent).toBe('File');
    expect(screen.getByText('No files')).toBeTruthy();
  });

  it('should list the name and size of each file uploaded to a file group', () => {
    files = { file: [scan] };
    renderRecord();
    expect(screen.getByText('scan.nii')).toBeTruthy();
    expect(screen.getByText('2.0 KiB')).toBeTruthy();
  });

  it('should save a downloaded file under its own name and release the object url afterwards', async () => {
    files = { file: [scan] };
    const blob = new Blob(['scan']);
    const fetchMock = vi.fn(() => Promise.resolve(new Response(blob)));
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:scan');
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockReturnValue(undefined);
    const clicked: { download: string; href: string; isConnected: boolean }[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      clicked.push({ download: this.download, href: this.href, isConnected: this.isConnected });
    });
    renderRecord();
    clickDownload();
    await waitFor(() => expect(revokeObjectURL).toHaveBeenCalledWith('blob:scan'));
    expect(fetchMock).toHaveBeenCalledWith(scan.url);
    expect(clicked).toEqual([{ download: 'scan.nii', href: 'blob:scan', isConnected: true }]);
    expect(document.querySelector('a[download]')).toBeNull();
  });

  it('should notify the user and log the error when a file cannot be downloaded', async () => {
    files = { file: [scan] };
    vi.stubGlobal('fetch', () => Promise.resolve(new Response(null, { status: 404 })));
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    renderRecord();
    clickDownload();
    await waitFor(() =>
      expect(useNotificationsStore.getState().notifications).toMatchObject([
        { message: 'An unexpected error occurred', title: 'Error', type: 'error' }
      ])
    );
    expect(consoleError).toHaveBeenCalledWith(new Error('Failed to download (404)'));
  });
});
