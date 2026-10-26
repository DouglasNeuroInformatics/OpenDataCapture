import { isEqual } from 'lodash-es';

import type { EditorFile } from '@/models/editor-file.model';
import type { InstrumentRepository } from '@/models/instrument-repository.model';

export function isSaveDisabled(
  selectedInstrument: Pick<InstrumentRepository, 'category' | 'files'>,
  editorFiles: EditorFile[]
): boolean {
  return selectedInstrument.category !== 'Saved' || isEqual(editorFiles, selectedInstrument.files);
}
