import type { ReactNode } from 'react';

import { i18n } from '@douglasneuroinformatics/libui/i18n';
import type { Summary } from '@opendatacapture/schemas/summary';
import { isRedirect } from '@tanstack/react-router';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { Route } from '@/routes/_app/dashboard';

import '@/services/i18n';

type TooltipPayloadItem = { dataKey: string; value: number };

type TooltipProps = { active: boolean; label?: number; payload?: TooltipPayloadItem[] };

type CurrentGroup = { accessibleInstrumentIds: string[]; id: string; type: 'CLINICAL' | 'RESEARCH' };

type QueryResult<TData> = { data?: TData; isError?: boolean; isLoading?: boolean };

const DAY_1 = new Date(2025, 2, 1, 12).getTime();
const DAY_2 = new Date(2025, 2, 2, 12).getTime();
const DAY_3 = new Date(2025, 2, 3, 12).getTime();

const SUMMARY: Summary = {
  counts: { instruments: 2, records: 3, sessions: 5, subjects: 7, users: 2 },
  trends: {
    records: [
      { timestamp: DAY_3, value: 3 },
      { timestamp: DAY_2, value: 2 },
      { timestamp: DAY_1, value: 1 }
    ],
    sessions: [{ timestamp: DAY_3, value: 5 }],
    subjects: [
      { timestamp: DAY_2, value: 7 },
      { timestamp: DAY_1, value: 4 }
    ]
  }
};

const INSTRUMENTS = [
  { details: { title: 'Alpha Scale' }, id: 'alpha', kind: 'FORM' },
  { details: { title: 'Beta Task' }, id: 'beta', kind: 'INTERACTIVE' }
];

const RESEARCH_GROUP: CurrentGroup = { accessibleInstrumentIds: ['alpha'], id: 'group-1', type: 'RESEARCH' };

type DashboardMocks = {
  ensureQueryData: Mock<(options: unknown) => Promise<unknown>>;
  instruments: QueryResult<typeof INSTRUMENTS>;
  navigate: Mock<(options: unknown) => void>;
  records: QueryResult<{ instrumentId: string }[]>;
  store: {
    currentGroup: CurrentGroup | null;
    currentUser: null | { ability: { can: (action: string, subject: string) => boolean } };
  };
  summary: QueryResult<Summary>;
  tooltipProps: TooltipProps;
  useInstrumentRecords: Mock<(options: unknown) => void>;
  users: QueryResult<{ username: string }[]>;
  useSummaryQuery: Mock<(options: unknown) => void>;
  useUsersQuery: Mock<(options: unknown) => void>;
};

const mocks = vi.hoisted((): DashboardMocks => ({
  ensureQueryData: vi.fn(),
  instruments: {},
  navigate: vi.fn(),
  records: {},
  store: { currentGroup: null, currentUser: null },
  summary: {},
  tooltipProps: { active: false },
  useInstrumentRecords: vi.fn(),
  users: {},
  useSummaryQuery: vi.fn(),
  useUsersQuery: vi.fn()
}));

vi.mock('@/store', () => ({
  useAppStore: Object.assign((selector: (store: typeof mocks.store) => unknown) => selector(mocks.store), {
    getState: () => mocks.store
  })
}));
vi.mock('@tanstack/react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tanstack/react-router')>()),
  useNavigate: () => mocks.navigate
}));
vi.mock('@/hooks/useSummaryQuery', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/hooks/useSummaryQuery')>()),
  useSummaryQuery: (options: unknown) => {
    mocks.useSummaryQuery(options);
    return mocks.summary;
  }
}));
vi.mock('@/hooks/useInstrumentInfoQuery', () => ({ useInstrumentInfoQuery: () => mocks.instruments }));
vi.mock('@/hooks/useInstrumentRecords', () => ({
  useInstrumentRecords: (options: unknown) => {
    mocks.useInstrumentRecords(options);
    return mocks.records;
  }
}));
vi.mock('@/hooks/useUsersQuery', () => ({
  useUsersQuery: (options: unknown) => {
    mocks.useUsersQuery(options);
    return mocks.users;
  }
}));

