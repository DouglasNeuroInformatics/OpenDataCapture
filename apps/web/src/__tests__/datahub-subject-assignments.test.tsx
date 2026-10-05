import type { Assignment, AssignmentStatus } from '@opendatacapture/schemas/assignment';
import { isRedirect } from '@tanstack/react-router';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { AssignmentEmailFormProps } from '@/components/AssignmentEmailForm';
import { Route } from '@/routes/_app/datahub/subjects/$subjectId/assignments';

import '@/services/i18n';

type InstrumentInfoStub = { details: { title: string }; id: string; supportedLanguages: string[] };

const mocks = vi.hoisted(() => ({
  assignments: undefined as Assignment[] | undefined,
  config: { setup: { isGatewayEnabled: true } },
  instrumentInfo: undefined as InstrumentInfoStub[] | undefined,
  isInstrumentLoaded: true,
  mutate: vi.fn(),
  useAssignmentsQuery: vi.fn(),
  useInstrument: vi.fn()
}));

vi.mock('@/config', () => ({ config: mocks.config }));
vi.mock('@/hooks/useAssignmentsQuery', () => ({ useAssignmentsQuery: mocks.useAssignmentsQuery }));
vi.mock('@/hooks/useInstrument', () => ({ useInstrument: mocks.useInstrument }));
vi.mock('@/hooks/useInstrumentInfoQuery', () => ({
  useInstrumentInfoQuery: () => ({ data: mocks.instrumentInfo })
}));
vi.mock('@/hooks/useUpdateAssignment', () => ({ useUpdateAssignment: () => ({ mutate: mocks.mutate }) }));
vi.mock('@/components/QRCode', () => ({
  QRCode: ({ url }: { url: string }) => <span data-testid="qr-code">{url}</span>
}));
vi.mock('@/components/AssignmentEmailForm', () => ({
  AssignmentEmailForm: ({ assignment, instrumentLanguages }: AssignmentEmailFormProps) => (
    <span
      data-assignment-id={assignment?.id}
      data-languages={instrumentLanguages?.join(',')}
      data-testid="assignment-email-form"
    />
  )
}));

const createAssignment = (overrides: Partial<Assignment> = {}): Assignment => ({
  completedAt: null,
  createdAt: new Date(2026, 0, 15),
  expiresAt: new Date(2026, 6, 1),
  id: 'assignment-1',
  instrumentId: 'instrument-1',
  status: 'OUTSTANDING',
  subjectId: 'subject-1',
  updatedAt: new Date(2026, 0, 15),
  url: 'https://gateway.example.org/assignments/assignment-1',
  ...overrides
});

const renderAssignments = (assignments: Assignment[] | undefined) => {
  mocks.assignments = assignments;
  const Component = Route.options.component!;
  render(<Component />);
};

const openAssignment = (index = 0) => {
  fireEvent.click(screen.getAllByTestId('assignment-row')[index]!);
};

const runGuard = () => {
  const beforeLoad = Route.options.beforeLoad as (opts: { params: { subjectId: string } }) => void;
  try {
    beforeLoad({ params: { subjectId: 'subject-1' } });
  } catch (err) {
    return err;
  }
  return null;
};

