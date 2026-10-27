import { describe, expect, it } from 'vitest';

import { isSaveDisabled } from '../is-save-disabled';

const savedFiles = [{ content: 'export default {};', name: 'index.ts' }];
const editedFiles = [{ content: 'export default { edited: true };', name: 'index.ts' }];

describe('isSaveDisabled', () => {
  it('should disable saving for examples and templates, so a save that cannot persist is never offered', () => {
    expect(isSaveDisabled({ category: 'Examples', files: savedFiles }, editedFiles)).toBe(true);
    expect(isSaveDisabled({ category: 'Templates', files: savedFiles }, editedFiles)).toBe(true);
  });

  it('should enable saving a saved instrument with unsaved edits', () => {
    expect(isSaveDisabled({ category: 'Saved', files: savedFiles }, editedFiles)).toBe(false);
  });

  it('should disable saving a saved instrument whose editor files match what was saved', () => {
    expect(isSaveDisabled({ category: 'Saved', files: savedFiles }, structuredClone(savedFiles))).toBe(true);
  });
});
