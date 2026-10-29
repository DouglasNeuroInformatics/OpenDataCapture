import { describe, expect, it } from 'vitest';

import { PASSPHRASE_SEPARATOR } from '../passphrase';
import { WORD_LIST } from '../word-list';

describe('WORD_LIST', () => {
  // The file is marked `linguist-generated`, so it is collapsed in review and nobody reads it. This
  // is what would notice a word being added or dropped.
  it('should hold the number of words the documented entropy is derived from', () => {
    expect(WORD_LIST).toHaveLength(1295);
  });

  it('should contain no word holding the separator, so the word boundaries of a passphrase are unambiguous', () => {
    expect(WORD_LIST.filter((word) => word.includes(PASSPHRASE_SEPARATOR))).toStrictEqual([]);
  });

  it('should give every word a unique three-character prefix, so a misheard word stays recoverable', () => {
    expect(new Set(WORD_LIST.map((word) => word.slice(0, 3))).size).toBe(WORD_LIST.length);
  });
});
