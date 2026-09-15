import lz from 'lz-string';

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
  return $EditorFiles.parse(JSON.parse(lz.decompressFromEncodedURIComponent(encodedFiles)));
}

function encodeFiles(files: EditorFile[]): string {
  return lz.compressToEncodedURIComponent(JSON.stringify($EditorFiles.parse(files)));
}

/**
 * Links carry their payload in the fragment, which the browser never sends to
 * the server. Older links used the query string, where a large instrument
 * exceeds the server's header limit (HTTP 431); it is still read so that links
 * already shared keep working.
 */
function getShareParams(url: URL): URLSearchParams {
  const fragmentParams = new URLSearchParams(url.hash.slice(1));
  return fragmentParams.has('files') ? fragmentParams : url.searchParams;
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
  const params = new URLSearchParams({
    files: encodeFiles(files),
    label: lz.compressToEncodedURIComponent(label)
  });
  if (fullscreen) {
    params.append('fullscreen', '1');
  }
  url.hash = params.toString();
  url.size = new TextEncoder().encode(url.href).length;
  return url;
}

/** Returns `true` if the URL requests the fullscreen, read-only preview mode. */
function isFullscreenShareURL(url: URL): boolean {
  return getShareParams(url).get('fullscreen') === '1';
}

/** Decode an instrument from a playground share URL, or `null` if the URL carries no instrument. */
function decodeShareURL(url: URL): null | PlaygroundInstrument {
  const params = getShareParams(url);
  const encodedFiles = params.get('files');
  const encodedLabel = params.get('label');
  if (!(encodedFiles && encodedLabel)) {
    return null;
  }
  return { files: decodeFiles(encodedFiles), label: lz.decompressFromEncodedURIComponent(encodedLabel) };
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
