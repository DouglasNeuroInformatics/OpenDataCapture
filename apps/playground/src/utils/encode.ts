import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import { z } from 'zod';

import { $EditorFile, type EditorFile } from '@/models/editor-file.model';
import type { InstrumentStoreItem } from '@/store/instrument.store';

const $EditorFiles = z.array($EditorFile);

function decodeFiles(encodedFiles: string): EditorFile[] {
  return $EditorFiles.parse(JSON.parse(decompressFromEncodedURIComponent(encodedFiles)));
}

function encodeFiles(files: EditorFile[]): string {
  return compressToEncodedURIComponent(JSON.stringify($EditorFiles.parse(files)));
}

export function encodeShareURL({ files, label }: Pick<InstrumentStoreItem, 'files' | 'label'>) {
  const url = new URL(location.origin);
  url.searchParams.append('files', encodeFiles(files));
  url.searchParams.append('label', compressToEncodedURIComponent(label));
  return url;
}

export function decodeShareURL(url: URL): Pick<InstrumentStoreItem, 'files' | 'label'> | null {
  const encodedFiles = url.searchParams.get('files');
  const encodedLabel = url.searchParams.get('label');
  if (!(encodedFiles && encodedLabel)) {
    return null;
  }
  return { files: decodeFiles(encodedFiles), label: decompressFromEncodedURIComponent(encodedLabel) };
}
