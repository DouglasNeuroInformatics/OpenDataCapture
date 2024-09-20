import type { DisclaimerSlice, SliceCreator } from '../types';

export const createDisclaimerSlice: SliceCreator<DisclaimerSlice> = (set) => ({
  isDisclaimerAccepted: false,
  setIsDisclaimerAccepted: (isDisclaimerAccepted) => {
    set((state) => {
      state.isDisclaimerAccepted = isDisclaimerAccepted;
    });
  }
});
