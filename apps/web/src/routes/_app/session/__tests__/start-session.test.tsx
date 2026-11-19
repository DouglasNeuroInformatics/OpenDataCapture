import type { FC } from 'react';

import type { InstrumentSubmitHandler } from '@opendatacapture/react-core';
import type { Group } from '@opendatacapture/schemas/group';
import type { $CreateSessionData, Session } from '@opendatacapture/schemas/session';
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Route } from '@/routes/_app/session/start-session';

import '@/services/i18n';

type StartSessionFormProps = {
  currentGroup: Group | null;
  customSubjectIds: string[];
  initialValues: { [key: string]: unknown };
  onSubmit: (data: $CreateSessionData) => Promise<void>;
  readOnly: boolean;
  username?: string;
};

type SessionInstrumentStepProps = {
  instrumentId: string;
  onBack: () => void;
  onSubmit: (result: Parameters<InstrumentSubmitHandler>[0]) => Promise<void>;
};

type Loader = (ctx: {
  context: { queryClient: { ensureQueryData: (options: object) => Promise<unknown> } };
}) => Promise<void>;

type MockState = {
  fetchedGroup: Group | null;
  isPending: boolean;
  locationState: undefined | { initialValues?: { [key: string]: unknown } };
  store: {
    currentGroup: Group | null;
    currentSession: null | Session;
    currentUser: null | { username: string };
    startSession: (session: Session) => void;
  };
};

const mocks = vi.hoisted(() => {
  const state: MockState = {
    fetchedGroup: null,
    isPending: false,
    locationState: undefined,
    store: { currentGroup: null, currentSession: null, currentUser: null, startSession: vi.fn() }
  };
  return {
    ...state,
    mutateAsync: vi.fn(),
    SessionInstrumentStep: vi.fn((_props: SessionInstrumentStepProps) => <div data-testid="session-instrument-step" />),
    StartSessionForm: vi.fn((_props: StartSessionFormProps) => <form data-testid="start-session-form" />)
  };
});

