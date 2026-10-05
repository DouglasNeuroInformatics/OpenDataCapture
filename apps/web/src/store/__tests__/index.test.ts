import type { Session } from '@opendatacapture/schemas/session';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAppStore } from '@/store';

const session: Session = {
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  date: new Date('2026-01-01T00:00:00.000Z'),
  groupId: 'group-1',
  id: 'session-1',
  subject: null,
  subjectId: 'subject-1',
  type: 'IN_PERSON',
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  userId: 'user-1'
};

const readPersistedState = (): unknown => JSON.parse(localStorage.getItem('app') ?? 'null');

const importFreshStore = async () => {
  vi.resetModules();
  const { useAppStore: freshStore } = await import('@/store');
  return freshStore;
};

describe('useAppStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should compose every slice into one store', () => {
    expect(Object.keys(useAppStore.getState())).toEqual(
      expect.arrayContaining(['accessToken', 'pendingRetries', 'isDisclaimerAccepted', 'groupSwitcherPosition'])
    );
    expect(Object.keys(useAppStore.getState())).toEqual(
      expect.arrayContaining(['currentSession', 'isWalkthroughComplete'])
    );
  });

  it('should persist only the device preferences, so auth and session state cannot outlive the tab', () => {
    useAppStore.setState({
      accessToken: 'secret',
      currentSession: session,
      groupSwitcherPosition: 'topbar',
      isDisclaimerAccepted: true,
      isWalkthroughComplete: true,
      preferredGroupId: 'group-1'
    });
    expect(readPersistedState()).toEqual({
      state: {
        groupSwitcherPosition: 'topbar',
        isDisclaimerAccepted: true,
        isWalkthroughComplete: true,
        preferredGroupId: 'group-1'
      },
      version: 1
    });
  });

  it('should restore persisted preferences when the app loads', async () => {
    localStorage.setItem('app', JSON.stringify({ state: { isDisclaimerAccepted: true }, version: 1 }));
    const freshStore = await importFreshStore();
    expect(freshStore.getState().isDisclaimerAccepted).toBe(true);
  });

  it('should carry preferences across a store version bump, so an upgrade does not reset them', async () => {
    localStorage.setItem(
      'app',
      JSON.stringify({ state: { groupSwitcherPosition: 'topbar', isWalkthroughComplete: true }, version: 0 })
    );
    const freshStore = await importFreshStore();
    expect(freshStore.getState()).toMatchObject({ groupSwitcherPosition: 'topbar', isWalkthroughComplete: true });
  });

  it('should drop stale keys from an older store version, so they never leak back into the store', async () => {
    localStorage.setItem('app', JSON.stringify({ state: { accessToken: 'stale', pendingRetries: 3 }, version: 0 }));
    const freshStore = await importFreshStore();
    expect(freshStore.getState()).toMatchObject({ accessToken: null, pendingRetries: 0 });
  });
});
