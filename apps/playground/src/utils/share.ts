const textDecoder = new TextDecoder();
const textEncoder = new TextEncoder();

export function decodeSource(base64Text: string) {
  const binString = atob(base64Text);
  const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0)!);
  return textDecoder.decode(bytes);
}

export function encodeSource(plainText: string): string {
  const bytes = textEncoder.encode(plainText);
  const binString = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join('');
  return btoa(binString);
}

export function generateShareLink(source: string) {
  return new URL(encodeSource(source), location.origin);
}
