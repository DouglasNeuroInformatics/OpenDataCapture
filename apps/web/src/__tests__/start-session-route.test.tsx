import type { FC } from 'react';

import type { Group } from '@opendatacapture/schemas/group';
import type { $CreateSessionData, Session } from '@opendatacapture/schemas/session';
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import '@/routes/_app/session/start-session';
import '@/services/i18n';

type StartSessionFormProps = {
  currentGroup: Group | null;
  customSubjectIds: string[];
  initialValues: { [key: string]: unknown };
  onSubmit: (data: $CreateSessionData) => Promise<void>;
  readOnly: boolean;
  username?: string;
};

type CapturedRouteOptions = {
  component: FC;
  loader: (ctx: {
    context: { queryClient: { ensureQueryData: (options: object) => Promise<unknown> } };
  }) => Promise<void>;
};

type MockState = {
  isPending: boolean;
  locationState: undefined | { initialValues?: { [key: string]: unknown } };
  route: CapturedRouteOptions;
  store: {
    currentGroup: Group | null;
    currentSession: null | Session;
    currentUser: null | { username: string };
    startSession: (session: Session) => void;
  };
};

const mocks = vi.hoisted(() => {
  const state: MockState = {
    isPending: false,
    locationState: undefined,
    route: { component: () => null, loader: () => Promise.resolve() },
    store: { currentGroup: null, currentSession: null, currentUser: null, startSession: vi.fn() }
  };
  return {
    ...state,
    mutateAsync: vi.fn(),
    StartSessionForm: vi.fn((_props: StartSessionFormProps) => <form data-testid="start-session-form" />)
  };
});

vi.mock('@tanstack/react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tanstack/react-router')>()),
  createFileRoute: () => (options: CapturedRouteOptions) => {
    mocks.route = options;
    return { options };
  },
  useLocation: () => ({ state: mocks.locationState })
}));
vi.mock('@/components/StartSessionForm', () => ({ StartSessionForm: mocks.StartSessionForm }));
vi.mock('@/hooks/useCreateSessionMutation', () => ({
  useCreateSessionMutation: () => ({ isPending: mocks.isPending, mutateAsync: mocks.mutateAsync })
}));
vi.mock('@/hooks/useSubjectCustomIdsQuery', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/hooks/useSubjectCustomIdsQuery')>()),
  useSubjectCustomIdsQuery: () => ({ data: ['group-1$CUSTOM-1', 'CUSTOM-2'] })
}));
vi.mock('@/store', () => ({
  useAppStore: Object.assign((selector: (store: typeof mocks.store) => unknown) => selector(mocks.store), {
    getState: () => mocks.store
  })
}));

const NOW = new Date('2026-01-01T12:00:00Z');

const group: Group = {
  accessibleInstrumentIds: [],
  createdAt: NOW,
  id: 'group-1',
  instrumentRepoIds: [],
  name: 'Group One',
  settings: { defaultIdentificationMethod: 'PERSONAL_INFO' },
  subjectIds: [],
  type: 'CLINICAL',
  updatedAt: NOW,
  userIds: []
};

const session: Session = {
  createdAt: NOW,
  date: NOW,
  groupId: 'group-1',
  id: 'session-1',
  subject: null,
  subjectId: 'subject-1',
  type: 'REMOTE',
  updatedAt: NOW
};

const StartSessionPage = mocks.route.component;

const formProps = () => mocks.StartSessionForm.mock.lastCall![0];

