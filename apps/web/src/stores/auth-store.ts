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
      'ew0KICAiYWxnIjogIkhTMjU2IiwNCiAgInR5cCI6ICJKV1QiDQp9.IHsNCiAgICAgICJncm91cHMiOiBbXSwNCiAgICAgICJwZXJtaXNzaW9ucyI6IFsNCiAgICAgICAgICB7DQogICAgICAgICAgICAgICJhY3Rpb24iOiAibWFuYWdlIiwNCiAgICAgICAgICAgICAgInN1YmplY3QiOiAiYWxsIg0KICAgICAgICAgIH0NCiAgICAgIF0sDQogICAgICAidXNlcm5hbWUiOiAiZGF2aWQiLA0KICAgICAgImlhdCI6IDE2OTk0ODE1ODMsDQogICAgICAiZXhwIjogMTY5OTU2Nzk4Mw0KICB9'
    );
    // const { groups, permissions, ...rest } = {
    //   groups: [],
    //   permissions: [
    //     {
    //       action: 'manage',
    //       subject: 'all'
    //     }
    //   ],
    //   username: 'david',
    //   iat: 1699481583,
    //   exp: 1699567983
    // };
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

    console.log('here are the permissions');
    console.log(permissions);
    const ability = createMongoAbility<AppAbility>(permissions);
    set({
      accessToken,
      currentGroup: groups[0],
      currentUser: { ability, groups, ...rest }
    });
    console.log('successful login');
  }
}));
