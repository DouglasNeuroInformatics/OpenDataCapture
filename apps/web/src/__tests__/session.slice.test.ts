import type { Session } from '@opendatacapture/schemas/session';
import { beforeEach, describe, expect, it } from 'vitest';

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

const initialState = useAppStore.getState();

describe('createSessionSlice', () => {
  beforeEach(() => {
    useAppStore.setState(initialState, true);
  });

  it('should start with no session in progress', () => {
    expect(useAppStore.getState().currentSession).toBeNull();
  });

  it('should make a started session the current one', () => {
    useAppStore.getState().startSession(session);
    expect(useAppStore.getState().currentSession).toEqual(session);
  });

  it('should clear the current session when it ends', () => {
    useAppStore.getState().startSession(session);
    useAppStore.getState().endSession();
    expect(useAppStore.getState().currentSession).toBeNull();
  });
});
