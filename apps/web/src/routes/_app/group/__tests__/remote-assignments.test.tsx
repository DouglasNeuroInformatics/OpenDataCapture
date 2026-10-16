import type { FC } from 'react';

import type { Group } from '@opendatacapture/schemas/group';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import '@/routes/_app/group/remote-assignments';
import '@/services/i18n';

/** The parts of the route options under test, typed by what this file passes to them. */
type LoaderContext = { context: { queryClient: { ensureQueryData: (options: object) => Promise<unknown> } } };

type CapturedRouteOptions = {
  beforeLoad: (ctx: LoaderContext) => Promise<void>;
  component: FC;
  loader: (ctx: LoaderContext) => void;
  validateSearch: (search: { [key: string]: unknown }) => { mode?: string };
};

type MockState = {
  config: { setup: { isGatewayEnabled: boolean } };
  instrumentInfo: undefined | { details: { title: string }; id: string; kind: 'FORM' }[];
  route: CapturedRouteOptions;
  search: { mode?: string };
  store: { currentGroup: Group | null };
};

const mocks = vi.hoisted(() => {
  const state: MockState = {
    config: { setup: { isGatewayEnabled: true } },
    instrumentInfo: undefined,
    route: {
      beforeLoad: () => Promise.resolve(),
      component: () => null,
      loader: () => undefined,
      validateSearch: () => ({})
    },
    search: {},
    store: { currentGroup: null }
  };
  return {
    ...state,
    BulkRemoteAssignmentWizard: vi.fn((_props: object) => <div data-testid="bulk-wizard" />),
    DeleteRemoteAssignments: vi.fn((_props: object) => <div data-testid="delete-assignments" />)
  };
});

vi.mock('@tanstack/react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tanstack/react-router')>()),
  createFileRoute: () => (options: CapturedRouteOptions) => {
    mocks.route = options;
    return { options, useSearch: () => mocks.search };
  }
}));
vi.mock('@/config', () => ({ config: mocks.config }));
vi.mock('@/components/BulkRemoteAssignmentWizard', () => ({
  BulkRemoteAssignmentWizard: mocks.BulkRemoteAssignmentWizard
}));
vi.mock('@/components/DeleteRemoteAssignments', () => ({ DeleteRemoteAssignments: mocks.DeleteRemoteAssignments }));
vi.mock('@/hooks/useInstrumentInfoQuery', () => ({
  useInstrumentInfoQuery: () => ({ data: mocks.instrumentInfo })
}));
vi.mock('@/hooks/useSetupStateQuery', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/hooks/useSetupStateQuery')>()),
  useSetupStateQuery: () => ({ data: { defaultAssignmentDurationDays: 7 } })
}));
vi.mock('@/hooks/useSubjectsQuery', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/hooks/useSubjectsQuery')>()),
  useSubjectsQuery: () => ({ data: [] })
}));
vi.mock('@/store', () => ({
  useAppStore: Object.assign((selector: (store: typeof mocks.store) => unknown) => selector(mocks.store), {
    getState: () => mocks.store
  })
}));

const createGroup = (subjectIdDisplayLength: null | number = null): Group => ({
  accessibleInstrumentIds: ['instrument-1'],
  createdAt: new Date('2026-01-01'),
  id: 'group-1',
  instrumentRepoIds: [],
  name: 'Group One',
  settings: { defaultIdentificationMethod: 'CUSTOM_ID', subjectIdDisplayLength },
  subjectIds: [],
  type: 'CLINICAL',
  updatedAt: new Date('2026-01-02'),
  userIds: []
});

const RemoteAssignmentsPage = mocks.route.component;

const wizardProps = () => mocks.BulkRemoteAssignmentWizard.mock.lastCall?.[0];

const deleteProps = () => mocks.DeleteRemoteAssignments.mock.lastCall?.[0];