// happy-dom computes no layout, so a real chart measures 0x0 and draws nothing; these stand-ins
// expose the props the page hands to recharts instead.
vi.mock('recharts', () => ({
  Area: ({ dataKey, stroke }: { dataKey: string; stroke: string }) => (
    <g data-stroke={stroke} data-testid={`area-${dataKey}`} />
  ),
  AreaChart: ({ children, data }: { children: ReactNode; data: unknown[] }) => (
    <svg data-points={JSON.stringify(data)} data-testid="area-chart">
      {children}
    </svg>
  ),
  CartesianGrid: ({ stroke }: { stroke: string }) => <g data-stroke={stroke} data-testid="grid" />,
  ResponsiveContainer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Tooltip: ({ content }: { content: (props: TooltipProps) => ReactNode }) => (
    <foreignObject data-testid="chart-tooltip">{content(mocks.tooltipProps)}</foreignObject>
  ),
  XAxis: ({ stroke, tickFormatter }: { stroke: string; tickFormatter: (timestamp: number) => string }) => (
    <text data-stroke={stroke} data-testid="x-axis">
      {tickFormatter(DAY_2)}
    </text>
  ),
  YAxis: () => null
}));

const renderPage = () => {
  const Component = Route.options.component!;
  return render(<Component />);
};

const recordsChart = () => within(screen.getByTestId('dashboard-chart-records-sessions'));

const subjectsChart = () => within(screen.getByTestId('dashboard-chart-subjects-growth'));

const openDialog = (statisticTestId: string, dialogTestId: string) => {
  fireEvent.click(within(screen.getByTestId(statisticTestId)).getByRole('button'));
  return screen.getByTestId(dialogTestId);
};

const listItems = (dialog: HTMLElement) => {
  return within(dialog)
    .getAllByRole('listitem')
    .map((item) => item.textContent);
};

const runLoader = async () => {
  const loader = Route.options.loader as (opts: object) => Promise<void>;
  try {
    await loader({ context: { queryClient: { ensureQueryData: mocks.ensureQueryData } } });
  } catch (err) {
    return err;
  }
  return null;
};

