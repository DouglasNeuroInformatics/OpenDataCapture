import { createMongoAbility } from '@casl/ability';
import type { JwtPayload } from '@open-data-capture/common/auth';
import type { AppAbility } from '@open-data-capture/common/core';
import type { Group } from '@open-data-capture/common/group';
import { jwtDecode } from 'jwt-decode';
import { create } from 'zustand';

import { useActiveVisitStore } from './active-visit-store';

export type CurrentUser = {
  ability: AppAbility;
} & Omit<JwtPayload, 'permissions'>;

export type AuthStore = {
  accessToken: null | string;
  currentGroup: Group | null;
  currentUser: CurrentUser | null;
  logout: () => void;
  setAccessToken: (accessToken: string) => void;
  setCurrentGroup: (group: Group) => void;
  testSetAccessToken: (accessToken: string) => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  accessToken: null,
  currentGroup: null,
  currentUser: null,
  logout: () => {
    useActiveVisitStore.setState({ activeVisit: null });
    set({ accessToken: null, currentUser: null });
  },
  setAccessToken: (accessToken) => {
    const { groups, permissions, ...rest } = jwtDecode<JwtPayload>(accessToken);
    console.log('successful login');
    console.log(jwtDecode<JwtPayload>(accessToken));
    console.log(permissions);
    const ability = createMongoAbility<AppAbility>(permissions);
    set({
      accessToken,
      currentGroup: groups[0],
      currentUser: { ability, groups, ...rest }
    });
  },
  setCurrentGroup: (group) => {
    set({ currentGroup: group });
  },

  testSetAccessToken: (accessToken) => {
    const { groups, permissions, ...rest } = jwtDecode<JwtPayload>(
      'ew0KICAiYWxnIjogIkhTMjU2IiwNCiAgInR5cCI6ICJKV1QiDQp9.ew0KICAgICAgImdyb3VwcyI6IFtdLA0KICAgICAgInBlcm1pc3Npb25zIjogWw0KICAgICAgICAgIHsNCiAgICAgICAgICAgICAgImFjdGlvbiI6ICJtYW5hZ2UiLA0KICAgICAgICAgICAgICAic3ViamVjdCI6ICJhbGwiDQogICAgICAgICAgfQ0KICAgICAgXSwNCiAgICAgICJ1c2VybmFtZSI6ICJkYXZpZCIsDQogICAgICAiaWF0IjogMTY5OTQ4MTU4MywNCiAgICAgICJleHAiOiAxNjk5NTY3OTgzDQogIH0NCg=='
    );
    /* convert this from base64
    {
      "groups": [],
      "permissions": [
          {
              "action": "manage",
              "subject": "all"
          }
      ],
      "username": "david",
      "iat": 1699481583,
      "exp": 1699567983
  }
    */
    console.log('successful login');
    console.log(jwtDecode<JwtPayload>(accessToken));
    console.log(permissions);
    const ability = createMongoAbility<AppAbility>(permissions);
    set({
      accessToken,
      currentGroup: groups[0],
      currentUser: { ability, groups, ...rest }
    });
  }
}));
