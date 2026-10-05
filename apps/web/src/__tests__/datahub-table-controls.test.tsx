import type { InstrumentRecordsExport } from '@opendatacapture/schemas/instrument-records';
import type { Subject } from '@opendatacapture/schemas/subject';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { pack } from 'msgpackr/pack';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Route } from '@/routes/_app/datahub/index';

import '@/services/i18n';

type StoreGroup = { id: string; settings: { subjectIdDisplayLength?: number } };

const mocks = vi.hoisted(() => ({
  addNotification: vi.fn(),
  axios: { get: vi.fn() },
  download: vi.fn(),
  downloadExcel: vi.fn(),
  navigate: vi.fn(),
  store: {
    currentGroup: null as null | StoreGroup,
    currentUser: { username: 'jdoe' }
  },
  subjects: [] as Subject[],
  subjectsQueryOptions: vi.fn((options: object) => ({ options, queryKey: ['subjects'] })),
  subjectsWithRecords: [] as Subject[]
}));

vi.mock('@tanstack/react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tanstack/react-router')>()),
  useNavigate: () => mocks.navigate
}));
vi.mock('@douglasneuroinformatics/libui/hooks', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@douglasneuroinformatics/libui/hooks')>()),
  useDownload: () => mocks.download,
  useNotificationsStore: (selector: (store: { addNotification: typeof mocks.addNotification }) => unknown) =>
    selector({ addNotification: mocks.addNotification })
}));
vi.mock('axios', () => ({ default: mocks.axios }));
vi.mock('@/components/IdentificationForm', () => ({
  IdentificationForm: ({ onSubmit }: { onSubmit: (data: { id: string }) => void }) => (
    <button data-testid="identification-form-submit" type="button" onClick={() => onSubmit({ id: 'lookup-id' })} />
  )
}));
vi.mock('@/hooks/useSubjectsQuery', () => ({
  subjectsQueryOptions: mocks.subjectsQueryOptions,
  useSubjectsQuery: ({ params }: { params: { hasRecord?: boolean } }) => ({
    data: params.hasRecord ? mocks.subjectsWithRecords : mocks.subjects
  })
}));
vi.mock('@/store', () => ({
  useAppStore: Object.assign((selector: (store: typeof mocks.store) => unknown) => selector(mocks.store), {
    getState: () => mocks.store
  })
}));
vi.mock('@/utils/excel', () => ({ downloadExcel: mocks.downloadExcel }));

const subject = (id: string, overrides: Partial<Subject> = {}): Subject => ({
  createdAt: new Date('2026-01-01'),
  dateOfBirth: null,
  groupIds: ['group-1'],
  id,
  sex: null,
  updatedAt: new Date('2026-01-01'),
  ...overrides
});

const ALICE = subject('ROOT$alice-1234567890', { dateOfBirth: new Date('1990-05-01'), sex: 'MALE' });
const BOB = subject('ROOT$bob', { dateOfBirth: new Date('2005-01-01'), sex: 'FEMALE' });
const CAROL = subject('ROOT$carol');

const exportEntry = (subjectId: string): InstrumentRecordsExport[number] => ({
  groupId: 'group-1',
  instrumentEdition: 1,
  instrumentName: 'HAPPINESS_QUESTIONNAIRE',
  measure: 'overallHappiness',
  sessionDate: '2026-01-01',
  sessionId: 'session-1',
  sessionType: 'IN_PERSON',
  subjectAge: 30,
  subjectId,
  subjectSex: 'MALE',
  timestamp: '2026-01-01T00:00:00.000Z',
  username: 'jdoe',
  value: 7
});

const renderDataHub = () => {
  const Component = Route.options.component!;
  render(<Component />);
};

const listedSubjects = () => screen.queryAllByTestId('data-table-row').map((row) => row.firstElementChild!.textContent);

const openFilters = () => fireEvent.keyDown(screen.getByTestId('datahub-filters-trigger'), { key: 'Enter' });

/** The filter menu reads the column filters when it renders, so reopening it shows their current state. */
const reopenFilters = () => {
  fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' });
  openFilters();
};

