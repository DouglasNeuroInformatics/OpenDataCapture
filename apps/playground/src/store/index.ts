import { pick } from 'lodash-es';
import { create } from 'zustand';
import { createJSONStorage, persist, subscribeWithSelector } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { resolveIndexFilename } from '@/utils/file';

import { createEditorSlice } from './slices/editor.slice';
import { createInstrumentSlice } from './slices/instrument.slice';
import { createSettingsSlice } from './slices/settings.slice';
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
          ...createViewerSlice(...a)
        }))
      ),
      {
        name: 'app',
        partialize: (state) => pick(state, ['instruments', 'selectedInstrument', 'settings']),
        storage: createJSONStorage(() => localStorage),
        version: 0
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
