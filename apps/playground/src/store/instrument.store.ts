import { $InstrumentKind } from '@opendatacapture/schemas/instrument';
import { z } from 'zod';
import { create } from 'zustand';

import formReference from '@/examples/form/form-reference.instrument?raw';
import formWithComplexDynamicField from '@/examples/form/form-with-complex-dynamic-field.instrument?raw';
import formWithGroups from '@/examples/form/form-with-groups.instrument?raw';
import formWithSimpleDynamicField from '@/examples/form/form-with-simple-dynamic-field.instrument?raw';
import multilingualForm from '@/templates/form/multilingual-form.instrument?raw';
import unilingualForm from '@/templates/form/unilingual-form.instrument?raw';
import interactiveInstrument from '@/templates/interactive/interactive.instrument?raw';

const $InstrumentStoreItem = z.object({
  category: z.enum(['Examples', 'Saved', 'Templates']),
  id: z.string().uuid(),
  kind: $InstrumentKind,
  label: z.string(),
  source: z.string()
});

type InstrumentStoreItem = z.infer<typeof $InstrumentStoreItem>;
type InstrumentCategory = InstrumentStoreItem['category'];

const instrumentStorage = {
  _genKey(label: string): string {
    return this._prefix + label;
  },
  _prefix: 'instrument--',
  add(item: InstrumentStoreItem): void {
    if (this.has(item)) {
      console.error(`Instrument with label ${item.label} already in local storage`);
      return;
    }
    localStorage.setItem(this._genKey(item.label), JSON.stringify(item));
  },
  get(label: string): InstrumentStoreItem | null {
    const item = localStorage.getItem(this._genKey(label));
    if (item === null) {
      return null;
    }
    try {
      return $InstrumentStoreItem.parse(JSON.parse(item));
    } catch (err) {
      console.error('Failed to parse saved instrument item', err);
      return null;
    }
  },
  getAll(): InstrumentStoreItem[] {
    const savedItems: InstrumentStoreItem[] = [];
    for (const key in localStorage) {
      if (key.startsWith(this._prefix)) {
        try {
          savedItems.push($InstrumentStoreItem.parse(JSON.parse(localStorage.getItem(key)!)));
        } catch (err) {
          console.error('Failed to parse saved instrument item', err);
        }
      }
    }
    return savedItems;
  },
  has(item: InstrumentStoreItem): boolean {
    return localStorage.getItem(this._genKey(item.label)) !== null;
  }
};

type InstrumentStore = {
  instruments: InstrumentStoreItem[];
  removeInstrument: (id: string) => void;
  saveInstrument: (item: InstrumentStoreItem) => void;
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
    label: 'Form With Groups',
    source: formWithGroups
  },
  {
    category: 'Examples',
    id: crypto.randomUUID(),
    kind: 'FORM',
    label: 'Form With Simple Dynamic Field',
    source: formWithSimpleDynamicField
  },
  {
    category: 'Examples',
    id: crypto.randomUUID(),
    kind: 'FORM',
    label: 'Form With Complex Dynamic Field',
    source: formWithComplexDynamicField
  },
  {
    category: 'Examples',
    id: crypto.randomUUID(),
    kind: 'FORM',
    label: 'Form Reference',
    source: formReference
  }
];

const saved = instrumentStorage.getAll();

export const DEFAULT_INSTRUMENT = templates[0];

export const useInstrumentStore = create<InstrumentStore>((set) => ({
  instruments: [...templates, ...examples, ...saved],
  removeInstrument: (id) => set(({ instruments }) => ({ instruments: instruments.filter((item) => item.id !== id) })),
  saveInstrument: (item) => {
    instrumentStorage.add(item);
    set(({ instruments }) => ({ instruments: [...instruments, item], selectedInstrument: item }));
  },
  selectedInstrument: DEFAULT_INSTRUMENT,
  setSelectedInstrument: (id) => {
    set(({ instruments }) => {
      return { selectedInstrument: instruments.find((item) => item.id === id) };
    });
  }
}));

export type { InstrumentCategory, InstrumentStore, InstrumentStoreItem };
