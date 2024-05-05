import { PureAbility, createMongoAbility } from '@casl/ability';
import type { JwtPayload } from '@opendatacapture/schemas/auth';
import type { AppAction, AppSubjectName } from '@opendatacapture/schemas/core';
import { jwtDecode } from 'jwt-decode';

import type { AuthSlice, SliceCreator } from '../types';

export const createAuthSlice: SliceCreator<AuthSlice> = (set, get) => ({
  accessToken: null,
  changeGroup: (group) => {
    set({ currentGroup: group });
  },
  currentGroup: null,
  currentUser: null,
  login: (accessToken) => {
    const { groups, permissions, ...rest } = jwtDecode<JwtPayload>(accessToken);
    const ability = createMongoAbility<PureAbility<[AppAction, AppSubjectName], any>>(permissions);
    set({
      accessToken,
      currentGroup: groups[0],
      currentUser: { ability, groups, ...rest }
    });
  },
  logout: () => {
    get().endSession();
    set((state) => {
      state.accessToken = null;
      state.currentGroup = null;
      state.currentUser = null;
    });
  }
});
