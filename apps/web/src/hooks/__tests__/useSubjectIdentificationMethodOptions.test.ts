import type { SubjectIdentificationSettings } from '@opendatacapture/schemas/subject-identification';
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useSubjectIdentificationMethodOptions } from '../useSubjectIdentificationMethodOptions';

import '@/services/i18n';

const customFields = {
  fields: [{ label: { en: 'Animal ID' }, pattern: '[0-9]+' }],
  iterations: 1000,
  label: { en: 'Animal information' },
  salt: '0f'.repeat(32)
};

const renderOptions = (settings: Pick<SubjectIdentificationSettings, 'customFields' | 'offeredMethods'>) => {
  return renderHook(() => useSubjectIdentificationMethodOptions(settings)).result.current;
};

describe('useSubjectIdentificationMethodOptions', () => {
  it('should offer only the offered methods, in the order offered', () => {
    expect(renderOptions({ customFields: null, offeredMethods: ['PERSONAL_INFO'] }).options).toStrictEqual({
      PERSONAL_INFO: 'Personal Information'
    });
  });

  it("should label custom fields with the administrator's label", () => {
    expect(renderOptions({ customFields, offeredMethods: ['CUSTOM_ID', 'CUSTOM_FIELDS'] }).options).toStrictEqual({
      CUSTOM_FIELDS: 'Animal information',
      CUSTOM_ID: 'Custom Identifier'
    });
  });

  it('should open a form on the preferred method while it is offered', () => {
    expect(
      renderOptions({ customFields, offeredMethods: ['CUSTOM_ID', 'CUSTOM_FIELDS'] }).preferMethod('CUSTOM_FIELDS')
    ).toBe('CUSTOM_FIELDS');
  });

  it('should fall back to the first offered method when the preferred one is not offered', () => {
    expect(renderOptions({ customFields: null, offeredMethods: ['PERSONAL_INFO'] }).preferMethod('CUSTOM_ID')).toBe(
      'PERSONAL_INFO'
    );
  });

  it('should fall back to the first offered method when none is preferred', () => {
    expect(renderOptions({ customFields: null, offeredMethods: ['PERSONAL_INFO'] }).preferMethod(undefined)).toBe(
      'PERSONAL_INFO'
    );
  });
});
