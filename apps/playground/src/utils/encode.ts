import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import { z } from 'zod';

import { $EditorFile, type EditorFile } from '@/models/editor-file.model';
import type { InstrumentRepository } from '@/models/instrument-repository.model';

type ShareURL = { size: number } & URL;

const $EditorFiles = z.array($EditorFile);

function decodeFiles(encodedFiles: string): EditorFile[] {
  return $EditorFiles.parse(JSON.parse(decompressFromEncodedURIComponent(encodedFiles)));
}

function encodeFiles(files: EditorFile[]): string {
  return compressToEncodedURIComponent(JSON.stringify($EditorFiles.parse(files)));
}

export function encodeShareURL({ files, label }: Pick<InstrumentRepository, 'files' | 'label'>): ShareURL {
  const url = new URL(location.origin) as ShareURL;
  url.searchParams.append('files', encodeFiles(files));
  url.searchParams.append('label', compressToEncodedURIComponent(label));
  url.size = new TextEncoder().encode(url.href).length;
  return url;
}

export function decodeShareURL(url: URL): Pick<InstrumentRepository, 'files' | 'label'> | null {
  const encodedFiles = url.searchParams.get('files');
  const encodedLabel = url.searchParams.get('label');
  if (!(encodedFiles && encodedLabel)) {
    return null;
  }
  return { files: decodeFiles(encodedFiles), label: decompressFromEncodedURIComponent(encodedLabel) };
}
