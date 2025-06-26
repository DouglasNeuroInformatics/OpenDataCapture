import { $InstrumentKind } from '@opendatacapture/schemas/instrument';
import { z } from 'zod/v4';

import { $EditorFile } from './editor-file.model';

export type InstrumentCategory = z.infer<typeof $InstrumentCategory>;
export const $InstrumentCategory = z.enum(['Examples', 'Saved', 'Templates']);

export type InstrumentRepository = z.infer<typeof $InstrumentRepository>;
export const $InstrumentRepository = z.object({
  category: $InstrumentCategory,
  files: z.array($EditorFile),
  id: z.string(),
  kind: $InstrumentKind.nullable(),
  label: z.string()
});
