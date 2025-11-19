import type { AuthSlice, SliceCreator } from '../types';

export const createAuthSlice: SliceCreator<AuthSlice> = (set) => ({
  accessToken: null,
  setAccessToken: (accessToken) => {
    set((state) => {
      state.accessToken = accessToken;
    });
  }
});
