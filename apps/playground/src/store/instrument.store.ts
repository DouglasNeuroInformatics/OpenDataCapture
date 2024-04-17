import { type InstrumentKind } from '@opendatacapture/schemas/instrument';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import formReference from '@/examples/form/form-reference.instrument?raw';
import formWithGroups from '@/examples/form/form-with-groups.instrument?raw';
import formWithSimpleDynamicField from '@/examples/form/form-with-simple-dynamic-field.instrument?raw';
import interactiveWithReact from '@/examples/interactive/interactive-with-react.instrument?raw';
import multilingualForm from '@/templates/form/multilingual-form.instrument?raw';
import unilingualForm from '@/templates/form/unilingual-form.instrument?raw';
import interactiveInstrument from '@/templates/interactive/interactive.instrument?raw';
import { sha256 } from '@/utils/hash';

type InstrumentCategory = 'Examples' | 'Saved' | 'Templates';

type InstrumentStoreItem = {
  category: InstrumentCategory;
  id: string;
  kind: InstrumentKind;
  label: string;
  source: string;
};

type InstrumentStore = {
  addInstrument: (item: InstrumentStoreItem) => void;
  defaultInstrument: InstrumentStoreItem;
  instruments: InstrumentStoreItem[];
  removeInstrument: (id: string) => void;
  resetInstruments: () => void;
  selectedInstrument: InstrumentStoreItem;
  setSelectedInstrument: (id: string) => void;
};

const templates: InstrumentStoreItem[] = [
  {
    category: 'Templates',
    id: await sha256(unilingualForm),
    kind: 'FORM',
    label: 'Unilingual Form',
    source: unilingualForm
  },
  {
    category: 'Templates',
    id: await sha256(multilingualForm),
    kind: 'FORM',
    label: 'Multilingual Form',
    source: multilingualForm
  },
  {
    category: 'Templates',
    id: await sha256(interactiveInstrument),
    kind: 'INTERACTIVE',
    label: 'Interactive Instrument',
    source: interactiveInstrument
  }
];

const examples: InstrumentStoreItem[] = [
  {
    category: 'Examples',
    id: await sha256(formWithGroups),
    kind: 'FORM',
    label: 'Form With Groups',
    source: formWithGroups
  },
  {
    category: 'Examples',
    id: await sha256(formWithSimpleDynamicField),
    kind: 'FORM',
    label: 'Form With Simple Dynamic Field',
    source: formWithSimpleDynamicField
  },
  {
    category: 'Examples',
    id: await sha256(formReference),
    kind: 'FORM',
    label: 'Form Reference',
    source: formReference
  },
  {
    category: 'Examples',
    id: await sha256(interactiveWithReact),
    kind: 'INTERACTIVE',
    label: 'Interactive With React',
    source: interactiveWithReact
  }
];

const DEFAULT_INSTRUMENTS = [...templates, ...examples];

export const useInstrumentStore = create(
  persist<InstrumentStore>(
    (set) => ({
      addInstrument: (item) =>
        set(({ instruments }) => {
          const isExistingInstrument = instruments.find((instrument) => instrument.id === item.id);
          if (isExistingInstrument) {
            console.error(`Instrument with ID '${item.id}' already exists`);
            return {};
          }
          return { instruments: [...instruments, item] };
        }),
      defaultInstrument: templates[0],
      instruments: DEFAULT_INSTRUMENTS,
      removeInstrument: (id) => {
        set(({ instruments }) => ({ instruments: instruments.filter((item) => item.id !== id) }));
      },
      resetInstruments: () => {
        set(({ defaultInstrument }) => ({ instruments: DEFAULT_INSTRUMENTS, selectedInstrument: defaultInstrument }));
      },
      selectedInstrument: templates[0],
      setSelectedInstrument: (id) => {
        set(({ defaultInstrument, instruments }) => {
          const instrument = instruments.find((item) => item.id === id);
          if (!instrument) {
            console.error(`Failed to find instrument with ID: ${id}`);
          }
          return { selectedInstrument: instrument ?? defaultInstrument };
        });
      }
    }),
    {
      name: 'instrument-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
);

export type { InstrumentCategory, InstrumentStore, InstrumentStoreItem };
