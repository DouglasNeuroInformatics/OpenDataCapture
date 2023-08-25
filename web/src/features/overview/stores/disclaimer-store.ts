import { create } from 'zustand';

// username is required for state to be self-contained and account for logout of previous user
export type DisclaimerStore = {
  isAccepted: boolean;
  username: string | null;
  setIsAccepted: (isAccepted: boolean, username: string) => void;
}

export const useDisclaimerStore = create<DisclaimerStore>((set) => ({
  isAccepted: false,
  username: null,
  setIsAccepted: (isAccepted, username) => { set({ isAccepted, username }); }
}));
