import { $InstrumentKind } from '@opendatacapture/schemas/instrument';
import { z } from 'zod';

import { $EditorFile } from './editor-file.model';

export const $InstrumentCategory = z.enum(['Examples', 'Saved', 'Templates']);

export type InstrumentCategory = z.infer<typeof $InstrumentCategory>;

export const $InstrumentRepository = z.object({
  category: $InstrumentCategory,
  files: z.array($EditorFile),
  id: z.string(),
  kind: $InstrumentKind,
  label: z.string()
});
export type InstrumentRepository = z.infer<typeof $InstrumentRepository>;
