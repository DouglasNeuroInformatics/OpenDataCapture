import type { SessionSlice, SliceCreator } from '../types';

export const createSessionSlice: SliceCreator<SessionSlice> = (set) => ({
  currentSession: null,
  endSession() {
    set((state) => {
      state.currentSession = null;
    });
  },
  startSession(session) {
    set((state) => {
      state.currentSession = session;
    });
  }
});
