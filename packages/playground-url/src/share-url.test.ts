import { describe, expect, it } from 'vitest';

import {
  decodeShareURL,
  DEFAULT_PLAYGROUND_URL,
  encodeShareURL,
  generatePlaygroundURL,
  isFullscreenShareURL
} from './share-url.js';

import type { PlaygroundInstrument } from './models.js';

const instrument: PlaygroundInstrument = {
  files: [
    { content: 'export default {};', name: 'index.ts' },
    { content: '{ "name": "test" }', name: 'meta.json' }
  ],
  label: 'My Instrument'
};

describe('encodeShareURL', () => {
  it('encodes against the hosted playground by default', () => {
    const url = encodeShareURL(instrument);
    expect(url.origin).toBe(DEFAULT_PLAYGROUND_URL);
    expect(url.searchParams.get('files')).toBeTruthy();
    expect(url.searchParams.get('label')).toBeTruthy();
  });

  it('honours a custom base URL', () => {
    const url = encodeShareURL({ ...instrument, baseURL: 'http://localhost:5173' });
    expect(url.origin).toBe('http://localhost:5173');
  });

  it('reports the encoded byte size of the href', () => {
    const url = encodeShareURL(instrument);
    expect(url.size).toBe(new TextEncoder().encode(url.href).length);
  });

  it('omits the fullscreen flag unless requested', () => {
    expect(isFullscreenShareURL(encodeShareURL(instrument))).toBe(false);
    expect(isFullscreenShareURL(encodeShareURL({ ...instrument, fullscreen: true }))).toBe(true);
  });
});

describe('decodeShareURL', () => {
  it('round-trips an encoded instrument', () => {
    const decoded = decodeShareURL(encodeShareURL(instrument));
    expect(decoded).toEqual(instrument);
  });

  it('returns null when no instrument is present', () => {
    expect(decodeShareURL(new URL(DEFAULT_PLAYGROUND_URL))).toBeNull();
  });
});

describe('generatePlaygroundURL', () => {
  it('returns the href as a string', () => {
    expect(generatePlaygroundURL(instrument)).toBe(encodeShareURL(instrument).href);
  });
});
