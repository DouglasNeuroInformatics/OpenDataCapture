/** @type {import('./index.d.ts').evaluateInstrument} */
export async function evaluateInstrument(bundle) {
  return await new Function(`return ${bundle}`)();
}

/** @type {import('./index.d.ts').encodeUnicodeToBase64} */
export function encodeUnicodeToBase64(s) {
  const utf8Bytes = new TextEncoder().encode(s);

  let binaryString = '';
  for (const byte of utf8Bytes) {
    binaryString += String.fromCharCode(byte);
  }

  return btoa(binaryString);
}

/** @type {import('./index.d.ts').decodeBase64ToUnicode} */
export function decodeBase64ToUnicode(s) {
  const binaryString = atob(s);
  const bytes = Uint8Array.from(binaryString, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}
