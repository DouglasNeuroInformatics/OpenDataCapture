import { describe, expect, it } from 'vitest';

import { changedFields } from '../audit.utils';

describe('changedFields', () => {
  it('should name only the fields whose value changed, so a resubmitted form reports what was edited', () => {
    expect(changedFields({ firstName: 'Jane', lastName: 'Doe' }, { firstName: 'Janet', lastName: 'Doe' })).toEqual([
      'firstName'
    ]);
  });

  it('should name a field the update added or removed', () => {
    expect(changedFields({ email: 'jane@example.org' }, { phoneNumber: '5555555' })).toEqual(['email', 'phoneNumber']);
  });

  it('should sort the names, so two entries for the same edit read the same', () => {
    expect(changedFields({ zip: '1' }, { city: 'Montreal' })).toEqual(['city', 'zip']);
  });

  it('should compare nested values by content, so a rewritten but equal object is not a change', () => {
    expect(changedFields({ settings: { minimumAge: 18 } }, { settings: { minimumAge: 18 } })).toEqual([]);
  });

  it('should compare dates by their time, so a re-read date is not a change', () => {
    expect(changedFields({ dateOfBirth: new Date(0) }, { dateOfBirth: new Date(0) })).toEqual([]);
  });

  it('should treat a reordered list of ids as unchanged, since the web resubmits them in its own order', () => {
    expect(changedFields({ groupIds: ['a', 'b'] }, { groupIds: ['b', 'a'] })).toEqual([]);
  });

  it('should name a list of ids that gained or lost one', () => {
    expect(changedFields({ groupIds: ['a', 'b'] }, { groupIds: ['a'] })).toEqual(['groupIds']);
  });

  it('should keep the order of a list of objects significant', () => {
    expect(changedFields({ rules: [{ id: 1 }, { id: 2 }] }, { rules: [{ id: 2 }, { id: 1 }] })).toEqual(['rules']);
  });

  it('should leave out updatedAt, which every write changes', () => {
    expect(changedFields({ updatedAt: new Date(0) }, { updatedAt: new Date(1) })).toEqual([]);
  });

  it('should name the indices of a list that changed, so array-shaped record data is described too', () => {
    expect(changedFields([{ score: 1 }, { score: 2 }], [{ score: 1 }, { score: 3 }])).toEqual(['1']);
  });

  it.each([null, 'text', 7])('should refuse to compare %j, which has no fields to name', (value) => {
    expect(() => changedFields(value, {})).toThrow(TypeError);
    expect(() => changedFields({}, value)).toThrow(TypeError);
  });
});