beforeEach(() => {
  mocks.isPending = false;
  mocks.locationState = undefined;
  mocks.store.currentGroup = group;
  mocks.store.currentSession = null;
  mocks.store.currentUser = { username: 'admin' };
  mocks.mutateAsync.mockResolvedValue(session);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('StartSessionPage', () => {
  it('should show the page title', () => {
    render(<StartSessionPage />);
    expect(screen.getByRole('heading', { name: 'Start Session' })).toBeTruthy();
  });

  it('should offer the form, editable, when no session is active', () => {
    render(<StartSessionPage />);
    expect(formProps()).toMatchObject({ currentGroup: group, readOnly: false, username: 'admin' });
  });

  it('should lock the form while the session is being created, so it cannot be submitted twice', () => {
    mocks.isPending = true;
    render(<StartSessionPage />);
    expect(formProps().readOnly).toBe(true);
  });

  it('should suggest the custom ids of the group with their group scope removed', () => {
    render(<StartSessionPage />);
    expect(formProps().customSubjectIds).toEqual(['CUSTOM-1', 'CUSTOM-2']);
  });

  it('should pass no username when nobody is logged in', () => {
    mocks.store.currentUser = null;
    render(<StartSessionPage />);
    expect(formProps().username).toBeUndefined();
  });

  it('should default to an in-person session identified by the method the group prefers', () => {
    render(<StartSessionPage />);
    expect(formProps().initialValues).toEqual({
      sessionType: 'IN_PERSON',
      subjectIdentificationMethod: 'PERSONAL_INFO'
    });
  });

  it('should default to identifying by custom id when there is no group', () => {
    mocks.store.currentGroup = null;
    render(<StartSessionPage />);
    expect(formProps().initialValues).toEqual({ sessionType: 'IN_PERSON', subjectIdentificationMethod: 'CUSTOM_ID' });
  });

  it('should mount the form with the values the walkthrough navigated here with', () => {
    mocks.locationState = { initialValues: { subjectId: 'DEMO' } };
    render(<StartSessionPage />);
    expect(mocks.StartSessionForm.mock.calls[0]![0].initialValues).toEqual({ subjectId: 'DEMO' });
  });

  it('should use the defaults when navigated here with state that carries no values', () => {
    mocks.locationState = {};
    render(<StartSessionPage />);
    expect(mocks.StartSessionForm.mock.calls[0]![0].initialValues).toMatchObject({ sessionType: 'IN_PERSON' });
  });

  it('should start the created session with the type chosen in the form', async () => {
    render(<StartSessionPage />);
    const formData: $CreateSessionData = {
      date: NOW,
      groupId: 'group-1',
      subjectData: { id: 'subject-1' },
      type: 'IN_PERSON'
    };
    await act(() => formProps().onSubmit(formData));
    expect(mocks.mutateAsync).toHaveBeenCalledWith(formData);
    expect(mocks.store.startSession).toHaveBeenCalledWith({ ...session, type: 'IN_PERSON' });
  });

  it('should replace the form with a confirmation while a session is active', () => {
    mocks.store.currentSession = session;
    render(<StartSessionPage />);
    expect(screen.queryByTestId('start-session-form')).toBeNull();
    expect(screen.getByText('Session Successfully Started')).toBeTruthy();
  });

  it('should reset the initial values to the defaults once the session ends, not keep those the walkthrough supplied', () => {
    mocks.locationState = { initialValues: { subjectId: 'DEMO' } };
    mocks.store.currentSession = session;
    const { rerender } = render(<StartSessionPage />);
    mocks.store.currentSession = null;
    rerender(<StartSessionPage />);
    expect(formProps().initialValues).toEqual({
      sessionType: 'IN_PERSON',
      subjectIdentificationMethod: 'PERSONAL_INFO'
    });
  });
});

describe('loader', () => {
  it('should prefetch the custom ids of the current group', async () => {
    const ensureQueryData = vi.fn(() => Promise.resolve());
    await mocks.route.loader({ context: { queryClient: { ensureQueryData } } });
    expect(ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['subjects', 'custom-ids', 'group-1'] })
    );
  });

  it('should prefetch the default group custom ids when no group is selected', async () => {
    mocks.store.currentGroup = null;
    const ensureQueryData = vi.fn(() => Promise.resolve());
    await mocks.route.loader({ context: { queryClient: { ensureQueryData } } });
    expect(ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['subjects', 'custom-ids', undefined] })
    );
  });
});
