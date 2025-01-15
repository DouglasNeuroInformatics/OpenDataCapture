import { pick } from 'lodash-es';
import { create } from 'zustand';
import { createJSONStorage, persist, subscribeWithSelector } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { resolveIndexFilename } from '@/utils/file';

import { createEditorSlice } from './slices/editor.slice';
import { createInstrumentSlice } from './slices/instrument.slice';
import { createSettingsSlice } from './slices/settings.slice';
import { createTranspilerSlice } from './slices/transpiler.slice';
import { createViewerSlice } from './slices/viewer.slice';

import type { AppStore } from './types';

export const useAppStore = create(
  devtools(
    persist(
      subscribeWithSelector(
        immer<AppStore>((...a) => ({
          ...createEditorSlice(...a),
          ...createInstrumentSlice(...a),
          ...createSettingsSlice(...a),
          ...createTranspilerSlice(...a),
          ...createViewerSlice(...a)
        }))
      ),
      {
        merge: (_persistedState, currentState) => {
          const persistedState = _persistedState as
            | Partial<Pick<AppStore, 'instruments' | 'selectedInstrument' | 'settings'>>
            | undefined;
          const instruments = [
            ...currentState.instruments,
            ...(persistedState?.instruments ?? []).filter((instrument) => {
              return instrument.category === 'Saved';
            })
          ];
          const selectedInstrument =
            instruments.find(({ id }) => id === persistedState?.selectedInstrument?.id) ??
            currentState.selectedInstrument;
          const settings = persistedState?.settings ?? currentState.settings;
          return { ...currentState, instruments, selectedInstrument, settings };
        },
        name: 'app',
        partialize: (state) => pick(state, ['instruments', 'selectedInstrument', 'settings']),
        storage: createJSONStorage(() => localStorage),
        version: 1
      }
    )
  )
);

const { selectedInstrument } = useAppStore.getState();
const indexFilename = resolveIndexFilename(selectedInstrument.files)!;
useAppStore.setState({
  files: selectedInstrument.files,
  indexFilename: indexFilename,
  openFilenames: [indexFilename],
  selectedFilename: indexFilename
});
