import { describe, expect, it } from 'vitest';

import { changedDataFields, changedRowFields } from '../audit.utils';

describe('changedDataFields', () => {
  it('should name only the fields whose value changed, so a resubmitted form reports what was edited', () => {
    expect(changedDataFields({ firstName: 'Jane', lastName: 'Doe' }, { firstName: 'Janet', lastName: 'Doe' })).toEqual([
      'firstName'
    ]);
  });

  it('should name a field the update added or removed', () => {
    expect(changedDataFields({ email: 'jane@example.org' }, { phoneNumber: '5555555' })).toEqual([
      'email',
      'phoneNumber'
    ]);
  });

  it('should sort the names, so two entries for the same edit read the same', () => {
    expect(changedDataFields({ zip: '1' }, { city: 'Montreal' })).toEqual(['city', 'zip']);
  });

  it('should compare nested values by content, so a rewritten but equal object is not a change', () => {
    expect(changedDataFields({ settings: { minimumAge: 18 } }, { settings: { minimumAge: 18 } })).toEqual([]);
  });

  it('should compare dates by their time, so a re-read date is not a change', () => {
    expect(changedDataFields({ dateOfBirth: new Date(0) }, { dateOfBirth: new Date(0) })).toEqual([]);
  });

  it('should name a reordered list of answers, since the order is part of what was collected', () => {
    expect(changedDataFields({ ranking: ['first', 'second'] }, { ranking: ['second', 'first'] })).toEqual(['ranking']);
  });

  it('should name a reordered list nested in an answer', () => {
    expect(changedDataFields({ answer: { ranking: ['a', 'b'] } }, { answer: { ranking: ['b', 'a'] } })).toEqual([
      'answer'
    ]);
  });

  it('should name a field called updatedAt, which in record data is an answer like any other', () => {
    expect(changedDataFields({ updatedAt: '2026-01-01' }, { updatedAt: '2026-01-02' })).toEqual(['updatedAt']);
  });

  it('should name the indices of a list that changed, so array-shaped record data is described too', () => {
    expect(changedDataFields([{ score: 1 }, { score: 2 }], [{ score: 1 }, { score: 3 }])).toEqual(['1']);
  });

  it.each([null, 'text', 7])('should refuse to compare %j, which has no fields to name', (value) => {
    expect(() => changedDataFields(value, {})).toThrow(TypeError);
    expect(() => changedDataFields({}, value)).toThrow(TypeError);
  });
});

describe('changedRowFields', () => {
  const row = (fields: { [field: string]: unknown } = {}) => ({
    groupIds: ['a', 'b'],
    name: 'Jane',
    updatedAt: new Date(0),
    ...fields
  });

  it('should name only the fields whose value changed', () => {
    expect(changedRowFields(row(), row({ name: 'Janet' }), ['groupIds'])).toEqual(['name']);
  });

  it('should treat a reordered id list as unchanged, since the web resubmits ids in its own order', () => {
    expect(changedRowFields(row(), row({ groupIds: ['b', 'a'] }), ['groupIds'])).toEqual([]);
  });

  it('should name an id list that gained or lost an id', () => {
    expect(changedRowFields(row(), row({ groupIds: ['a'] }), ['groupIds'])).toEqual(['groupIds']);
  });

  it('should keep the order of a list it is not told holds ids', () => {
    expect(changedRowFields(row({ order: ['a', 'b'] }), row({ order: ['b', 'a'] }), ['groupIds'])).toEqual(['order']);
  });

  it('should keep the order of a list of objects significant', () => {
    expect(
      changedRowFields(row({ rules: [{ id: 1 }, { id: 2 }] }), row({ rules: [{ id: 2 }, { id: 1 }] }), ['groupIds'])
    ).toEqual(['rules']);
  });

  it('should leave out updatedAt, which every write changes', () => {
    expect(changedRowFields(row(), row({ updatedAt: new Date(1) }), ['groupIds'])).toEqual([]);
  });
});
