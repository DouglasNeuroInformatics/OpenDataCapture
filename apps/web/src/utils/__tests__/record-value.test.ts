import { reviver } from '@douglasneuroinformatics/libjs';
import { describe, expect, it } from 'vitest';

import { extractRecordColumnKeys, formatRecordValue, serializeExportValue } from '../record-value';

describe('extractRecordColumnKeys', () => {
  it('should return the union of non-internal keys across all records in first-seen order', () => {
    expect(
      extractRecordColumnKeys([
        { __date__: new Date(), __id__: '1', totalScore: 7, username: 'alice' },
        { __date__: new Date(), __id__: '2', comments: 'noted', totalScore: 5, username: 'alice' }
      ])
    ).toEqual(['totalScore', 'username', 'comments']);
  });

  it('should return an empty list when there are no records', () => {
    expect(extractRecordColumnKeys([])).toEqual([]);
  });
});

describe('formatRecordValue', () => {
  it('should render an absent field as an empty cell rather than undefined', () => {
    expect(formatRecordValue(undefined)).toBe('');
  });

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

  it('should format dates, nested sets and plain objects without falling back to [object Object]', () => {
    const date = new Date('2026-01-15T00:00:00.000Z');
    expect(formatRecordValue(date)).toBe(date.toString());
    expect(formatRecordValue({ a: 1 })).toBe('{"a":1}');
    expect(formatRecordValue([{ tags: new Set(['FRIENDS', 'MONEY']) }])).toBe('[{"tags":"FRIENDS, MONEY"}]');
  });

  it('should render scalar and null values in their string form', () => {
    expect(formatRecordValue(7)).toBe('7');
    expect(formatRecordValue(false)).toBe('false');
    expect(formatRecordValue('text')).toBe('text');
    expect(formatRecordValue(null)).toBe('null');
  });
});

describe('serializeExportValue', () => {
  it('should map null and undefined to null so exported cells are empty', () => {
    expect(serializeExportValue(null)).toBeNull();
    expect(serializeExportValue(undefined)).toBeNull();
  });

  it('should write UTC-midnight dates as calendar dates and other instants as ISO timestamps', () => {
    expect(serializeExportValue(new Date('2000-01-02T00:00:00.000Z'))).toBe('2000-01-02');
    expect(serializeExportValue(new Date('2000-01-02T14:30:00.000Z'))).toBe('2000-01-02T14:30:00.000Z');
  });

  it('should format sets at top level and inside serialized objects', () => {
    expect(serializeExportValue(new Set(['A', 'B']))).toBe('A, B');
    expect(serializeExportValue({ plain: 1, tags: new Set(['A', 'B']) })).toBe('{"plain":1,"tags":"A, B"}');
  });

  it('should preserve primitive boolean, number and string values', () => {
    expect(serializeExportValue(true)).toBe(true);
    expect(serializeExportValue(42)).toBe(42);
    expect(serializeExportValue('hello')).toBe('hello');
  });
});
