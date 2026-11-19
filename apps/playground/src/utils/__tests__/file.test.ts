import { describe, expect, it } from 'vitest';

import { editorFileToInput } from '../file';

describe('editorFileToInput', () => {
  it('should decode a base64 asset whose extension is upper case, so the bundler receives the image rather than its text', () => {
    expect(editorFileToInput({ content: 'AAEC', name: 'stim.PNG' }).content).toEqual(new Uint8Array([0, 1, 2]));
  });
});
