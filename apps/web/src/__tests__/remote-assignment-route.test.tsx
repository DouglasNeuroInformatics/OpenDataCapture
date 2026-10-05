import type { FC } from 'react';

import type { Assignment } from '@opendatacapture/schemas/assignment';
import type { Session } from '@opendatacapture/schemas/session';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import '@/routes/_app/session/remote-assignment';
import '@/services/i18n';

type InstrumentInfoStub = { details: { title: string }; id: string; kind: 'FORM'; supportedLanguages: string[] };

type CapturedRouteOptions = { beforeLoad: () => void; component: FC };

type MockState = {
  config: { setup: { isGatewayEnabled: boolean } };
  instrumentInfo: InstrumentInfoStub[] | undefined;
  route: CapturedRouteOptions;
  store: { currentGroup: null | { accessibleInstrumentIds: string[]; id: string }; currentSession: null | Session };
};

const mocks = vi.hoisted(() => {
  const state: MockState = {
    config: { setup: { isGatewayEnabled: true } },
    instrumentInfo: undefined,
    route: { beforeLoad: () => undefined, component: () => null },
    store: { currentGroup: null, currentSession: null }
  };
  return {
    ...state,
    AssignmentEmailForm: vi.fn((_props: { assignment: Assignment | null; instrumentLanguages?: string[] }) => null),
    mutateAsync: vi.fn(),
    navigate: vi.fn(),
    QRCode: vi.fn((_props: { url: string }) => null)
  };
});

vi.mock('@tanstack/react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tanstack/react-router')>()),
  createFileRoute: () => (options: CapturedRouteOptions) => {
    mocks.route = options;
    return { options };
  },
  useNavigate: () => mocks.navigate
}));
vi.mock('@/config', () => ({ config: mocks.config }));
vi.mock('@/components/AssignmentEmailForm', () => ({ AssignmentEmailForm: mocks.AssignmentEmailForm }));
vi.mock('@/components/QRCode', () => ({ QRCode: mocks.QRCode }));
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
vi.mock('@/hooks/useCreateAssignment', () => ({ useCreateAssignment: () => ({ mutateAsync: mocks.mutateAsync }) }));
vi.mock('@/hooks/useInstrumentInfoQuery', () => ({
  useInstrumentInfoQuery: () => ({ data: mocks.instrumentInfo })
}));
vi.mock('@/hooks/useSetupStateQuery', () => ({
  useSetupStateQuery: () => ({ data: { defaultAssignmentDurationDays: 7 } })
}));
vi.mock('@/store', () => ({
  useAppStore: (selector: (store: typeof mocks.store) => unknown) => selector(mocks.store)
}));

const NOW = new Date('2026-01-01T12:00:00Z');

const session: Session = {
  createdAt: NOW,
  date: NOW,
  groupId: 'group-1',
  id: 'session-1',
  subject: null,
  subjectId: 'subject-1',
  type: 'IN_PERSON',
  updatedAt: NOW
};

const assignment: Assignment = {
  completedAt: null,
  createdAt: NOW,
  expiresAt: new Date('2026-01-08T12:00:00Z'),
  groupId: 'group-1',
  id: 'assignment-1',
  instrumentId: 'instrument-1',
  status: 'OUTSTANDING',
  subjectId: 'subject-1',
  updatedAt: NOW,
  url: 'https://gateway.example/assignments/assignment-1'
};

const allowed: InstrumentInfoStub = {
  details: { title: 'Allowed' },
  id: 'instrument-1',
  kind: 'FORM',
  supportedLanguages: ['en', 'fr']
};

const RemoteAssignmentPage = mocks.route.component;

const selectInstrument = () => {
  render(<RemoteAssignmentPage />);
  fireEvent.click(screen.getByRole('button', { name: 'Allowed' }));
};

const submitForm = () => fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

const createAssignment = async () => {
  selectInstrument();
  submitForm();
  await waitFor(() => expect(screen.getByRole('link', { name: 'Assignment Link' })).toBeTruthy());
};

beforeEach(() => {
  vi.useFakeTimers({ now: NOW, toFake: ['Date'] });
  mocks.config.setup.isGatewayEnabled = true;
  mocks.instrumentInfo = [allowed, { ...allowed, details: { title: 'Excluded' }, id: 'instrument-2' }];
  mocks.store.currentGroup = { accessibleInstrumentIds: ['instrument-1'], id: 'group-1' };
  mocks.store.currentSession = session;
  mocks.mutateAsync.mockResolvedValue(assignment);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.useRealTimers();
});