beforeEach(() => {
  mocks.config.setup.isGatewayEnabled = true;
  mocks.isInstrumentLoaded = true;
  mocks.instrumentInfo = [
    { details: { title: 'Happiness Questionnaire' }, id: 'instrument-1', supportedLanguages: ['en', 'fr'] }
  ];
  mocks.useAssignmentsQuery.mockImplementation(() => ({ data: mocks.assignments }));
  mocks.useInstrument.mockImplementation((id: null | string) =>
    id && mocks.isInstrumentLoaded ? { details: { title: 'Loaded Instrument' } } : null
  );
  vi.spyOn(Route, 'useParams').mockReturnValue({ subjectId: 'subject-1' });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe('subject assignments route guard', () => {
  it('should redirect to the subject table when the gateway is not deployed, since assignments cannot be served', () => {
    mocks.config.setup.isGatewayEnabled = false;
    const thrown = runGuard();
    expect(isRedirect(thrown)).toBe(true);
    expect(thrown).toMatchObject({ options: { params: { subjectId: 'subject-1' }, to: '/datahub/$subjectId/table' } });
  });

  it('should allow the route when the gateway is deployed', () => {
    expect(runGuard()).toBeNull();
  });
});

describe('subject assignments table', () => {
  it('should query the assignments of the subject in the url', () => {
    renderAssignments([]);
    expect(mocks.useAssignmentsQuery).toHaveBeenCalledWith({ params: { subjectId: 'subject-1' } });
  });

  it('should render no rows while the assignments have not loaded', () => {
    renderAssignments(undefined);
    expect(screen.queryAllByTestId('assignment-row')).toHaveLength(0);
  });

  it('should show the instrument title and the assigned and expiry dates of each assignment', () => {
    renderAssignments([createAssignment()]);
    const cells = within(screen.getByTestId('assignment-row')).getAllByRole('cell');
    expect(cells.map((cell) => cell.textContent)).toEqual([
      'Happiness Questionnaire',
      '2026-01-15',
      '2026-07-01',
      'Outstanding'
    ]);
  });

  it('should fall back to the instrument id when the instrument is not among the known instruments', () => {
    mocks.instrumentInfo = undefined;
    renderAssignments([createAssignment()]);
    expect(within(screen.getByTestId('assignment-row')).getAllByRole('cell')[0]!.textContent).toBe('instrument-1');
  });

  it.each<[AssignmentStatus, string]>([
    ['CANCELED', 'Canceled'],
    ['COMPLETE', 'Complete'],
    ['EXPIRED', 'Expired'],
    ['OUTSTANDING', 'Outstanding']
  ])('should display the %s status as %s', (status, label) => {
    renderAssignments([createAssignment({ status })]);
    expect(within(screen.getByTestId('assignment-row')).getAllByRole('cell')[3]!.textContent).toBe(label);
  });

  it('should mark only the clicked row as selected', () => {
    renderAssignments([createAssignment(), createAssignment({ id: 'assignment-2' })]);
    openAssignment(1);
    const rows = screen.getAllByTestId('assignment-row');
    expect(rows.map((row) => row.getAttribute('data-state'))).toEqual([null, 'selected']);
  });
});

describe('subject assignment sheet', () => {
  it('should stay closed until an assignment is selected', () => {
    renderAssignments([createAssignment()]);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('should open with the title of the selected instrument when a row is clicked', () => {
    renderAssignments([createAssignment()]);
    openAssignment();
    expect(within(screen.getByRole('dialog')).getByRole('heading').textContent).toBe('Loaded Instrument');
  });

  it('should load the instrument of the selected assignment', () => {
    renderAssignments([createAssignment({ instrumentId: 'instrument-9' })]);
    openAssignment();
    expect(mocks.useInstrument).toHaveBeenLastCalledWith('instrument-9');
  });

  it('should stay closed while the selected instrument has not loaded, so the sheet never shows an empty title', () => {
    mocks.isInstrumentLoaded = false;
    renderAssignments([createAssignment()]);
    openAssignment();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('should link to the assignment url and encode it as a qr code', () => {
    renderAssignments([createAssignment()]);
    openAssignment();
    const url = 'https://gateway.example.org/assignments/assignment-1';
    expect(screen.getByRole('link').getAttribute('href')).toBe(url);
    expect(screen.getByTestId('qr-code').textContent).toBe(url);
  });

  it("should offer to email an outstanding assignment in the instrument's supported languages", () => {
    renderAssignments([createAssignment()]);
    openAssignment();
    const emailForm = screen.getByTestId('assignment-email-form');
    expect(emailForm.dataset.assignmentId).toBe('assignment-1');
    expect(emailForm.dataset.languages).toBe('en,fr');
  });

  it('should not offer to email an assignment that can no longer be completed', () => {
    renderAssignments([createAssignment({ status: 'COMPLETE' })]);
    openAssignment();
    expect(screen.queryByTestId('assignment-email-form')).toBeNull();
  });

  it('should disable cancelling an assignment that is no longer outstanding', () => {
    renderAssignments([createAssignment({ status: 'EXPIRED' })]);
    openAssignment();
    expect(screen.getByRole('button', { name: 'Cancel' }).hasAttribute('disabled')).toBe(true);
  });

  it('should cancel the selected assignment and close the sheet when cancel is clicked', () => {
    renderAssignments([createAssignment({ id: 'assignment-7' })]);
    openAssignment();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(mocks.mutate).toHaveBeenCalledWith({ data: { status: 'CANCELED' }, params: { id: 'assignment-7' } });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('should close the sheet when it is dismissed', () => {
    renderAssignments([createAssignment()]);
    openAssignment();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
