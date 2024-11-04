import type { JwtPayload } from '@opendatacapture/schemas/auth';
import type { BaseAppAbility } from '@opendatacapture/schemas/core';
import type { Group } from '@opendatacapture/schemas/group';
import type { Session } from '@opendatacapture/schemas/session';
import type { Simplify } from 'type-fest';
import type { StateCreator } from 'zustand';

export type CurrentUser = Omit<JwtPayload, 'permissions'> & {
  ability: BaseAppAbility;
};

export type AuthSlice = {
  accessToken: null | string;
  changeGroup: (group: Group) => void;
  currentGroup: Group | null;
  currentUser: CurrentUser | null;
  login: (accessToken: string) => void;
  logout: () => void;
};

export type DisclaimerSlice = {
  isDisclaimerAccepted: boolean;
  setIsDisclaimerAccepted: (isDisclaimerAccepted: boolean) => void;
};

export type SessionSlice = {
  currentSession: null | Session;
  endSession: () => void;
  startSession: (session: Session) => void;
};

export type WalkthroughSlice = {
  isWalkthroughComplete: boolean;
  isWalkthroughOpen: boolean;
  setIsWalkthroughComplete: (isWalkthroughComplete: boolean) => void;
  setIsWalkthroughOpen: (isWalkthroughOpen: boolean) => void;
};

export type AppStore = Simplify<AuthSlice & DisclaimerSlice & SessionSlice & WalkthroughSlice>;

export type SliceCreator<T extends { [key: string]: unknown }> = StateCreator<
  AppStore,
  [['zustand/immer', never], never],
  [['zustand/immer', never]],
  T
>;