describe('RemoteAssignmentPage', () => {
  it('should render nothing and send the user to start a session when none is active', () => {
    mocks.store.currentSession = null;
    const { container } = render(<RemoteAssignmentPage />);
    expect(container.innerHTML).toBe('');
    expect(mocks.navigate).toHaveBeenCalledWith({ to: '/session/start-session' });
  });

  it('should stay on the page while a session is active', () => {
    render(<RemoteAssignmentPage />);
    expect(screen.getByRole('heading', { name: 'Remote Assignment' })).toBeTruthy();
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it('should list only the instruments the current group may administer', () => {
    render(<RemoteAssignmentPage />);
    expect(screen.getByRole('button', { name: 'Allowed' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Excluded' })).toBeNull();
  });

  it('should show a loading fallback instead of the showcase while the instruments load', () => {
    mocks.instrumentInfo = undefined;
    render(<RemoteAssignmentPage />);
    expect(screen.queryByTestId('instrument-search-bar')).toBeNull();
  });

  it('should focus the search bar on arrival, so the clinician can type a name straight away', () => {
    render(<RemoteAssignmentPage />);
    expect(document.activeElement).toBe(screen.getByRole('textbox'));
  });

  it('should ask to confirm the assignment of the selected instrument', () => {
    selectInstrument();
    expect(screen.getByRole('dialog', { name: 'Create Remote Assignment' })).toBeTruthy();
    expect(screen.getByText('Assign "Allowed" to the current subject for remote completion.')).toBeTruthy();
  });

  it('should focus the submit button when the dialog opens, so Enter confirms the default expiry', () => {
    selectInstrument();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Submit' }));
  });

  it('should prefill the expiry from the instance default assignment duration', () => {
    selectInstrument();
    expect(screen.getByTestId<HTMLInputElement>('date-input').value).toBe('2026-01-08');
  });

  it('should reject an expiry in the past', async () => {
    selectInstrument();
    const input = screen.getByTestId('date-input');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '2020-01-01' } });
    fireEvent.blur(input);
    submitForm();
    expect(await screen.findByText('Expiry date must be in the future')).toBeTruthy();
    expect(mocks.mutateAsync).not.toHaveBeenCalled();
  });

  it('should create the assignment, expiring on the chosen day, for the session subject in the current group', async () => {
    await createAssignment();
    expect(mocks.mutateAsync).toHaveBeenCalledWith({
      data: {
        expiresAt: new Date('2026-01-08'),
        groupId: 'group-1',
        instrumentId: 'instrument-1',
        subjectId: 'subject-1'
      }
    });
  });

  it('should create the assignment without a group when none is selected', async () => {
    mocks.store.currentGroup = null;
    await createAssignment();
    expect(mocks.mutateAsync).toHaveBeenCalledWith({ data: expect.objectContaining({ groupId: undefined }) });
  });

  it('should replace the dialog with the shareable link once the assignment is created', async () => {
    await createAssignment();
    expect(screen.queryByRole('dialog', { name: 'Create Remote Assignment' })).toBeNull();
    expect(screen.getByRole('link', { name: 'Assignment Link' }).getAttribute('href')).toBe(assignment.url);
    expect(screen.getByDisplayValue(assignment.url)).toBeTruthy();
  });

  it('should hand the assignment url to the QR code and the email form', async () => {
    await createAssignment();
    expect(mocks.QRCode.mock.lastCall?.[0]).toEqual({ url: assignment.url });
    expect(mocks.AssignmentEmailForm.mock.lastCall?.[0]).toEqual({ assignment, instrumentLanguages: ['en', 'fr'] });
  });

  it('should close the link panel when the close button is clicked', async () => {
    await createAssignment();
    fireEvent.click(screen.getByText('Close', { ignore: '.sr-only', selector: 'button' }));
    await waitFor(() => expect(screen.queryByRole('link', { name: 'Assignment Link' })).toBeNull());
  });
});

describe('beforeLoad', () => {
  it('should redirect to the dashboard when the gateway is not deployed', () => {
    mocks.config.setup.isGatewayEnabled = false;
    expect(() => mocks.route.beforeLoad()).toThrow(
      expect.objectContaining({ options: expect.objectContaining({ to: '/dashboard' }) })
    );
  });

  it('should allow the page when the gateway is deployed', () => {
    expect(() => mocks.route.beforeLoad()).not.toThrow();
  });
});
