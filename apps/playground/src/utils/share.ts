import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';

export function decodeSource(encodedSource: string) {
  return decompressFromEncodedURIComponent(encodedSource);
}

export function encodeSource(source: string): string {
  return compressToEncodedURIComponent(source);
}

export function generateShareLink(source: string) {
  const url = new URL(location.origin);
  url.searchParams.append('source', encodeSource(source));
  return url;
}
