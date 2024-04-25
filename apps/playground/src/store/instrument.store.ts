import { type InstrumentKind } from '@opendatacapture/schemas/instrument';
import type { OmitDeep } from 'type-fest';
import { create } from 'zustand';
import { createJSONStorage, persist, subscribeWithSelector } from 'zustand/middleware';

import formReference from '@/examples/form/reference?raw';
import formWithGroups from '@/examples/form/with-groups?raw';
import formWithSimpleDynamicField from '@/examples/form/with-simple-dynamic-field?raw';
import interactiveWithCssStyle from '@/examples/interactive/with-css/style.css?raw';
import interactiveWithCssIndex from '@/examples/interactive/with-css?raw';
import interactiveWithReact from '@/examples/interactive/with-react?raw';
import type { EditorFile } from '@/models/editor-file.model';
import multilingualForm from '@/templates/form/multilingual?raw';
import unilingualForm from '@/templates/form/unilingual?raw';
import interactiveInstrument from '@/templates/interactive?raw';
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
  updateSelectedInstrument: (update: Pick<InstrumentStoreItem, 'files'>) => void;
};

const createStoreItems = async (
  instruments: OmitDeep<InstrumentStoreItem, 'id' | `files.${number}.id`>[]
): Promise<InstrumentStoreItem[]> => {
  return Promise.all(
    instruments.map(async (instrument) => {
      const files: EditorFile[] = await Promise.all(
        instrument.files.map(async (file) => ({ ...file, id: await sha256(file.content) }))
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
        content: unilingualForm,
        name: 'index.ts'
      }
    ],
    kind: 'FORM',
    label: 'Unilingual Form'
  },
  {
    category: 'Templates',
    files: [
      {
        content: multilingualForm,
        name: 'index.ts'
      }
    ],
    kind: 'FORM',
    label: 'Multilingual Form'
  },
  {
    category: 'Templates',
    files: [
      {
        content: interactiveInstrument,
        name: 'index.ts'
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
        content: formWithGroups,
        name: 'index.ts'
      }
    ],
    kind: 'FORM',
    label: 'Form With Groups'
  },
  {
    category: 'Examples',
    files: [
      {
        content: formWithSimpleDynamicField,
        name: 'index.ts'
      }
    ],
    kind: 'FORM',
    label: 'Form With Simple Dynamic Field'
  },
  {
    category: 'Examples',
    files: [
      {
        content: formReference,
        name: 'index.ts'
      }
    ],
    kind: 'FORM',
    label: 'Form Reference'
  },
  {
    category: 'Examples',
    files: [
      {
        content: interactiveWithReact,
        name: 'index.tsx'
      }
    ],
    kind: 'INTERACTIVE',
    label: 'Interactive With React'
  },
  {
    category: 'Examples',
    files: [
      {
        content: interactiveWithCssIndex,
        name: 'index.ts'
      },
      {
        content: interactiveWithCssStyle,
        name: 'style.css'
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
        },
        updateSelectedInstrument: (update) => {
          set(({ instruments, selectedInstrument }) => {
            const updatedInstruments = [...instruments];
            const selectedIndex = updatedInstruments.findIndex((instrument) => instrument.id === selectedInstrument.id);
            const updatedSelectedInstrument = { ...selectedInstrument, ...update };
            updatedInstruments[selectedIndex] = updatedSelectedInstrument;
            return { instruments: updatedInstruments, selectedInstrument: updatedSelectedInstrument };
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
