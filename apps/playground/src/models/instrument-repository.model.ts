import type { $InstrumentKind } from '@opendatacapture/schemas/instrument';
import { z } from 'zod/v4';

import type { EditorFile } from './editor-file.model';

export type InstrumentCategory = z.infer<typeof $InstrumentCategory>;
export const $InstrumentCategory = z.enum(['Examples', 'Saved', 'Templates']);

export type InstrumentRepository = {
  category: InstrumentCategory;
  files: EditorFile[];
  id: string;
  kind: null | z.infer<typeof $InstrumentKind>;
  label: string;
};
