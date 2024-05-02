import type { SliceCreator, ViewerSlice } from '../types';

export const createViewerSlice: SliceCreator<ViewerSlice> = (set) => ({
  viewer: {
    forceRefresh: () => {
      set((state) => {
        state.viewer.key += 1;
      });
    },
    key: 0
  }
});