const filterGroup = (index: number) => within(screen.getAllByRole('group')[index]!);

const sexFilter = (name: string) => filterGroup(0).getByRole('menuitemcheckbox', { name });

const dateOfBirthInputs = () => {
  const [min, max] = filterGroup(1).getAllByDisplayValue('');
  return { max: max!, min: min! };
};

const exportAs = (option: string) => {
  fireEvent.keyDown(screen.getByRole('button', { name: 'Export' }), { key: 'Enter' });
  fireEvent.click(screen.getByRole('menuitem', { name: option }));
};

const resolveExport = (entries: InstrumentRecordsExport) => {
  mocks.axios.get.mockResolvedValue({ data: pack(entries) });
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.store.currentGroup = { id: 'group-1', settings: {} };
  mocks.subjects = [ALICE, BOB, CAROL];
  mocks.subjectsWithRecords = [BOB];
  vi.spyOn(Route, 'useNavigate').mockReturnValue(mocks.navigate);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('data hub route', () => {
  it('should prefetch the current group subjects before rendering', async () => {
    const loader = Route.options.loader as (opts: {
      context: { queryClient: { ensureQueryData: (options: unknown) => Promise<unknown> } };
    }) => Promise<void>;
    const ensureQueryData = vi.fn().mockResolvedValue([]);
    await loader({ context: { queryClient: { ensureQueryData } } });
    expect(mocks.subjectsQueryOptions).toHaveBeenCalledWith({ params: { groupId: 'group-1' } });
    expect(ensureQueryData).toHaveBeenCalledWith(mocks.subjectsQueryOptions.mock.results[0]!.value);
  });

  it('should open the subject table when a row is double-clicked', () => {
    renderDataHub();
    fireEvent.doubleClick(screen.getAllByTestId('data-table-row')[1]!);
    expect(mocks.navigate).toHaveBeenCalledWith({ to: './ROOT$bob/table' });
  });

  it('should open the subject table from the view row action', () => {
    renderDataHub();
    fireEvent.keyDown(screen.getAllByTestId('row-actions-trigger')[0]!, { key: 'Enter' });
    fireEvent.click(screen.getByRole('menuitem', { name: 'View' }));
    expect(mocks.navigate).toHaveBeenCalledWith({ to: './ROOT$alice-1234567890/table' });
  });

  it('should mark a clicked row as selected', () => {
    renderDataHub();
    const row = screen.getAllByTestId('data-table-row')[0]!;
    fireEvent.click(row);
    expect(row.querySelector('[data-row-selected]')!.getAttribute('data-row-selected')).toBe('true');
  });
});

describe('data hub subject columns', () => {
  it('should show unscoped subject ids cut to nine characters when the group sets no display length', () => {
    renderDataHub();
    expect(listedSubjects()).toEqual(['alice-123', 'bob', 'carol']);
  });

  it('should cut subject ids to the display length the group sets', () => {
    mocks.store.currentGroup = { id: 'group-1', settings: { subjectIdDisplayLength: 3 } };
    renderDataHub();
    expect(listedSubjects()).toEqual(['ali', 'bob', 'car']);
  });

  it('should show each date of birth as an ISO date, or NULL when it is unknown', () => {
    renderDataHub();
    const dates = screen.getAllByTestId('data-table-row').map((row) => row.children[1]!.textContent);
    expect(dates).toEqual(['1990-05-01', '2005-01-01', 'NULL']);
  });

  it('should show each sex by name, or NULL when it is unknown', () => {
    renderDataHub();
    const sexes = screen.getAllByTestId('data-table-row').map((row) => row.children[2]!.textContent);
    expect(sexes).toEqual(['Male', 'Female', 'NULL']);
  });

  it('should match the search against subject ids case-insensitively', () => {
    renderDataHub();
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'BOB' } });
    expect(listedSubjects()).toEqual(['bob']);
  });

  it('should never list a subject whose unscoped id is empty', () => {
    mocks.subjects = [subject('ROOT$'), BOB];
    renderDataHub();
    expect(listedSubjects()).toEqual(['bob']);
  });
});

