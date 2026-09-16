import { reviver } from '@douglasneuroinformatics/libjs';
import { describe, expect, it } from 'vitest';

import { formatRecordValue } from '../record-value';

describe('formatRecordValue', () => {
  it('should list the members of a set, so a z.set() field does not render as [object Set]', () => {
    expect(formatRecordValue(new Set(['FRIENDS', 'MONEY']))).toBe('FRIENDS, MONEY');
  });

  it('should list the members of a set revived from the serialized form the api stores', () => {
    const stored = '{"__deserializedType":"Set","__isSerializedType":true,"value":["MONEY","FRIENDS"]}';
    expect(formatRecordValue(JSON.parse(stored, reviver))).toBe('MONEY, FRIENDS');
  });

  it('should render an empty set as an empty cell', () => {
    expect(formatRecordValue(new Set())).toBe('');
  });

  it('should render any other value as its string form', () => {
    expect(formatRecordValue(7)).toBe('7');
    expect(formatRecordValue(false)).toBe('false');
    expect(formatRecordValue('text')).toBe('text');
  });
});
