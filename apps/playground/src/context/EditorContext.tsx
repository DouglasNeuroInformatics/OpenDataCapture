import { createContext } from 'react';

import type { ExampleInstrumentData } from '@/examples';
import type { TranspilerState } from '@/hooks/useTranspiler';

export type EditorContextType = {
  exampleOptions: string[];
  onChangeSelection: (label: string) => void;
  selectedExample: ExampleInstrumentData;
  state: TranspilerState;
};

export const EditorContext = createContext<EditorContextType>(null!);
