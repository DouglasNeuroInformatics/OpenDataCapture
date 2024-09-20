import type { SliceCreator, WalkthroughSlice } from '../types';

export const createWalkthroughSlice: SliceCreator<WalkthroughSlice> = (set) => ({
  isWalkthroughComplete: false,
  isWalkthroughOpen: false,
  setIsWalkthroughComplete: (isWalkthroughComplete) => {
    set((state) => {
      state.isWalkthroughComplete = isWalkthroughComplete;
    });
  },
  setIsWalkthroughOpen: (isWalkthroughOpen) => {
    set((state) => {
      state.isWalkthroughOpen = isWalkthroughOpen;
    });
  }
});
