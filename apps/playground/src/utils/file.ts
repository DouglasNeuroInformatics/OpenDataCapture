import { type BundlerInput, extractInputFileExtension } from '@opendatacapture/instrument-bundler';
import { P, match } from 'ts-pattern';

import type { EditorFile } from '@/models/editor-file.model';

export type FileType = 'asset' | 'css' | 'html' | 'javascript' | 'typescript';
export function inferFileType(filename: string): FileType | null {
  return match(extractInputFileExtension(filename))
    .with('.css', () => 'css' as const)
    .with(P.union('.js', '.jsx'), () => 'javascript' as const)
    .with(P.union('.ts', '.tsx'), () => 'typescript' as const)
    .with(P.union('.jpeg', '.jpg', '.png', '.webp'), () => 'asset' as const)
    .with('.svg', () => 'html' as const)
    .with(null, () => null)
    .exhaustive();
}

export function editorFileToInput(file: EditorFile): BundlerInput {
  const fileType = inferFileType(file.name);
  if (fileType !== 'asset') {
    return file;
  }
  return { ...file, content: Uint8Array.from(atob(file.content), (c) => c.charCodeAt(0)) };
}
