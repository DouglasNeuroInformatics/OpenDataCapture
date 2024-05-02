import { merge } from 'lodash-es';

import { defaultInstruments, defaultSelectedInstrument } from '@/instruments';
import { resolveIndexFilename } from '@/utils/file';

import type { InstrumentSlice, SliceCreator } from '../types';

export const createInstrumentSlice: SliceCreator<InstrumentSlice> = (set) => ({
  addInstrument: (instrument) =>
    set((state) => {
      const isExisting = state.instruments.find((item) => instrument.id === item.id);
      if (isExisting) {
        console.error(`Instrument with ID '${instrument.id}' already exists`);
        return;
      }
      state.instruments.push(instrument);
    }),
  instruments: defaultInstruments,
  removeInstrument: (id) => {
    set((state) => {
      state.instruments = state.instruments.filter((item) => item.id !== id);
      state.selectedInstrument = defaultSelectedInstrument;
    });
  },
  resetInstruments: () => {
    set((state) => {
      const indexFilename = resolveIndexFilename(defaultSelectedInstrument.files)!;
      state.instruments = defaultInstruments;
      state.selectedInstrument = defaultSelectedInstrument;
      state.files = defaultSelectedInstrument.files;
      state.indexFilename = indexFilename;
      state.openFilenames = [indexFilename];
      state.selectedFilename = indexFilename;
    });
  },
  selectedInstrument: defaultSelectedInstrument,
  setSelectedInstrument: (id) => {
    set((state) => {
      const instrument = state.instruments.find((item) => item.id === id);
      if (!instrument) {
        console.error(`Failed to find instrument with ID: ${id}`);
        return;
      }
      const indexFilename = resolveIndexFilename(instrument.files);
      state.selectedInstrument = instrument;
      state.files = instrument.files;
      state.indexFilename = indexFilename ?? null;
      state.openFilenames = indexFilename ? [indexFilename] : [];
      state.selectedFilename = indexFilename ?? null;
    });
  },
  updateSelectedInstrument: (update) => {
    set((state) => {
      const selectedIndex = state.instruments.findIndex((instrument) => instrument.id === state.selectedInstrument.id);
      const updatedInstrument = merge(state.selectedInstrument, update);
      state.selectedInstrument = updatedInstrument;
      state.instruments[selectedIndex] = updatedInstrument;
    });
  }
});
