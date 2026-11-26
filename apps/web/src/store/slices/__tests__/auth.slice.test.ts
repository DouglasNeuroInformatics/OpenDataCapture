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

type AccessTokenClaims = TokenPayload & { exp: number; iat: number };

const ISSUED_AT = 1_800_000_000;

const createPayload = (groups: Group[], overrides: Partial<AccessTokenClaims> = {}): AccessTokenClaims => ({
  basePermissionLevel: null,
  exp: ISSUED_AT + 900,
  firstName: 'Jane',
  groups,
  iat: ISSUED_AT,
  id: 'user-1',
  kind: 'login',
  lastName: 'Doe',
  mustResetPassword: false,
  permissions: [{ action: 'read', groupId: null, subject: 'Subject' }],
  renewal: { authenticatedAt: ISSUED_AT * 1000, endsAt: (ISSUED_AT + 43_200) * 1000, isInteractive: true },
  username: 'jdoe',
  ...overrides
});

const encodeSegment = (value: object) => {
  return btoa(JSON.stringify(value)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
};

const createAccessToken = (payload: AccessTokenClaims) => {
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
    vi.useRealTimers();
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

  it('should leave no group selected or remembered when the group is cleared', () => {
    store.setState({ currentGroup: createGroup('a'), preferredGroupId: 'a' });
    store.getState().changeGroup(null);
    expect(store.getState().currentGroup).toBeNull();
    expect(store.getState().preferredGroupId).toBeNull();
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

  describe('access token validity', () => {
    it('should count the lifetime from when the token arrives, so a wrong workstation clock does not move the expiry', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2001-01-01T00:00:00.000Z'));
      store.getState().login(createAccessToken(createPayload([createGroup('a')])));
      expect(store.getState().accessTokenValidity).toMatchObject({
        expiresAt: Date.now() + 900_000,
        receivedAt: Date.now()
      });
    });

    it('should let activity renew a token that stops short of the end of the sign-in', () => {
      store.getState().login(createAccessToken(createPayload([createGroup('a')])));
      expect(store.getState().accessTokenValidity?.isRenewable).toBe(true);
    });

    it('should not renew a token that already runs to the end of the sign-in, since a new one would last no longer', () => {
      const renewal = {
        authenticatedAt: ISSUED_AT * 1000,
        endsAt: (ISSUED_AT + 900) * 1000 + 999,
        isInteractive: true
      };
      store.getState().login(createAccessToken(createPayload([createGroup('a')], { renewal })));
      expect(store.getState().accessTokenValidity?.isRenewable).toBe(false);
    });

    it('should not renew a token signed before renewal existed, which the API refuses', () => {
      store.getState().login(createAccessToken(createPayload([createGroup('a')], { renewal: undefined })));
      expect(store.getState().accessTokenValidity?.isRenewable).toBe(false);
    });

    it('should have no validity while nobody is signed in', () => {
      expect(store.getState().accessTokenValidity).toBeNull();
    });

    it('should stop a token being renewed when its renewal is ended, leaving its expiry as it was', () => {
      store.getState().login(createAccessToken(createPayload([createGroup('a')])));
      const { expiresAt } = store.getState().accessTokenValidity!;
      store.getState().endAccessTokenRenewal();
      expect(store.getState().accessTokenValidity).toMatchObject({ expiresAt, isRenewable: false });
    });

    it('should have nothing to end while nobody is signed in', () => {
      store.getState().endAccessTokenRenewal();
      expect(store.getState().accessTokenValidity).toBeNull();
    });
  });

  describe('reauthentication', () => {
    it('should ask for the password again when required', () => {
      store.getState().requireReauthentication();
      expect(store.getState().isReauthenticationRequired).toBe(true);
    });

    it('should stop asking once the user logs in', () => {
      store.getState().requireReauthentication();
      store.getState().login(createAccessToken(createPayload([createGroup('a')])));
      expect(store.getState().isReauthenticationRequired).toBe(false);
    });

    it('should swap in the newer token and stop asking for the password', () => {
      store.getState().login(createAccessToken(createPayload([createGroup('a')])));
      store.getState().requireReauthentication();
      const renewed = createAccessToken(
        createPayload([createGroup('a')], { exp: ISSUED_AT + 960, iat: ISSUED_AT + 60 })
      );
      expect(store.getState().reauthenticate(renewed)).toBe('accepted');
      expect(store.getState().accessToken).toBe(renewed);
      expect(store.getState().isReauthenticationRequired).toBe(false);
    });

    it('should keep the session and the group in use, so an instrument being filled in stays mounted', () => {
      const groups = [createGroup('a'), createGroup('b')];
      store.getState().login(createAccessToken(createPayload(groups)));
      store.getState().changeGroup(groups[1]!);
      store.setState({ currentSession: session });
      store.getState().reauthenticate(createAccessToken(createPayload(groups)));
      expect(store.getState().currentGroup?.id).toBe('b');
      expect(store.getState().currentSession).toBe(session);
    });

    it('should hand out the same user and group objects when nothing in them changed, so a renewal re-runs no effect', () => {
      store.getState().login(createAccessToken(createPayload([createGroup('a')])));
      const { currentGroup, currentUser } = store.getState();
      store.getState().reauthenticate(createAccessToken(createPayload([createGroup('a')], { exp: ISSUED_AT + 960 })));
      expect(store.getState().currentGroup).toBe(currentGroup);
      expect(store.getState().currentUser).toBe(currentUser);
    });

    it('should take the group from the new token when its settings changed', () => {
      store.getState().login(createAccessToken(createPayload([createGroup('a')])));
      const renamed = { ...createGroup('a'), name: 'Renamed' };
      store.getState().reauthenticate(createAccessToken(createPayload([renamed])));
      expect(store.getState().currentGroup?.name).toBe('Renamed');
    });

    it('should rebuild the ability when the permissions changed', () => {
      store.getState().login(createAccessToken(createPayload([createGroup('a')])));
      const permissions: TokenPayload['permissions'] = [{ action: 'delete', groupId: null, subject: 'Subject' }];
      store.getState().reauthenticate(createAccessToken(createPayload([createGroup('a')], { permissions })));
      expect(store.getState().currentUser?.ability.can('delete', 'Subject')).toBe(true);
    });

    it('should take the user from the new token when their details changed', () => {
      store.getState().login(createAccessToken(createPayload([createGroup('a')])));
      store.getState().reauthenticate(createAccessToken(createPayload([createGroup('a')], { firstName: 'Janet' })));
      expect(store.getState().currentUser?.firstName).toBe('Janet');
    });

    it('should keep a group the token does not list, since an administrator may work in one they do not belong to', () => {
      store.getState().login(createAccessToken(createPayload([])));
      const group = createGroup('elsewhere');
      store.getState().changeGroup(group);
      store.getState().reauthenticate(createAccessToken(createPayload([])));
      expect(store.getState().currentGroup).toBe(group);
    });

    it("should refuse another user's token, so their requests are never sent as this tab's user", () => {
      const accessToken = createAccessToken(createPayload([createGroup('a')]));
      store.getState().login(accessToken);
      const other = createAccessToken(createPayload([createGroup('a')], { id: 'user-2' }));
      expect(store.getState().reauthenticate(other)).toBe('differentUser');
      expect(store.getState().accessToken).toBe(accessToken);
    });

    it('should refuse any token while nobody is signed in', () => {
      expect(store.getState().reauthenticate(createAccessToken(createPayload([])))).toBe('differentUser');
    });

    it('should refuse a token confined to resetting the password, which could not carry on the work in progress', () => {
      const accessToken = createAccessToken(createPayload([createGroup('a')]));
      store.getState().login(accessToken);
      const confined = createAccessToken(createPayload([createGroup('a')], { mustResetPassword: true }));
      expect(store.getState().reauthenticate(confined)).toBe('mustResetPassword');
      expect(store.getState().accessToken).toBe(accessToken);
    });

    it('should renew a token confined to resetting the password while the user is still resetting it', () => {
      store.getState().login(createAccessToken(createPayload([], { mustResetPassword: true })));
      const renewed = createAccessToken(createPayload([], { exp: ISSUED_AT + 960, mustResetPassword: true }));
      expect(store.getState().reauthenticate(renewed)).toBe('accepted');
    });
  });
});
