import type { TokenPayload } from '@opendatacapture/schemas/auth';
import type { BaseAppAbility } from '@opendatacapture/schemas/core';
import type { Group } from '@opendatacapture/schemas/group';
import type { Session } from '@opendatacapture/schemas/session';
import type { Simplify } from 'type-fest';
import type { StateCreator } from 'zustand';

export type CurrentUser = Omit<TokenPayload, 'basePermissionLevel' | 'kind' | 'permissions' | 'renewal'> & {
  ability: BaseAppAbility;
};

/** Both times are on this tab's clock, counted from the moment the token arrived. */
export type AccessTokenValidity = {
  expiresAt: number;
  /** False once the token already runs to the end of the sign-in, so activity cannot extend it. */
  isRenewable: boolean;
  receivedAt: number;
};

export type AuthSlice = {
  accessToken: null | string;
  accessTokenValidity: AccessTokenValidity | null;
  changeGroup: (group: Group | null) => void;
  currentGroup: Group | null;
  currentUser: CurrentUser | null;
  /** Marks the token in hand as the last this sign-in gets, for when a renewal can never be used. */
  endAccessTokenRenewal: () => void;
  isReauthenticationRequired: boolean;
  login: (accessToken: string) => void;
  logout: () => void;
  /**
   * Swaps in a newer token, keeping the group and session the user is working in. A token is refused,
   * and nothing changes, when it could not carry on that work: it belongs to someone else, or it is
   * confined to resetting a password the tab was not already resetting.
   */
  reauthenticate: (accessToken: string) => 'accepted' | 'differentUser' | 'mustResetPassword';
  requireReauthentication: () => void;
};

export type ConnectivitySlice = {
  /** Increment the count of requests currently retrying after a transient network failure. */
  beginRetry: () => void;
  /** Decrement the count once a retrying request has finally resolved or given up. */
  endRetry: () => void;
  /** Whether the browser currently reports a network connection (from the `online`/`offline` events). */
  isOnline: boolean;
  /** Number of requests currently in a retry/backoff cycle; > 0 means connectivity is degraded. */
  pendingRetries: number;
  setIsOnline: (isOnline: boolean) => void;
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

export type PreferencesSlice = {
  /** The group last selected on this device, reselected at login when the user still belongs to it. */
  preferredGroupId: null | string;
};

export type WalkthroughSlice = {
  isWalkthroughComplete: boolean;
  isWalkthroughOpen: boolean;
  setIsWalkthroughComplete: (isWalkthroughComplete: boolean) => void;
  setIsWalkthroughOpen: (isWalkthroughOpen: boolean) => void;
};

export type AppStore = Simplify<
  AuthSlice & ConnectivitySlice & DisclaimerSlice & PreferencesSlice & SessionSlice & WalkthroughSlice
>;

export type SliceCreator<T extends { [key: string]: unknown }> = StateCreator<
  AppStore,
  [['zustand/immer', never], never],
  [['zustand/immer', never]],
  T
>;
