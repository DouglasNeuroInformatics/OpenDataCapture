import { create } from 'zustand';

type ViewerStore = {
  forceRefresh: () => void;
  key: number;
};

export const useViewerStore = create<ViewerStore>((set) => ({
  forceRefresh: () =>
    set(({ key }) => ({
      key: key + 1
    })),
  key: 0
}));
