import { describe, expect, it } from 'vitest';

import { generatePassphrase, PASSPHRASE_SEPARATOR, PASSPHRASE_WORD_COUNT } from '../passphrase';
import { WORD_LIST } from '../word-list';

describe('generatePassphrase', () => {
  it('should join exactly PASSPHRASE_WORD_COUNT words, so the entropy matches what the word list claims', () => {
    expect(generatePassphrase().split(PASSPHRASE_SEPARATOR)).toHaveLength(PASSPHRASE_WORD_COUNT);
  });

  it('should draw every word from the word list, so no passphrase contains anything unvetted', () => {
    const words = Array.from({ length: 50 }, () => generatePassphrase()).flatMap((passphrase) =>
      passphrase.split(PASSPHRASE_SEPARATOR)
    );
    expect(words.every((word) => WORD_LIST.includes(word))).toBe(true);
  });

  it('should not repeat itself across calls, so two users are not handed the same password', () => {
    const passphrases = new Set(Array.from({ length: 100 }, () => generatePassphrase()));
    expect(passphrases.size).toBe(100);
  });

  it('should reach both ends of the word list, so rejection sampling has not skewed the range', () => {
    const indexes = Array.from({ length: 400 }, () => generatePassphrase())
      .flatMap((passphrase) => passphrase.split(PASSPHRASE_SEPARATOR))
      .map((word) => WORD_LIST.indexOf(word));
    expect(Math.min(...indexes)).toBeLessThan(WORD_LIST.length * 0.05);
    expect(Math.max(...indexes)).toBeGreaterThan(WORD_LIST.length * 0.95);
  });
});

describe('WORD_LIST', () => {
  it('should contain no word holding the separator, so the word boundaries of a passphrase are unambiguous', () => {
    expect(WORD_LIST.filter((word) => word.includes(PASSPHRASE_SEPARATOR))).toStrictEqual([]);
  });

  it('should give every word a unique three-character prefix, so a misheard word stays recoverable', () => {
    expect(new Set(WORD_LIST.map((word) => word.slice(0, 3))).size).toBe(WORD_LIST.length);
  });
});