describe('data hub filters', () => {
  it.each([
    ['Male', ['bob', 'carol']],
    ['Female', ['alice-123', 'carol']],
    ['NULL', ['alice-123', 'bob']]
  ])('should hide subjects whose sex is %s when that option is unchecked', (option, expected) => {
    renderDataHub();
    openFilters();
    fireEvent.click(sexFilter(option));
    expect(listedSubjects()).toEqual(expected);
  });

  it.each(['Male', 'Female', 'NULL'])('should list %s subjects again when that option is rechecked', (option) => {
    renderDataHub();
    openFilters();
    fireEvent.click(sexFilter(option));
    reopenFilters();
    fireEvent.click(sexFilter(option));
    expect(listedSubjects()).toEqual(['alice-123', 'bob', 'carol']);
  });

  it('should hide subjects born before the minimum date of birth', () => {
    renderDataHub();
    openFilters();
    fireEvent.change(dateOfBirthInputs().min, { target: { value: '2000-01-01' } });
    expect(listedSubjects()).toEqual(['bob', 'carol']);
  });

  it('should hide subjects born after the maximum date of birth', () => {
    renderDataHub();
    openFilters();
    fireEvent.change(dateOfBirthInputs().max, { target: { value: '2000-01-01' } });
    expect(listedSubjects()).toEqual(['alice-123', 'carol']);
  });

  it('should keep the chosen date of birth bounds in the inputs when the menu is reopened', () => {
    renderDataHub();
    openFilters();
    const { max, min } = dateOfBirthInputs();
    fireEvent.change(min, { target: { value: '1980-01-01' } });
    fireEvent.change(max, { target: { value: '2010-01-01' } });
    reopenFilters();
    expect(filterGroup(1).getByDisplayValue('1980-01-01')).toBeTruthy();
    expect(filterGroup(1).getByDisplayValue('2010-01-01')).toBeTruthy();
  });

  it('should hide subjects with no date of birth when the date of birth NULL option is unchecked', () => {
    renderDataHub();
    openFilters();
    fireEvent.click(filterGroup(1).getByRole('menuitemcheckbox', { name: 'NULL' }));
    expect(listedSubjects()).toEqual(['alice-123', 'bob']);
  });

  it('should list only subjects with records when that option is checked', () => {
    renderDataHub();
    openFilters();
    fireEvent.click(screen.getByTestId('datahub-filter-has-records'));
    expect(listedSubjects()).toEqual(['bob']);
  });
});

describe('data hub subject lookup', () => {
  const lookUp = () => {
    fireEvent.click(screen.getByTestId('subject-lookup-search-button'));
    fireEvent.click(screen.getByTestId('identification-form-submit'));
  };

  it('should treat a missing subject as an answer rather than a request error', () => {
    mocks.axios.get.mockResolvedValue({ data: {}, status: 404 });
    renderDataHub();
    lookUp();
    const { validateStatus } = mocks.axios.get.mock.calls[0]![1] as { validateStatus: (status: number) => boolean };
    expect(mocks.axios.get.mock.calls[0]![0]).toBe('/v1/subjects/lookup-id');
    expect([200, 404, 500].map(validateStatus)).toEqual([true, true, false]);
  });

  it('should warn and close the lookup when the subject does not exist', async () => {
    mocks.axios.get.mockResolvedValue({ data: {}, status: 404 });
    renderDataHub();
    lookUp();
    await waitFor(() => expect(screen.queryByTestId('datahub-subject-lookup-dialog')).toBeNull());
    expect(mocks.addNotification).toHaveBeenCalledWith({ message: 'Not Found', type: 'warning' });
  });

  it('should open the subject table of a subject that is found', async () => {
    mocks.axios.get.mockResolvedValue({ data: { id: 'ROOT$bob' }, status: 200 });
    renderDataHub();
    lookUp();
    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith({ to: './ROOT$bob/table' }));
    expect(mocks.addNotification).toHaveBeenCalledWith({ type: 'success' });
  });
});