const runLoader = (ensureQueryData: (options: object) => Promise<unknown>) => {
  mocks.route.loader({ context: { queryClient: { ensureQueryData } } });
};

beforeEach(() => {
  vi.useFakeTimers({ now: new Date('2026-01-01T00:00:00Z'), toFake: ['Date'] });
  mocks.config.setup.isGatewayEnabled = true;
  mocks.instrumentInfo = undefined;
  mocks.search = {};
  mocks.store.currentGroup = createGroup();
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.useRealTimers();
});

describe('RemoteAssignmentsPage', () => {
  it('should render nothing without a current group, since assignments are always scoped to one', () => {
    mocks.store.currentGroup = null;
    const { container } = render(<RemoteAssignmentsPage />);
    expect(container.innerHTML).toBe('');
  });

  it('should show the landing choices when no mode is requested', () => {
    render(<RemoteAssignmentsPage />);
    expect(screen.getByRole('heading', { name: 'Remote Assignments' })).toBeTruthy();
    expect(screen.getByTestId('remote-assignments-landing')).toBeTruthy();
  });

  it('should open the creation wizard directly when the url requests create mode', () => {
    mocks.search = { mode: 'create' };
    render(<RemoteAssignmentsPage />);
    expect(screen.getByRole('heading', { name: 'Create Remote Assignments' })).toBeTruthy();
    expect(screen.getByTestId('bulk-wizard')).toBeTruthy();
  });

  it('should open the deletion view directly when the url requests delete mode', () => {
    mocks.search = { mode: 'delete' };
    render(<RemoteAssignmentsPage />);
    expect(screen.getByRole('heading', { name: 'Delete Remote Assignments' })).toBeTruthy();
    expect(screen.getByTestId('delete-assignments')).toBeTruthy();
  });

  it('should follow a later change of the url mode, so navigating from the sidebar resets the view', () => {
    mocks.search = { mode: 'create' };
    const { rerender } = render(<RemoteAssignmentsPage />);
    mocks.search = {};
    rerender(<RemoteAssignmentsPage />);
    expect(screen.getByTestId('remote-assignments-landing')).toBeTruthy();
  });

  it('should switch to the creation wizard when the create card is clicked', () => {
    render(<RemoteAssignmentsPage />);
    fireEvent.click(screen.getByTestId('remote-assignments-create'));
    expect(screen.getByTestId('bulk-wizard')).toBeTruthy();
  });

  it('should switch to the deletion view when the delete card is activated with Enter', () => {
    render(<RemoteAssignmentsPage />);
    fireEvent.keyDown(screen.getByTestId('remote-assignments-delete'), { key: 'Enter' });
    expect(screen.getByTestId('delete-assignments')).toBeTruthy();
  });

  it('should activate a card with the space bar, as a native button would', () => {
    render(<RemoteAssignmentsPage />);
    fireEvent.keyDown(screen.getByTestId('remote-assignments-create'), { key: ' ' });
    expect(screen.getByTestId('bulk-wizard')).toBeTruthy();
  });

  it('should ignore other keys on a card, so tabbing past it does not trigger it', () => {
    render(<RemoteAssignmentsPage />);
    fireEvent.keyDown(screen.getByTestId('remote-assignments-create'), { key: 'Tab' });
    expect(screen.getByTestId('remote-assignments-landing')).toBeTruthy();
  });

  it('should offer the wizard only the instruments the group may administer, as id and title', () => {
    mocks.search = { mode: 'create' };
    mocks.instrumentInfo = [
      { details: { title: 'Allowed' }, id: 'instrument-1', kind: 'FORM' },
      { details: { title: 'Not in group' }, id: 'instrument-2', kind: 'FORM' }
    ];
    render(<RemoteAssignmentsPage />);
    expect(wizardProps()).toMatchObject({ instruments: [{ id: 'instrument-1', title: 'Allowed' }] });
  });

  it('should offer the wizard no instruments while the instrument list is still loading', () => {
    mocks.search = { mode: 'create' };
    render(<RemoteAssignmentsPage />);
    expect(wizardProps()).toMatchObject({ instruments: [] });
  });

  it('should prefill the wizard expiry from the instance default assignment duration', () => {
    mocks.search = { mode: 'create' };
    render(<RemoteAssignmentsPage />);
    expect(wizardProps()).toMatchObject({ defaultExpiresAt: '2026-01-08', groupId: 'group-1', groupName: 'Group One' });
  });

  it('should fall back to a display length of nine for the wizard when the group sets none', () => {
    mocks.search = { mode: 'create' };
    render(<RemoteAssignmentsPage />);
    expect(wizardProps()).toMatchObject({ subjectIdDisplayLength: 9 });
  });

  it('should pass the group display length to the wizard when the group sets one', () => {
    mocks.search = { mode: 'create' };
    mocks.store.currentGroup = createGroup(5);
    render(<RemoteAssignmentsPage />);
    expect(wizardProps()).toMatchObject({ subjectIdDisplayLength: 5 });
  });

  it('should fall back to a display length of nine for the deletion view when the group sets none', () => {
    mocks.search = { mode: 'delete' };
    render(<RemoteAssignmentsPage />);
    expect(deleteProps()).toEqual({ groupId: 'group-1', subjectIdDisplayLength: 9 });
  });

  it('should pass the group display length to the deletion view when the group sets one', () => {
    mocks.search = { mode: 'delete' };
    mocks.store.currentGroup = createGroup(5);
    render(<RemoteAssignmentsPage />);
    expect(deleteProps()).toEqual({ groupId: 'group-1', subjectIdDisplayLength: 5 });
  });
});

