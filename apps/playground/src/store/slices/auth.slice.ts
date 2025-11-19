import { jwtDecode } from 'jwt-decode';

import type { AuthSlice, SliceCreator } from '../types';

export const createAuthSlice: SliceCreator<AuthSlice> = (set) => ({
  auth: null,
  login: (accessToken) => {
    set((state) => {
      state.auth = {
        accessToken,
        payload: jwtDecode(accessToken)
      };
    });
  }
});