describe('data hub export', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  it('should request the export of the current group as binary', () => {
    resolveExport([exportEntry('bob')]);
    renderDataHub();
    exportAs('JSON');
    expect(mocks.axios.get).toHaveBeenCalledWith('/v1/instrument-records/export', {
      meta: { disableDefaultTimeout: true },
      params: { groupId: 'group-1' },
      responseType: 'arraybuffer'
    });
  });

  it('should tell the user the export has started, since it can take a while', () => {
    resolveExport([exportEntry('bob')]);
    renderDataHub();
    exportAs('JSON');
    expect(mocks.addNotification).toHaveBeenCalledWith({ message: 'Exporting entries, please wait...', type: 'info' });
  });

  it('should export only the entries of subjects the table lists', async () => {
    resolveExport([exportEntry('bob'), exportEntry('carol')]);
    renderDataHub();
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'bob' } });
    exportAs('JSON');
    await waitFor(() => expect(mocks.download).toHaveBeenCalled());
    const [filename, content] = mocks.download.mock.calls[0]! as [string, string];
    expect(filename).toMatch(/^jdoe_.+\.json$/);
    expect(JSON.parse(content)).toEqual([exportEntry('bob')]);
  });

  it('should download a CSV together with a README explaining its long format', async () => {
    resolveExport([exportEntry('bob')]);
    renderDataHub();
    exportAs('CSV');
    await waitFor(() => expect(mocks.download).toHaveBeenCalledTimes(2));
    expect(mocks.download.mock.calls[0]![0]).toBe('README.txt');
    expect(mocks.download.mock.calls[0]![1]).toMatch(/ultra-long format/);
    expect(mocks.download.mock.calls[1]![0]).toMatch(/^jdoe_.+\.csv$/);
    expect(mocks.download.mock.calls[1]![1]).toMatch(/^groupId,.+\r\ngroup-1,.+,bob,/);
  });

  it('should write an Excel workbook of the listed entries', async () => {
    resolveExport([exportEntry('bob')]);
    renderDataHub();
    exportAs('Excel');
    await waitFor(() =>
      expect(mocks.downloadExcel).toHaveBeenCalledWith(expect.stringMatching(/^jdoe_.+\.xlsx$/), [exportEntry('bob')])
    );
  });

  it('should confirm a successful export', async () => {
    resolveExport([exportEntry('bob')]);
    renderDataHub();
    exportAs('JSON');
    await waitFor(() =>
      expect(mocks.addNotification).toHaveBeenCalledWith({ message: 'Export successful', type: 'success' })
    );
  });

  it('should fail the export when none of its entries belong to a listed subject', async () => {
    resolveExport([exportEntry('someone-else')]);
    renderDataHub();
    exportAs('JSON');
    await waitFor(() =>
      expect(mocks.addNotification).toHaveBeenCalledWith({
        message: 'Export failed: No entries to export',
        type: 'error'
      })
    );
    expect(mocks.download).not.toHaveBeenCalled();
  });

  it('should report a generic failure when the request fails without an error message', async () => {
    mocks.axios.get.mockRejectedValue('network down');
    renderDataHub();
    exportAs('JSON');
    await waitFor(() =>
      expect(mocks.addNotification).toHaveBeenCalledWith({ message: 'Export failed', type: 'error' })
    );
    expect(console.error).toHaveBeenCalledWith('network down');
  });
});

describe('data hub table controls', () => {
  // happy-dom computes no layout, so the wrapping is asserted through its utility classes;
  // testing/src/specs/datahub.spec.ts measures the rendered result at phone width.
  it('should let the controls wrap below the md breakpoint, so a phone never pushes Export off screen', () => {
    mocks.store.currentGroup = null;
    renderDataHub();
    const controls = screen.getByTestId('subject-lookup-search-button').parentElement!;
    expect([...controls.classList]).toEqual(expect.arrayContaining(['flex-wrap', 'md:flex-nowrap']));
  });
});
