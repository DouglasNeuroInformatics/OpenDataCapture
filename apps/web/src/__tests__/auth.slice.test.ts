import type { TokenPayload } from '@opendatacapture/schemas/auth';
import type { Group } from '@opendatacapture/schemas/group';
import type { Session } from '@opendatacapture/schemas/session';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useAppStore } from '@/store';

const createGroup = (id: string): Group => ({
  accessibleInstrumentIds: [],
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  id,
  instrumentRepoIds: [],
  name: `Group ${id}`,
  settings: { defaultIdentificationMethod: 'CUSTOM_ID' },
  subjectIds: [],
  type: 'CLINICAL',
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  userIds: []
});

const createPayload = (groups: Group[]): TokenPayload => ({
  basePermissionLevel: null,
  firstName: 'Jane',
  groups,
  id: 'user-1',
  kind: 'login',
  lastName: 'Doe',
  mustResetPassword: false,
  permissions: [{ action: 'read', groupId: null, subject: 'Subject' }],
  username: 'jdoe'
});

const encodeSegment = (value: object) =>
  btoa(JSON.stringify(value)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');

const createAccessToken = (payload: TokenPayload) =>
  [encodeSegment({ alg: 'none', typ: 'JWT' }), encodeSegment(payload), 'signature'].join('.');

const session: Session = {
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  date: new Date('2026-01-01T00:00:00.000Z'),
  groupId: 'a',
  id: 'session-1',
  subject: null,
  subjectId: 'subject-1',
  type: 'IN_PERSON',
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  userId: 'user-1'
};

const initialState = useAppStore.getState();

describe('createAuthSlice', () => {
  beforeEach(() => {
    useAppStore.setState(initialState, true);
  });

  afterEach(() => {
    delete window.__PLAYWRIGHT_ACCESS_TOKEN__;
    vi.restoreAllMocks();
  });

  it('should start signed out when no token was injected, so the login page is shown', () => {
    expect(initialState.accessToken).toBeNull();
    expect(initialState.currentUser).toBeNull();
    expect(initialState.currentGroup).toBeNull();
  });

  it('should store the access token on login, so requests can be authorized', () => {
    const accessToken = createAccessToken(createPayload([createGroup('a')]));
    useAppStore.getState().login(accessToken);
    expect(useAppStore.getState().accessToken).toBe(accessToken);
  });

  it('should expose the user identity carried on the token', () => {
    useAppStore.getState().login(createAccessToken(createPayload([createGroup('a')])));
    expect(useAppStore.getState().currentUser).toMatchObject({ firstName: 'Jane', id: 'user-1', username: 'jdoe' });
  });

  it('should build an ability from the token permissions, so the UI can gate actions', () => {
    useAppStore.getState().login(createAccessToken(createPayload([createGroup('a')])));
    const ability = useAppStore.getState().currentUser?.ability;
    expect(ability?.can('read', 'Subject')).toBe(true);
    expect(ability?.can('delete', 'Subject')).toBe(false);
  });

  it('should select the first group on the token when there is no preferred group', () => {
    useAppStore.getState().login(createAccessToken(createPayload([createGroup('a'), createGroup('b')])));
    expect(useAppStore.getState().currentGroup?.id).toBe('a');
  });

  it('should restore the group last used on this device when the user still belongs to it', () => {
    useAppStore.setState({ preferredGroupId: 'b' });
    useAppStore.getState().login(createAccessToken(createPayload([createGroup('a'), createGroup('b')])));
    expect(useAppStore.getState().currentGroup?.id).toBe('b');
  });

  it('should fall back to the first group when the preferred group belongs to another user', () => {
    useAppStore.setState({ preferredGroupId: 'other' });
    useAppStore.getState().login(createAccessToken(createPayload([createGroup('a'), createGroup('b')])));
    expect(useAppStore.getState().currentGroup?.id).toBe('a');
  });

  it('should switch to the chosen group and remember it for the next login', () => {
    const group = createGroup('b');
    useAppStore.getState().changeGroup(group);
    expect(useAppStore.getState().currentGroup).toBe(group);
    expect(useAppStore.getState().preferredGroupId).toBe('b');
  });

  it('should end the current session when the group changes, since a session belongs to one group', () => {
    useAppStore.setState({ currentSession: session });
    useAppStore.getState().changeGroup(createGroup('b'));
    expect(useAppStore.getState().currentSession).toBeNull();
  });

  it('should reload the page on logout, so no in-memory state outlives the session', () => {
    const reload = vi.spyOn(window.location, 'reload').mockImplementation(() => undefined);
    useAppStore.getState().logout();
    expect(reload).toHaveBeenCalledOnce();
  });

  it('should sign in with a token injected by Playwright, so end-to-end tests can skip the login form', async () => {
    window.__PLAYWRIGHT_ACCESS_TOKEN__ = createAccessToken(createPayload([createGroup('e2e')]));
    vi.resetModules();
    const { useAppStore: freshStore } = await import('@/store');
    expect(freshStore.getState().currentUser?.username).toBe('jdoe');
    expect(freshStore.getState().currentGroup?.id).toBe('e2e');
  });
});
