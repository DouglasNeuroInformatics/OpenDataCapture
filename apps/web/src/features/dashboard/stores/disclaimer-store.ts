import { create } from 'zustand';

// username is required for state to be self-contained and account for logout of previous user
export type DisclaimerStore = {
  isAccepted: boolean;
  setIsAccepted: (isAccepted: boolean, username: string) => void;
  username: null | string;
};

export const useDisclaimerStore = create<DisclaimerStore>((set) => ({
  isAccepted: false,
  setIsAccepted: (isAccepted, username) => {
    set({ isAccepted, username });
  },
  username: null
}));
