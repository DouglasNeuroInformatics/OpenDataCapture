import { describe, expect, it } from 'vitest';

import instrument from '../forms/DNP_HAPPINESS_QUESTIONNAIRE/index.ts';

function getDynamicField(name: 'causesOfDissatisfaction' | 'reasonNotSatisfied') {
  if (Array.isArray(instrument.content)) {
    throw new Error('Expected the happiness questionnaire content to be a record of fields');
  }
  const field = instrument.content[name];
  if (field.kind !== 'dynamic') {
    throw new Error(`Expected '${name}' to be a dynamic field`);
  }
  return field;
}

function getOverallLifeSatisfaction() {
  const measure = instrument.measures?.overallLifeSatisfaction;
  if (measure?.kind !== 'computed') {
    throw new Error("Expected 'overallLifeSatisfaction' to be a computed measure");
  }
  return measure;
}

describe('DNP_HAPPINESS_QUESTIONNAIRE', () => {
  describe('reasonNotSatisfied', () => {
    it('should stay hidden until the subject has answered whether they are satisfied', () => {
      expect(getDynamicField('reasonNotSatisfied').render({})).toBeNull();
    });

    it('should stay hidden for a satisfied subject, who has no reason to give', () => {
      expect(getDynamicField('reasonNotSatisfied').render({ isSatisfiedOverall: true })).toBeNull();
    });

    it('should ask a dissatisfied subject for their reason as free text', () => {
      expect(getDynamicField('reasonNotSatisfied').render({ isSatisfiedOverall: false })).toMatchObject({
        kind: 'string',
        variant: 'textarea'
      });
    });
  });

  describe('causesOfDissatisfaction', () => {
    it('should stay hidden for a satisfied subject, who has no causes to list', () => {
      expect(getDynamicField('causesOfDissatisfaction').render({ isSatisfiedOverall: true })).toBeNull();
    });

    it('should offer a dissatisfied subject every cause the schema accepts', () => {
      const field = getDynamicField('causesOfDissatisfaction').render({ isSatisfiedOverall: false });
      expect(field).toMatchObject({ kind: 'set', variant: 'listbox' });
      expect(field && 'options' in field && Object.keys(field.options.en).sort()).toEqual([
        'EXISTENTIAL_CRISIS',
        'FRIENDS',
        'MONEY',
        'ROMANTIC_PARTNER'
      ]);
    });
  });

  describe('overallLifeSatisfaction', () => {
    it('should sum the personal and professional satisfaction scores, ignoring the other answers', () => {
      const value = getOverallLifeSatisfaction().value({
        isSatisfiedOverall: true,
        personalLifeSatisfaction: 7,
        professionalLifeSatisfaction: 4
      });
      expect(value).toBe(11);
    });
  });

  describe('validationSchema', () => {
    it('should accept a satisfied subject who gives no reason', () => {
      const result = instrument.validationSchema.safeParse({
        isSatisfiedOverall: true,
        personalLifeSatisfaction: 8,
        professionalLifeSatisfaction: 9
      });
      expect(result.success).toBe(true);
    });

    it('should require a reason from a dissatisfied subject', () => {
      const result = instrument.validationSchema.safeParse({
        isSatisfiedOverall: false,
        personalLifeSatisfaction: 2,
        professionalLifeSatisfaction: 3
      });
      expect(result.error?.issues[0]?.message).toBe('This field is required / Ce champ est obligatoire');
    });

    it('should accept a dissatisfied subject who gives a reason and its causes', () => {
      const result = instrument.validationSchema.safeParse({
        causesOfDissatisfaction: new Set(['MONEY']),
        isSatisfiedOverall: false,
        personalLifeSatisfaction: 2,
        professionalLifeSatisfaction: 3,
        reasonNotSatisfied: 'Rent'
      });
      expect(result.success).toBe(true);
    });

    it('should reject a satisfaction score outside the slider range of 1 to 10', () => {
      const result = instrument.validationSchema.safeParse({
        isSatisfiedOverall: true,
        personalLifeSatisfaction: 11,
        professionalLifeSatisfaction: 5
      });
      expect(result.success).toBe(false);
    });
  });
});
