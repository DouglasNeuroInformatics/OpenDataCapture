import type { SliceCreator, WalkthroughSlice } from '../types';

export const createWalkthroughSlice: SliceCreator<WalkthroughSlice> = (set) => ({
  isWalkthroughComplete: false,
  setIsWalkthroughComplete: (isWalkthroughComplete) => {
    set((state) => {
      state.isWalkthroughComplete = isWalkthroughComplete;
    });
  }
});