describe('beforeLoad', () => {
  const runGuard = (setupState: { isBulkRemoteAssignmentsEnabled: boolean }) =>
    mocks.route.beforeLoad({ context: { queryClient: { ensureQueryData: () => Promise.resolve(setupState) } } });

  it('should redirect to the dashboard when the gateway is not deployed', async () => {
    mocks.config.setup.isGatewayEnabled = false;
    await expect(runGuard({ isBulkRemoteAssignmentsEnabled: true })).rejects.toMatchObject({
      options: { to: '/dashboard' }
    });
  });

  it('should redirect to the dashboard when an administrator has turned bulk assignments off', async () => {
    await expect(runGuard({ isBulkRemoteAssignmentsEnabled: false })).rejects.toMatchObject({
      options: { to: '/dashboard' }
    });
  });

  it('should allow the page when the gateway is deployed and bulk assignments are on', async () => {
    await expect(runGuard({ isBulkRemoteAssignmentsEnabled: true })).resolves.toBeUndefined();
  });
});

describe('loader', () => {
  it('should prefetch the setup state, so the wizard has its default expiry ready', () => {
    const ensureQueryData = vi.fn(() => Promise.resolve());
    runLoader(ensureQueryData);
    expect(ensureQueryData).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ['setup-state'] }));
  });

  it('should prefetch the subjects of the current group', () => {
    const ensureQueryData = vi.fn(() => Promise.resolve());
    runLoader(ensureQueryData);
    expect(ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['subjects', 'group-1', undefined] })
    );
  });

  it('should prefetch subjects without a group when none is selected', () => {
    mocks.store.currentGroup = null;
    const ensureQueryData = vi.fn(() => Promise.resolve());
    runLoader(ensureQueryData);
    expect(ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['subjects', undefined, undefined] })
    );
  });
});

describe('validateSearch', () => {
  const { validateSearch } = mocks.route;

  it.each(['create', 'delete'] as const)('should keep the %s mode', (mode) => {
    expect(validateSearch({ mode })).toEqual({ mode });
  });

  it('should drop an unknown mode, so a mistyped link lands on the choices', () => {
    expect(validateSearch({ mode: 'edit' })).toEqual({ mode: undefined });
  });
});
