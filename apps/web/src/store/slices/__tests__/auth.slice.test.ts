import type { TokenPayload } from '@opendatacapture/schemas/auth';
import type { Group } from '@opendatacapture/schemas/group';
import type { Session } from '@opendatacapture/schemas/session';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { useAppStore } from '@/store';
import type { AppStore } from '@/store/types';

import { createAuthSlice } from '../auth.slice';

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

const encodeSegment = (value: object) => {
  return btoa(JSON.stringify(value)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
};

const createAccessToken = (payload: TokenPayload) => {
  return [encodeSegment({ alg: 'none', typ: 'JWT' }), encodeSegment(payload), 'signature'].join('.');
};

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

const createStore = () => create(immer<AppStore>((...a) => ({ ...useAppStore.getState(), ...createAuthSlice(...a) })));

describe('createAuthSlice', () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();
  });

  afterEach(() => {
    delete window.__PLAYWRIGHT_ACCESS_TOKEN__;
    vi.restoreAllMocks();
  });

  it('should start signed out when no token was injected, so the login page is shown', () => {
    expect(store.getState().accessToken).toBeNull();
    expect(store.getState().currentUser).toBeNull();
    expect(store.getState().currentGroup).toBeNull();
  });

  it('should store the access token on login, so requests can be authorized', () => {
    const accessToken = createAccessToken(createPayload([createGroup('a')]));
    store.getState().login(accessToken);
    expect(store.getState().accessToken).toBe(accessToken);
  });

  it('should expose the user identity carried on the token', () => {
    store.getState().login(createAccessToken(createPayload([createGroup('a')])));
    expect(store.getState().currentUser).toMatchObject({ firstName: 'Jane', id: 'user-1', username: 'jdoe' });
  });

  it('should build an ability from the token permissions, so the UI can gate actions', () => {
    store.getState().login(createAccessToken(createPayload([createGroup('a')])));
    const ability = store.getState().currentUser?.ability;
    expect(ability?.can('read', 'Subject')).toBe(true);
    expect(ability?.can('delete', 'Subject')).toBe(false);
  });

  it('should select the first group on the token when there is no preferred group', () => {
    store.getState().login(createAccessToken(createPayload([createGroup('a'), createGroup('b')])));
    expect(store.getState().currentGroup?.id).toBe('a');
  });

  it('should restore the group last used on this device when the user still belongs to it', () => {
    store.setState({ preferredGroupId: 'b' });
    store.getState().login(createAccessToken(createPayload([createGroup('a'), createGroup('b')])));
    expect(store.getState().currentGroup?.id).toBe('b');
  });

  it('should fall back to the first group when the preferred group belongs to another user', () => {
    store.setState({ preferredGroupId: 'other' });
    store.getState().login(createAccessToken(createPayload([createGroup('a'), createGroup('b')])));
    expect(store.getState().currentGroup?.id).toBe('a');
  });

  it('should switch to the chosen group and remember it for the next login', () => {
    const group = createGroup('b');
    store.getState().changeGroup(group);
    expect(store.getState().currentGroup).toBe(group);
    expect(store.getState().preferredGroupId).toBe('b');
  });

  it('should end the current session when the group changes, since a session belongs to one group', () => {
    store.setState({ currentSession: session });
    store.getState().changeGroup(createGroup('b'));
    expect(store.getState().currentSession).toBeNull();
  });

  it('should reload the page on logout, so no in-memory state outlives the session', () => {
    const reload = vi.spyOn(window.location, 'reload').mockImplementation(() => undefined);
    store.getState().logout();
    expect(reload).toHaveBeenCalledOnce();
  });

  it('should sign in with a token injected by Playwright, so end-to-end tests can skip the login form', () => {
    window.__PLAYWRIGHT_ACCESS_TOKEN__ = createAccessToken(createPayload([createGroup('e2e')]));
    const freshStore = createStore();
    expect(freshStore.getState().currentUser?.username).toBe('jdoe');
    expect(freshStore.getState().currentGroup?.id).toBe('e2e');
  });
});
