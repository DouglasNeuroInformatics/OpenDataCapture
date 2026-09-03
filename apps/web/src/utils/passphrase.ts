import { WORD_LIST } from './word-list';

const PASSPHRASE_SEPARATOR = '-';

const PASSPHRASE_WORD_COUNT = 5;

const UINT32_RANGE = 0x1_0000_0000;

/**
 * A uniformly distributed index below `bound`, by rejection sampling. Taking `value % bound`
 * directly would favour the low indices, because the word list does not divide the uint32 range
 * evenly — which would quietly cost the passphrase some of the entropy {@link WORD_LIST} claims.
 */
function randomIndex(bound: number): number {
  const buffer = new Uint32Array(1);
  const limit = Math.floor(UINT32_RANGE / bound) * bound;
  let value: number;
  do {
    crypto.getRandomValues(buffer);
    value = buffer[0]!;
  } while (value >= limit);
  return value % bound;
}

function generatePassphrase(): string {
  return Array.from({ length: PASSPHRASE_WORD_COUNT }, () => WORD_LIST[randomIndex(WORD_LIST.length)]!).join(
    PASSPHRASE_SEPARATOR
  );
}

export { generatePassphrase, PASSPHRASE_SEPARATOR, PASSPHRASE_WORD_COUNT };
