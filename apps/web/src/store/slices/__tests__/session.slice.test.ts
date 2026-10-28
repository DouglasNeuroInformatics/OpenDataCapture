import type { Session } from '@opendatacapture/schemas/session';
import { beforeEach, describe, expect, it } from 'vitest';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { useAppStore } from '@/store';
import type { AppStore } from '@/store/types';

import { createSessionSlice } from '../session.slice';

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

const createStore = () =>
  create(immer<AppStore>((...a) => ({ ...useAppStore.getState(), ...createSessionSlice(...a) })));

describe('createSessionSlice', () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();
  });

  it('should start with no session in progress', () => {
    expect(store.getState().currentSession).toBeNull();
  });

  it('should make a started session the current one', () => {
    store.getState().startSession(session);
    expect(store.getState().currentSession).toEqual(session);
  });

  it('should clear the current session when it ends', () => {
    store.getState().startSession(session);
    store.getState().endSession();
    expect(store.getState().currentSession).toBeNull();
  });
});