describe('dashboard page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    i18n.changeLanguage('en');
    mocks.store.currentGroup = null;
    mocks.summary = { data: SUMMARY };
    mocks.instruments = { data: INSTRUMENTS };
    mocks.records = { data: [{ instrumentId: 'alpha' }, { instrumentId: 'alpha' }, { instrumentId: 'beta' }] };
    mocks.users = { data: [{ username: 'alice' }, { username: 'bob' }] };
    mocks.tooltipProps = { active: false };
  });

  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it('should render nothing rather than crash when the summary is unavailable', () => {
    mocks.summary = { data: undefined };
    const { container } = renderPage();
    expect(container.innerHTML).toBe('');
  });

  it('should scope every query to the current group', () => {
    mocks.store.currentGroup = RESEARCH_GROUP;
    renderPage();
    expect(mocks.useSummaryQuery).toHaveBeenCalledWith({ params: { groupId: 'group-1' } });
    expect(mocks.useUsersQuery).toHaveBeenCalledWith({ params: { groupId: 'group-1' } });
    expect(mocks.useInstrumentRecords).toHaveBeenCalledWith({ enabled: true, params: { groupId: 'group-1' } });
  });

  it.each([
    ['CLINICAL', 'Overview of Your Clinic'],
    ['RESEARCH', 'Overview of Your Research Group']
  ] as const)('should welcome a %s group with %s', (type, heading) => {
    mocks.store.currentGroup = { ...RESEARCH_GROUP, type };
    renderPage();
    expect(screen.getByTestId('dashboard-welcome-heading').textContent).toBe(heading);
  });

  it('should summarize the whole application when no group is selected', () => {
    renderPage();
    expect(screen.getByTestId('dashboard-welcome-heading').textContent).toBe('Summary of Application State');
  });

  it('should open the data hub from the subjects statistic', () => {
    renderPage();
    fireEvent.click(screen.getByTestId('statistic-subjects'));
    expect(mocks.navigate).toHaveBeenCalledWith({ to: '/datahub' });
  });

  it('should list every user of the group in the users dialog', () => {
    renderPage();
    const dialog = openDialog('statistic-users', 'dashboard-users-Modal-dialog');
    expect(listItems(dialog)).toEqual(['alice', 'bob']);
  });

  it('should show a spinner in the users dialog while users are loading', () => {
    mocks.users = { isLoading: true };
    renderPage();
    const dialog = openDialog('statistic-users', 'dashboard-users-Modal-dialog');
    expect(dialog.querySelector('.animate-spinner')).toBeTruthy();
  });

  it('should report a failure to load users in the users dialog', () => {
    mocks.users = { isError: true };
    renderPage();
    const dialog = openDialog('statistic-users', 'dashboard-users-Modal-dialog');
    expect(within(dialog).getByText('Error finding users')).toBeTruthy();
  });

  it('should list only the instruments the current group can access', () => {
    mocks.store.currentGroup = RESEARCH_GROUP;
    renderPage();
    const dialog = openDialog('statistic-instruments', 'dashboard-instruments-Modal-dialog');
    expect(listItems(dialog)).toEqual(['Alpha Scale FORM']);
  });

  it('should list every instrument when no group is selected', () => {
    renderPage();
    const dialog = openDialog('statistic-instruments', 'dashboard-instruments-Modal-dialog');
    expect(listItems(dialog)).toEqual(['Alpha Scale FORM', 'Beta Task INTERACTIVE']);
  });

  it('should report a failure to load instruments in the instruments dialog', () => {
    mocks.instruments = { data: undefined };
    renderPage();
    const dialog = openDialog('statistic-instruments', 'dashboard-instruments-Modal-dialog');
    expect(within(dialog).getByText('Error finding instruments')).toBeTruthy();
  });

  it('should count the records of each instrument in the records dialog', () => {
    renderPage();
    const dialog = openDialog('statistic-records', 'dashboard-record-Modal-dialog');
    expect(listItems(dialog)).toEqual(['Alpha Scale 2', 'Beta Task 1']);
  });

  it('should count zero records for each instrument while records are unavailable', () => {
    mocks.records = { data: undefined };
    renderPage();
    const dialog = openDialog('statistic-records', 'dashboard-record-Modal-dialog');
    expect(listItems(dialog)).toEqual(['Alpha Scale 0', 'Beta Task 0']);
  });

  it('should report a failure to load instruments in the records dialog, since records are counted per instrument', () => {
    mocks.instruments = { data: undefined };
    renderPage();
    const dialog = openDialog('statistic-records', 'dashboard-record-Modal-dialog');
    expect(within(dialog).getByText('Error finding records')).toBeTruthy();
  });

  it('should chart records and sessions oldest first, counting a day without sessions as zero', () => {
    renderPage();
    expect(JSON.parse(recordsChart().getByTestId('area-chart').dataset.points!)).toEqual([
      { records: 1, sessions: 0, timestamp: DAY_1 },
      { records: 2, sessions: 0, timestamp: DAY_2 },
      { records: 3, sessions: 5, timestamp: DAY_3 }
    ]);
  });

  it('should chart subject growth oldest first without reordering the cached summary', () => {
    renderPage();
    expect(JSON.parse(subjectsChart().getByTestId('area-chart').dataset.points!)).toEqual([
      { timestamp: DAY_1, value: 4 },
      { timestamp: DAY_2, value: 7 }
    ]);
    expect(SUMMARY.trends.subjects[0]!.timestamp).toBe(DAY_2);
  });

  it('should label the x axis ticks of both charts with a short date', () => {
    renderPage();
    expect(recordsChart().getByTestId('x-axis').textContent).toBe('Mar 2');
    expect(subjectsChart().getByTestId('x-axis').textContent).toBe('Mar 2');
  });

  it('should show nothing in the tooltips while no point is hovered, even if recharts still holds a payload', () => {
    mocks.tooltipProps = {
      active: false,
      label: DAY_2,
      payload: [
        { dataKey: 'records', value: 2 },
        { dataKey: 'sessions', value: 4 },
        { dataKey: 'value', value: 7 }
      ]
    };
    renderPage();
    expect(recordsChart().getByTestId('chart-tooltip').textContent).toBe('');
    expect(subjectsChart().getByTestId('chart-tooltip').textContent).toBe('');
  });

  it.each([
    ['an empty payload', []],
    ['no payload', undefined]
  ])('should show nothing in the tooltips of a hovered point when recharts provides %s', (_, payload) => {
    mocks.tooltipProps = { active: true, label: DAY_2, payload };
    renderPage();
    expect(recordsChart().getByTestId('chart-tooltip').textContent).toBe('');
    expect(subjectsChart().getByTestId('chart-tooltip').textContent).toBe('');
  });

  it('should show the date, records and sessions of the hovered point', () => {
    mocks.tooltipProps = {
      active: true,
      label: DAY_2,
      payload: [
        { dataKey: 'records', value: 2 },
        { dataKey: 'sessions', value: 4 }
      ]
    };
    renderPage();
    expect(recordsChart().getByTestId('chart-tooltip').textContent).toBe('March 2, 2025Records: 2Sessions: 4');
  });

  it('should show zero for a series missing from the hovered point', () => {
    mocks.tooltipProps = { active: true, label: DAY_2, payload: [{ dataKey: 'other', value: 9 }] };
    renderPage();
    expect(recordsChart().getByTestId('chart-tooltip').textContent).toBe('March 2, 2025Records: 0Sessions: 0');
  });

  it('should show the date and subject count of the hovered point', () => {
    mocks.tooltipProps = { active: true, label: DAY_2, payload: [{ dataKey: 'value', value: 7 }] };
    renderPage();
    expect(subjectsChart().getByTestId('chart-tooltip').textContent).toBe('March 2, 2025Subjects: 7');
  });

  it('should draw the charts in the light palette by default', () => {
    renderPage();
    expect(recordsChart().getByTestId('area-records').dataset.stroke).toBe('#2563eb');
    expect(recordsChart().getByTestId('area-sessions').dataset.stroke).toBe('#059669');
    expect(subjectsChart().getByTestId('area-value').dataset.stroke).toBe('#d97706');
    expect(recordsChart().getByTestId('grid').dataset.stroke).toBe('#e2e8f0');
    expect(recordsChart().getByTestId('x-axis').dataset.stroke).toBe('#475569');
  });

  it('should draw the charts in the dark palette when the dark theme is selected', () => {
    window.localStorage.setItem('theme', 'dark');
    renderPage();
    expect(recordsChart().getByTestId('area-records').dataset.stroke).toBe('#3b82f6');
    expect(recordsChart().getByTestId('area-sessions').dataset.stroke).toBe('#10b981');
    expect(subjectsChart().getByTestId('area-value').dataset.stroke).toBe('#f59e0b');
    expect(subjectsChart().getByTestId('grid').dataset.stroke).toBe('#334155');
    expect(subjectsChart().getByTestId('x-axis').dataset.stroke).toBe('#cbd5e1');
  });

  it('should style the tooltip for the dark theme when it is selected', () => {
    window.localStorage.setItem('theme', 'dark');
    mocks.tooltipProps = { active: true, label: DAY_2, payload: [{ dataKey: 'value', value: 7 }] };
    renderPage();
    expect(subjectsChart().getByText('March 2, 2025').parentElement!.style.backgroundColor).toBe('#1e293b');
  });
});

