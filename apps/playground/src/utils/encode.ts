import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import { z } from 'zod/v4';

import { $EditorFile } from '@/models/editor-file.model';
import type { EditorFile } from '@/models/editor-file.model';
import type { InstrumentRepository } from '@/models/instrument-repository.model';

type ShareURL = URL & { size: number };

const $EditorFiles = z.array($EditorFile);

function decodeFiles(encodedFiles: string): EditorFile[] {
  return $EditorFiles.parse(JSON.parse(decompressFromEncodedURIComponent(encodedFiles)));
}

function encodeFiles(files: EditorFile[]): string {
  return compressToEncodedURIComponent(JSON.stringify($EditorFiles.parse(files)));
}

export function encodeShareURL({
  files,
  fullscreen,
  label
}: Pick<InstrumentRepository, 'files' | 'label'> & { fullscreen?: boolean }): ShareURL {
  const url = new URL(location.origin) as ShareURL;
  url.searchParams.append('files', encodeFiles(files));
  url.searchParams.append('label', compressToEncodedURIComponent(label));
  if (fullscreen) {
    url.searchParams.append('fullscreen', '1');
  }
  url.size = new TextEncoder().encode(url.href).length;
  return url;
}

export function isFullscreenShareURL(url: URL): boolean {
  return url.searchParams.get('fullscreen') === '1';
}

export function decodeShareURL(url: URL): null | Pick<InstrumentRepository, 'files' | 'label'> {
  const encodedFiles = url.searchParams.get('files');
  const encodedLabel = url.searchParams.get('label');
  if (!(encodedFiles && encodedLabel)) {
    return null;
  }
  return { files: decodeFiles(encodedFiles), label: decompressFromEncodedURIComponent(encodedLabel) };
}
