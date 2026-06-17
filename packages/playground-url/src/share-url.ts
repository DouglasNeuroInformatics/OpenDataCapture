import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';

import { $EditorFiles } from './models.js';

import type { EditorFile, PlaygroundInstrument } from './models.js';

/** The origin of the hosted Open Data Capture playground. */
const DEFAULT_PLAYGROUND_URL = 'https://playground.opendatacapture.org';

/** A {@link URL} pointing at the playground, annotated with the encoded byte size of its `href`. */
type ShareURL = URL & { size: number };

type EncodeShareURLOptions = PlaygroundInstrument & {
  /** The origin to build the link against. Defaults to {@link DEFAULT_PLAYGROUND_URL}. */
  baseURL?: string;
  /** When `true`, the link opens the instrument fullscreen as a read-only preview. */
  fullscreen?: boolean;
};

function decodeFiles(encodedFiles: string): EditorFile[] {
  return $EditorFiles.parse(JSON.parse(decompressFromEncodedURIComponent(encodedFiles)));
}

function encodeFiles(files: EditorFile[]): string {
  return compressToEncodedURIComponent(JSON.stringify($EditorFiles.parse(files)));
}

/**
 * Encode an instrument's source files into a playground share URL. Anyone who
 * opens the returned link gets a snapshot of the provided files loaded into the
 * playground.
 */
function encodeShareURL({
  baseURL = DEFAULT_PLAYGROUND_URL,
  files,
  fullscreen,
  label
}: EncodeShareURLOptions): ShareURL {
  const url = new URL(baseURL) as ShareURL;
  url.searchParams.append('files', encodeFiles(files));
  url.searchParams.append('label', compressToEncodedURIComponent(label));
  if (fullscreen) {
    url.searchParams.append('fullscreen', '1');
  }
  url.size = new TextEncoder().encode(url.href).length;
  return url;
}

/** Returns `true` if the URL requests the fullscreen, read-only preview mode. */
function isFullscreenShareURL(url: URL): boolean {
  return url.searchParams.get('fullscreen') === '1';
}

/** Decode an instrument from a playground share URL, or `null` if the URL carries no instrument. */
function decodeShareURL(url: URL): null | PlaygroundInstrument {
  const encodedFiles = url.searchParams.get('files');
  const encodedLabel = url.searchParams.get('label');
  if (!(encodedFiles && encodedLabel)) {
    return null;
  }
  return { files: decodeFiles(encodedFiles), label: decompressFromEncodedURIComponent(encodedLabel) };
}

/**
 * Convenience wrapper over {@link encodeShareURL} that returns the link as a
 * string. This is the simplest way to turn an instrument into a shareable link.
 */
function generatePlaygroundURL(options: EncodeShareURLOptions): string {
  return encodeShareURL(options).href;
}

export { decodeShareURL, DEFAULT_PLAYGROUND_URL, encodeShareURL, generatePlaygroundURL, isFullscreenShareURL };
export type { EncodeShareURLOptions, ShareURL };
