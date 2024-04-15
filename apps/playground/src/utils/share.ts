const textDecoder = new TextDecoder();
const textEncoder = new TextEncoder();

export function decodeSource(encodedSource: string) {
  const binString = atob(decodeURIComponent(encodedSource));
  const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0)!);
  return textDecoder.decode(bytes);
}

export function encodeSource(source: string): string {
  const bytes = textEncoder.encode(source);
  const binString = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join('');
  return encodeURIComponent(btoa(binString));
}

export function generateShareLink(source: string) {
  const url = new URL(location.origin);
  url.searchParams.append('source', encodeSource(source));
  return url;
}
