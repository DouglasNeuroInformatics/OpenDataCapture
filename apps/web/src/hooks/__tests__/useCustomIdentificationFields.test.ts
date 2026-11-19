import type { CustomFieldsDefinition } from '@opendatacapture/schemas/subject-identification';
import { deriveCustomFieldsSubjectId } from '@opendatacapture/subject-utils';
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { z } from 'zod/v4';

import { useCustomIdentificationFields } from '../useCustomIdentificationFields';

import '@/services/i18n';

const definition: CustomFieldsDefinition = {
  fields: [
    {
      description: { en: 'On the ear tag' },
      label: { en: 'Animal ID', fr: "Identifiant de l'animal" },
      pattern: '[A-Z]{2}[0-9]+',
      patternErrorMessage: { en: 'Two letters, then digits' }
    },
    { label: { en: 'Cage' }, pattern: '[0-9]+' }
  ],
  iterations: 1000,
  label: { en: 'Animal information' },
  salt: '0f'.repeat(32)
};

const renderFields = (value: CustomFieldsDefinition | null = definition) => {
  return renderHook(() => useCustomIdentificationFields(value)).result.current;
};

describe('useCustomIdentificationFields', () => {
  it('should offer no method and no field without a definition', () => {
    const fields = renderFields(null);
    expect(fields.label).toBeNull();
    expect(fields.formFields).toStrictEqual({});
    expect(fields.findErrors({})).toStrictEqual({});
  });

  it("should label the method with the administrator's label", () => {
    expect(renderFields().label).toBe('Animal information');
  });

  it('should key one field per defined field, in order', () => {
    expect(Object.keys(renderFields().formFields)).toStrictEqual(['customField0', 'customField1']);
    expect(Object.keys(renderFields().shape)).toStrictEqual(['customField0', 'customField1']);
  });

  it('should render a field only while the method is chosen, with its label and help text', () => {
    const { formFields } = renderFields();
    expect(formFields.customField0?.render({ subjectIdentificationMethod: 'CUSTOM_ID' })).toBeNull();
    expect(formFields.customField0?.render({ subjectIdentificationMethod: 'CUSTOM_FIELDS' })).toMatchObject({
      description: 'On the ear tag',
      kind: 'string',
      label: 'Animal ID'
    });
  });

  it('should accept a field value as an optional string, leaving every check to findErrors', () => {
    const schema = z.object(renderFields().shape);
    expect(schema.safeParse({}).success).toBe(true);
    expect(schema.safeParse({ customField0: 1 }).success).toBe(false);
  });

  describe('findErrors', () => {
    it('should require every field, since an optional field would give one subject two ids', () => {
      expect(renderFields().findErrors({ customField0: 'ab12' })).toStrictEqual({
        customField1: 'This field is required'
      });
    });

    it('should test the pattern against the normalized value, so case and punctuation do not matter', () => {
      expect(renderFields().findErrors({ customField0: 'ab-12', customField1: '7' })).toStrictEqual({});
    });

    it("should show the administrator's message for a value the pattern rejects", () => {
      expect(renderFields().findErrors({ customField0: '12', customField1: '7' })).toStrictEqual({
        customField0: 'Two letters, then digits'
      });
    });

    it('should name the pattern when the administrator wrote no message', () => {
      expect(renderFields().findErrors({ customField0: 'ab1', customField1: 'x' })).toStrictEqual({
        customField1: 'Must match regular expression: [0-9]+'
      });
    });

    it('should refuse a value with no letter or digit, which would normalize to nothing', () => {
      expect(renderFields().findErrors({ customField0: 'ab1', customField1: '--' })).toStrictEqual({
        customField1: 'Must contain at least one letter or digit'
      });
    });

    it('should refuse a value longer than 200 characters', () => {
      expect(renderFields().findErrors({ customField0: 'ab1', customField1: '1'.repeat(201) })).toStrictEqual({
        customField1: 'Must be at most 200 characters'
      });
    });
  });

  it('should order the values as the fields are defined', () => {
    expect(renderFields().orderValues({ customField0: 'ab1', customField1: '7' })).toStrictEqual(['ab1', '7']);
  });

  it("should derive the subject id from the values in order, with the instance's salt and iterations", async () => {
    await expect(renderFields().deriveSubjectId({ customField0: 'ab1', customField1: '7' })).resolves.toBe(
      await deriveCustomFieldsSubjectId(['ab1', '7'], { iterations: 1000, salt: '0f'.repeat(32) })
    );
  });

  it('should refuse to derive an id without a definition', async () => {
    await expect(renderFields(null).deriveSubjectId({})).rejects.toThrow(/without a definition/);
  });
});
