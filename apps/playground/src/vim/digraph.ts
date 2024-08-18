/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { kCompressedDigraphs } from './digraph.b64';

const kDigraphMap = new Map<string, number>();

const decompress = async () => {
  const bin = atob(kCompressedDigraphs);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }
  const blob = new Blob([new Uint8Array(bytes)]);
  const stream = blob.stream().pipeThrough(new DecompressionStream('gzip')).getReader();

  const buffers: ArrayBuffer[] = [];

  while (true) {
    const { done, value } = await stream.read();
    if (done) {
      break;
    }
    buffers.push(value as ArrayBuffer);
  }

  const decompressed = new Blob(buffers);
  const raw = await decompressed.text();
  const arr = JSON.parse(raw) as [string, number][];

  for (const [key, value] of arr) {
    kDigraphMap.set(key, value);
  }
};

decompress()
  .then(() => {})
  .catch((err) => console.error('Error decompressing digraphs', err));

export const findDigraph = (keys: string): string => {
  const match = kDigraphMap.get(keys);
  if (!match) {
    return '';
  } else {
    return String.fromCodePoint(match);
  }
};
