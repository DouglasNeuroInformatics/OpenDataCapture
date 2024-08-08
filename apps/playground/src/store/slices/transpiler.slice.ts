import type { SliceCreator, TranspilerInitialState, TranspilerSlice } from '../types';

const initialTranspilerState: TranspilerInitialState = {
  status: 'initial'
};

export const createTranspilerSlice: SliceCreator<TranspilerSlice> = (set) => ({
  setTranspilerState: (updatedTranspilerState) => {
    set((state) => {
      state.transpilerState = updatedTranspilerState;
    });
  },
  transpilerState: initialTranspilerState
});
