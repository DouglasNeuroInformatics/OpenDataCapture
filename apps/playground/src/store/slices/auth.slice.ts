import { jwtDecode } from 'jwt-decode';

import type { AuthSlice, SliceCreator } from '../types';

export const createAuthSlice: SliceCreator<AuthSlice> = (set, get) => ({
  auth: null,
  login: (accessToken) => {
    set((state) => {
      state.auth = {
        accessToken,
        payload: jwtDecode(accessToken)
      };
    });
  },
  revalidateToken: () => {
    const { auth } = get();
    if (auth?.payload.exp && Date.now() / 1000 > auth.payload.exp) {
      set((state) => {
        state.auth = null;
      });
    }
  }
});