vi.mock('@tanstack/react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tanstack/react-router')>()),
  createFileRoute: () => (options: { component: FC; loader: Loader }) => ({ options }),
  useLocation: () => ({ state: mocks.locationState })
}));
vi.mock('@/components/StartSessionForm', () => ({ StartSessionForm: mocks.StartSessionForm }));
vi.mock('@/components/SessionInstrumentStep', () => ({ SessionInstrumentStep: mocks.SessionInstrumentStep }));
vi.mock('@/hooks/useCreateSessionMutation', () => ({
  useCreateSessionMutation: () => ({ isPending: mocks.isPending, mutateAsync: mocks.mutateAsync })
}));
vi.mock('@/hooks/useGroupQuery', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/hooks/useGroupQuery')>()),
  useGroupQuery: (groupId: string | undefined) => ({ data: groupId ? mocks.fetchedGroup : undefined })
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

const StartSessionPage = Route.options.component!;

const loader = Route.options.loader as Loader;

const formProps = () => mocks.StartSessionForm.mock.lastCall![0];

describe('Route', () => {
  beforeEach(() => {
    mocks.fetchedGroup = group;
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

    // Known defect: the reset effect runs only after the remounted form has already read the walkthrough values.
    it.fails('should mount the form with the defaults once the session ends, not the values the walkthrough supplied', () => {
      mocks.locationState = { initialValues: { subjectId: 'DEMO' } };
      mocks.store.currentSession = session;
      const { rerender } = render(<StartSessionPage />);
      const callsBeforeSessionEnds = mocks.StartSessionForm.mock.calls.length;
      mocks.store.currentSession = null;
      rerender(<StartSessionPage />);
      expect(mocks.StartSessionForm.mock.calls[callsBeforeSessionEnds]![0].initialValues).toEqual({
        sessionType: 'IN_PERSON',
        subjectIdentificationMethod: 'PERSONAL_INFO'
      });
    });
  });

  describe('with a session instrument', () => {
    const details: $CreateSessionData = {
      date: NOW,
      groupId: 'group-1',
      subjectData: { id: 'subject-1' },
      type: 'IN_PERSON'
    };

    const answers = {
      data: { score: 1 },
      instrumentId: 'form-1',
      kind: 'FORM'
    } as Parameters<InstrumentSubmitHandler>[0];

    const stepProps = () => mocks.SessionInstrumentStep.mock.lastCall![0];

    const isDetailsFormHidden = () => screen.getByTestId('start-session-form').parentElement!.className === 'hidden';

    const submitDetails = async (data = details) => {
      await act(() => formProps().onSubmit(data));
    };

    beforeEach(() => {
      mocks.fetchedGroup = { ...group, settings: { ...group.settings, sessionInstrumentId: 'form-1' } };
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should show the group's session instrument once the details are submitted, without starting the session", async () => {
      render(<StartSessionPage />);
      await submitDetails();
      expect(stepProps().instrumentId).toBe('form-1');
      expect(isDetailsFormHidden()).toBe(true);
      expect(mocks.mutateAsync).not.toHaveBeenCalled();
    });

    it('should return to the details as they were entered when the clinician goes back, starting nothing', async () => {
      render(<StartSessionPage />);
      const detailsForm = screen.getByTestId('start-session-form');
      await submitDetails();
      act(() => stepProps().onBack());
      expect(screen.queryByTestId('session-instrument-step')).toBeNull();
      expect(isDetailsFormHidden()).toBe(false);
      // The same element, so the form was never remounted and kept what had been typed into it.
      expect(screen.getByTestId('start-session-form')).toBe(detailsForm);
      expect(mocks.mutateAsync).not.toHaveBeenCalled();
    });

    it('should start the session with the answers once the instrument is submitted', async () => {
      render(<StartSessionPage />);
      await submitDetails({ ...details, type: 'RETROSPECTIVE' });
      await act(() => stepProps().onSubmit(answers));
      expect(mocks.mutateAsync).toHaveBeenCalledWith({
        ...details,
        sessionInstrumentAnswers: { data: { score: 1 }, instrumentId: 'form-1' },
        type: 'RETROSPECTIVE'
      });
      expect(mocks.store.startSession).toHaveBeenCalledWith({ ...session, type: 'RETROSPECTIVE' });
    });

    it('should date an in-person session when the instrument is submitted, since that is when it is created', async () => {
      render(<StartSessionPage />);
      await submitDetails();
      const submittedAt = new Date(NOW.getTime() + 60 * 60 * 1000);
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(submittedAt);
      await act(() => stepProps().onSubmit(answers));
      expect(mocks.mutateAsync.mock.lastCall?.[0].date).toStrictEqual(submittedAt);
    });

    it('should offer the details again, not the instrument, for the next session', async () => {
      const { rerender } = render(<StartSessionPage />);
      await submitDetails();
      await act(() => stepProps().onSubmit(answers));
      mocks.store.currentSession = session;
      rerender(<StartSessionPage />);
      mocks.store.currentSession = null;
      rerender(<StartSessionPage />);
      expect(screen.queryByTestId('session-instrument-step')).toBeNull();
      expect(isDetailsFormHidden()).toBe(false);
    });

    // The store holds the group from the sign-in token, which predates a session instrument chosen since.
    it('should require the session instrument the group has now, not the one it had at sign-in', async () => {
      mocks.store.currentGroup = group;
      render(<StartSessionPage />);
      await submitDetails();
      expect(stepProps().instrumentId).toBe('form-1');
    });

    it('should start the session at once when the group requires no session instrument', async () => {
      mocks.fetchedGroup = group;
      render(<StartSessionPage />);
      await submitDetails();
      expect(screen.queryByTestId('session-instrument-step')).toBeNull();
      expect(mocks.mutateAsync).toHaveBeenCalledWith(details);
    });

    it('should drop the details entered for another group when the clinician switches group', async () => {
      const { rerender } = render(<StartSessionPage />);
      await submitDetails();
      mocks.store.currentGroup = { ...mocks.store.currentGroup!, id: 'group-2' };
      rerender(<StartSessionPage />);
      expect(screen.queryByTestId('session-instrument-step')).toBeNull();
    });
  });

  describe('loader', () => {
    it('should prefetch the custom ids of the current group', async () => {
      const ensureQueryData = vi.fn(() => Promise.resolve());
      await loader({ context: { queryClient: { ensureQueryData } } });
      expect(ensureQueryData).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['subjects', 'custom-ids', 'group-1'] })
      );
    });

    it('should prefetch the default group custom ids when no group is selected', async () => {
      mocks.store.currentGroup = null;
      const ensureQueryData = vi.fn(() => Promise.resolve());
      await loader({ context: { queryClient: { ensureQueryData } } });
      expect(ensureQueryData).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['subjects', 'custom-ids', undefined] })
      );
    });

    it('should prefetch the current group, so its session instrument is known before the details are submitted', async () => {
      const ensureQueryData = vi.fn(() => Promise.resolve());
      await loader({ context: { queryClient: { ensureQueryData } } });
      expect(ensureQueryData).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ['group', 'group-1'] }));
    });

    it('should fetch no group when none is selected', async () => {
      mocks.store.currentGroup = null;
      const ensureQueryData = vi.fn(() => Promise.resolve());
      await loader({ context: { queryClient: { ensureQueryData } } });
      expect(ensureQueryData).toHaveBeenCalledOnce();
    });
  });
});
