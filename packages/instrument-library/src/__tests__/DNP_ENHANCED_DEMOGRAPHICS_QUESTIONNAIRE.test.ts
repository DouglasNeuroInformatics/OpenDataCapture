import { describe, expect, it } from 'vitest';

import instrument from '../forms/DNP_ENHANCED_DEMOGRAPHICS_QUESTIONNAIRE/index.ts';

function getStringField(name: 'employmentStatus' | 'ethnicOrigin' | 'gender' | 'maritalStatus') {
  if (!Array.isArray(instrument.content)) {
    throw new Error('Expected the demographics content to be an array of groups');
  }
  for (const group of instrument.content) {
    if (group.kind === 'block') {
      continue;
    }
    const field = group.fields[name];
    if (field?.kind === 'string' && 'options' in field) {
      return field;
    }
  }
  throw new Error(`Expected a string field with options named '${name}'`);
}

describe('DNP_ENHANCED_DEMOGRAPHICS_QUESTIONNAIRE', () => {
  describe('options', () => {
    it('should label each option in English for an English-speaking subject', () => {
      expect(getStringField('gender').options.en).toEqual({ female: 'Woman', male: 'Man', nonBinary: 'Non-Binary' });
    });

    it('should label each option in French for a French-speaking subject', () => {
      expect(getStringField('gender').options.fr).toEqual({ female: 'Femme', male: 'Homme', nonBinary: 'Non-binaire' });
    });

    it('should accept every offered marital status, so no selectable option fails validation', () => {
      for (const key of Object.keys(getStringField('maritalStatus').options.en)) {
        expect(instrument.validationSchema.safeParse({ maritalStatus: key }).success).toBe(true);
      }
    });
  });

  describe('validationSchema', () => {
    it('should accept an empty submission, because every question is optional', () => {
      expect(instrument.validationSchema.safeParse({}).success).toBe(true);
    });

    it('should reject a value that is not one of the offered options', () => {
      expect(instrument.validationSchema.safeParse({ employmentStatus: 'freelance' }).success).toBe(false);
    });

    it('should accept a Canadian postal code with or without a separator', () => {
      expect(instrument.validationSchema.safeParse({ postalCode: 'H4H 1R3' }).success).toBe(true);
      expect(instrument.validationSchema.safeParse({ postalCode: 'H4H1R3' }).success).toBe(true);
    });

    it('should reject a postal code that is not in the Canadian format', () => {
      expect(instrument.validationSchema.safeParse({ postalCode: '90210' }).success).toBe(false);
    });
  });
});
