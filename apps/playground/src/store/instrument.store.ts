import { type InstrumentKind } from '@opendatacapture/schemas/instrument';
import type { OmitDeep } from 'type-fest';
import { create } from 'zustand';
import { createJSONStorage, persist, subscribeWithSelector } from 'zustand/middleware';

import formReference from '@/examples/form/form-reference.instrument?raw';
import formWithGroups from '@/examples/form/form-with-groups.instrument?raw';
import formWithSimpleDynamicField from '@/examples/form/form-with-simple-dynamic-field.instrument?raw';
import interactiveWithReact from '@/examples/interactive/interactive-with-react.instrument?raw';
import interactiveWithCssIndex from '@/examples/interactive-with-css/index.ts?raw';
import interactiveWithCssStyle from '@/examples/interactive-with-css/style.css?raw';
import type { EditorFile } from '@/models/editor-file.model';
import multilingualForm from '@/templates/form/multilingual-form.instrument?raw';
import unilingualForm from '@/templates/form/unilingual-form.instrument?raw';
import interactiveInstrument from '@/templates/interactive/interactive.instrument?raw';
import { sha256 } from '@/utils/hash';

type InstrumentCategory = 'Examples' | 'Saved' | 'Templates';

type InstrumentStoreItem = {
  category: InstrumentCategory;
  files: EditorFile[];
  id: string;
  kind: InstrumentKind;
  label: string;
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

const createStoreItems = async (
  instruments: OmitDeep<InstrumentStoreItem, 'id' | `files.${number}.id`>[]
): Promise<InstrumentStoreItem[]> => {
  return Promise.all(
    instruments.map(async (instrument) => {
      const files: EditorFile[] = await Promise.all(
        instrument.files.map(async (file) => ({ ...file, id: await sha256(file.value) }))
      );
      return {
        ...instrument,
        files,
        id: crypto.randomUUID()
      };
    })
  );
};

const templates: InstrumentStoreItem[] = await createStoreItems([
  {
    category: 'Templates',
    files: [
      {
        language: 'typescript',
        name: 'index.ts',
        value: unilingualForm
      }
    ],
    kind: 'FORM',
    label: 'Unilingual Form'
  },
  {
    category: 'Templates',
    files: [
      {
        language: 'typescript',
        name: 'index.ts',
        value: multilingualForm
      }
    ],
    kind: 'FORM',
    label: 'Multilingual Form'
  },
  {
    category: 'Templates',
    files: [
      {
        language: 'typescript',
        name: 'index.ts',
        value: interactiveInstrument
      }
    ],
    kind: 'INTERACTIVE',
    label: 'Interactive Instrument'
  }
]);

const examples: InstrumentStoreItem[] = await createStoreItems([
  {
    category: 'Examples',
    files: [
      {
        language: 'typescript',
        name: 'index.ts',
        value: formWithGroups
      }
    ],
    kind: 'FORM',
    label: 'Form With Groups'
  },
  {
    category: 'Examples',
    files: [
      {
        language: 'typescript',
        name: 'index.ts',
        value: formWithSimpleDynamicField
      }
    ],
    kind: 'FORM',
    label: 'Form With Simple Dynamic Field'
  },
  {
    category: 'Examples',
    files: [
      {
        language: 'typescript',
        name: 'index.ts',
        value: formReference
      }
    ],
    kind: 'FORM',
    label: 'Form Reference'
  },
  {
    category: 'Examples',
    files: [
      {
        language: 'typescript',
        name: 'index.tsx',
        value: interactiveWithReact
      }
    ],
    kind: 'INTERACTIVE',
    label: 'Interactive With React'
  },
  {
    category: 'Examples',
    files: [
      {
        language: 'typescript',
        name: 'index.ts',
        value: interactiveWithCssIndex
      },
      {
        language: 'css',
        name: 'style.css',
        value: interactiveWithCssStyle
      }
    ],
    kind: 'INTERACTIVE',
    label: 'Interactive With CSS'
  }
]);

const DEFAULT_INSTRUMENTS = [...templates, ...examples];

export const useInstrumentStore = create(
  subscribeWithSelector(
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
        storage: createJSONStorage(() => localStorage),
        version: 1
      }
    )
  )
);

export type { InstrumentCategory, InstrumentStore, InstrumentStoreItem };
