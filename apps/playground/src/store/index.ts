/* eslint-disable import/exports-last */
import { del, get, set } from 'idb-keyval';
import { jwtDecode } from 'jwt-decode';
import { pick } from 'lodash-es';
import { create } from 'zustand';
import { createJSONStorage, devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import type { StateStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { resolveIndexFilename } from '@/utils/file';

import { createAuthSlice } from './slices/auth.slice';
import { createEditorSlice } from './slices/editor.slice';
import { createInstrumentSlice } from './slices/instrument.slice';
import { createSettingsSlice } from './slices/settings.slice';
import { createTranspilerSlice } from './slices/transpiler.slice';
import { createViewerSlice } from './slices/viewer.slice';

import type { AppStore } from './types';

const storage: StateStorage = {
  getItem: async (name: string): Promise<null | string> => {
    return (await get(name)) ?? null;
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  }
};

export const useAppStore = create(
  devtools(
    persist(
      subscribeWithSelector(
        immer<AppStore>((...a) => ({
          ...createAuthSlice(...a),
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
            | (Partial<Pick<AppStore, 'instruments' | 'selectedInstrument' | 'settings'>> & { _accessToken?: string })
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
          const state: AppStore = { ...currentState, instruments, selectedInstrument, settings };
          if (persistedState?._accessToken) {
            try {
              state.auth = {
                accessToken: persistedState._accessToken,
                payload: jwtDecode(persistedState._accessToken)
              };
            } catch (_) {
              // if token is expired, ignore
            }
          }
          return state;
        },
        name: 'app',
        partialize: (state) => {
          return {
            ...pick(state, ['instruments', 'selectedInstrument', 'settings']),
            _accessToken: state.auth?.accessToken
          };
        },
        storage: createJSONStorage(() => storage),
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
