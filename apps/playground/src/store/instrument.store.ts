import type { InstrumentKind } from '@opendatacapture/schemas/instrument';
import { create } from 'zustand';

import formWithDynamicField from '@/examples/form/form-with-dynamic-field.instrument?raw';
import multilingualForm from '@/templates/form/multilingual-form.instrument?raw';
import unilingualForm from '@/templates/form/unilingual-form.instrument?raw';
import interactiveInstrument from '@/templates/interactive/interactive.instrument?raw';

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
  instruments: InstrumentStoreItem[];
  removeInstrument: (id: string) => void;
  selectedInstrument: InstrumentStoreItem;
  setSelectedInstrument: (id: string) => void;
};

const templates: InstrumentStoreItem[] = [
  {
    category: 'Templates',
    id: crypto.randomUUID(),
    kind: 'FORM',
    label: 'Unilingual Form',
    source: unilingualForm
  },
  {
    category: 'Templates',
    id: crypto.randomUUID(),
    kind: 'FORM',
    label: 'Multilingual Form',
    source: multilingualForm
  },
  {
    category: 'Templates',
    id: crypto.randomUUID(),
    kind: 'INTERACTIVE',
    label: 'Interactive Instrument',
    source: interactiveInstrument
  }
];

const examples: InstrumentStoreItem[] = [
  {
    category: 'Examples',
    id: crypto.randomUUID(),
    kind: 'FORM',
    label: 'Form With Dynamic Field',
    source: formWithDynamicField
  }
];

export const DEFAULT_INSTRUMENT = templates[0];

export const useInstrumentStore = create<InstrumentStore>((set) => ({
  addInstrument: (item) => set(({ instruments }) => ({ instruments: [...instruments, item] })),
  instruments: [...templates, ...examples],
  removeInstrument: (id) => set(({ instruments }) => ({ instruments: instruments.filter((item) => item.id !== id) })),
  selectedInstrument: DEFAULT_INSTRUMENT,
  setSelectedInstrument: (id) => {
    set(({ instruments }) => {
      return { selectedInstrument: instruments.find((item) => item.id === id) };
    });
  }
}));

export type { InstrumentCategory, InstrumentStore, InstrumentStoreItem };