describe('dashboard loader', () => {
  const READABLE_SUBJECTS = ['Instrument', 'InstrumentRecord', 'Session', 'Subject', 'User'];

  const grantRead = (subjects: string[]) => {
    mocks.store.currentUser = {
      ability: { can: (action, subject) => action === 'read' && subjects.includes(subject) }
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.store.currentGroup = RESEARCH_GROUP;
    mocks.ensureQueryData.mockResolvedValue(SUMMARY);
  });

  it('should send a user without a session to start a session, since the dashboard needs their permissions', async () => {
    mocks.store.currentUser = null;
    const thrown = await runLoader();
    expect(isRedirect(thrown)).toBe(true);
    expect(thrown).toMatchObject({ options: { to: '/session/start-session' } });
  });

  it('should send a user who cannot read every summarized resource to start a session instead', async () => {
    grantRead(READABLE_SUBJECTS.filter((subject) => subject !== 'User'));
    const thrown = await runLoader();
    expect(isRedirect(thrown)).toBe(true);
    expect(mocks.ensureQueryData).not.toHaveBeenCalled();
  });

  it('should prefetch the summary of the current group for a user who can read everything', async () => {
    grantRead(READABLE_SUBJECTS);
    expect(await runLoader()).toBeNull();
    expect(mocks.ensureQueryData).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ['summary', 'group-1'] }));
  });

  it('should prefetch the application-wide summary when no group is selected', async () => {
    grantRead(READABLE_SUBJECTS);
    mocks.store.currentGroup = null;
    await runLoader();
    expect(mocks.ensureQueryData).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ['summary', undefined] }));
  });
});
