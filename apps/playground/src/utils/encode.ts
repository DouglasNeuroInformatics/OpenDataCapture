import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import { z } from 'zod';

import { $EditorFile, type EditorFile } from '@/models/editor-file.model';

const $EditorFiles = z.array($EditorFile);

export function decodeFiles(encodedFiles: string): EditorFile[] {
  return $EditorFiles.parse(JSON.parse(decompressFromEncodedURIComponent(encodedFiles)));
}

export function encodeFiles(files: EditorFile[]): string {
  return compressToEncodedURIComponent(JSON.stringify($EditorFiles.parse(files)));
}
