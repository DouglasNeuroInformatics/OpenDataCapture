import type { SubjectIdentificationSettings } from '@opendatacapture/schemas/subject-identification';
import { describe, expect, it } from 'vitest';

import {
  createCustomFieldDraft,
  createCustomFieldsDraft,
  findCustomFieldIssues,
  isCustomFieldsLabelMissing,
  toSubjectIdentificationDraft,
  toUpdateSubjectIdentificationSettingsData
} from '../subject-identification-draft';

import type { CustomFieldDraft } from '../subject-identification-draft';

const settings: SubjectIdentificationSettings = {
  customFields: {
    fields: [
      { label: { en: 'Animal ID' }, pattern: '[0-9]+' },
      { description: { fr: 'Numéro de la cage' }, label: { en: 'Cage' }, pattern: '[A-Z]+' }
    ],
    iterations: 600_000,
    label: { en: 'Animal information' },
    salt: 'ab'.repeat(32)
  },
  isCustomFieldsLocked: false,
  offeredMethods: ['CUSTOM_ID', 'CUSTOM_FIELDS']
};

const field = (overrides: Partial<CustomFieldDraft> = {}): CustomFieldDraft => ({
  key: 'field',
  label: { en: 'Animal ID' },
  pattern: '[0-9]+',
  ...overrides
});

describe('createCustomFieldDraft', () => {
  it('should give each new field its own key, so two new fields keep their own inputs when reordered', () => {
    expect(createCustomFieldDraft().key).not.toBe(createCustomFieldDraft().key);
  });
});

describe('createCustomFieldsDraft', () => {
  it('should start a definition with one blank field, since a definition has at least one', () => {
    expect(createCustomFieldsDraft()).toMatchObject({ fields: [{ label: {}, pattern: '' }], label: {} });
  });
});

describe('toSubjectIdentificationDraft', () => {
  it('should keep the stored fields in order, each with its own key', () => {
    const draft = toSubjectIdentificationDraft(settings);
    expect(draft.customFields?.fields.map(({ label }) => label.en)).toStrictEqual(['Animal ID', 'Cage']);
    expect(new Set(draft.customFields?.fields.map(({ key }) => key)).size).toBe(2);
  });

  it('should leave out the salt and iteration count, which only the server sets', () => {
    expect(toSubjectIdentificationDraft(settings).customFields).not.toHaveProperty('salt');
  });

  it('should hold no definition when none is stored', () => {
    expect(
      toSubjectIdentificationDraft({ customFields: null, isCustomFieldsLocked: false, offeredMethods: ['CUSTOM_ID'] })
    ).toStrictEqual({ customFields: null, offeredMethods: ['CUSTOM_ID'] });
  });

  it('should hold the offered methods', () => {
    expect(toSubjectIdentificationDraft(settings).offeredMethods).toStrictEqual(['CUSTOM_ID', 'CUSTOM_FIELDS']);
  });
});

describe('toUpdateSubjectIdentificationSettingsData', () => {
  it('should send the fields without their keys and with blank languages left out', () => {
    const data = toUpdateSubjectIdentificationSettingsData({
      customFields: { fields: [field({ label: { en: 'Animal ID', fr: ' ' } })], label: { en: 'Animal', es: '' } },
      offeredMethods: ['CUSTOM_ID']
    });
    expect(data).toStrictEqual({
      customFields: {
        fields: [{ description: null, label: { en: 'Animal ID' }, pattern: '[0-9]+', patternErrorMessage: null }],
        label: { en: 'Animal' }
      },
      offeredMethods: ['CUSTOM_ID']
    });
  });

  it('should send optional text written in any language', () => {
    const data = toUpdateSubjectIdentificationSettingsData({
      customFields: {
        fields: [field({ description: { fr: 'Aide' }, patternErrorMessage: { es: 'Error' } })],
        label: {}
      },
      offeredMethods: ['CUSTOM_ID']
    });
    expect(data.customFields?.fields[0]).toMatchObject({
      description: { fr: 'Aide' },
      patternErrorMessage: { es: 'Error' }
    });
  });

  it('should send a removed definition as null', () => {
    expect(
      toUpdateSubjectIdentificationSettingsData({ customFields: null, offeredMethods: ['CUSTOM_ID'] })
    ).toStrictEqual({
      customFields: null,
      offeredMethods: ['CUSTOM_ID']
    });
  });
});

describe('findCustomFieldIssues', () => {
  it('should find nothing wrong with a labelled field whose pattern compiles', () => {
    expect(findCustomFieldIssues(field())).toStrictEqual({ label: false, pattern: false });
  });

  it('should flag a label with no content in any language', () => {
    expect(findCustomFieldIssues(field({ label: { en: ' ', fr: '' } })).label).toBe(true);
  });

  it('should flag a missing pattern', () => {
    expect(findCustomFieldIssues(field({ pattern: '' })).pattern).toBe(true);
  });

  it('should flag a pattern that does not compile with the u flag, as the forms compile it', () => {
    expect(findCustomFieldIssues(field({ pattern: '\\-' })).pattern).toBe(true);
  });
});

describe('isCustomFieldsLabelMissing', () => {
  it('should flag a method label with no content in any language', () => {
    expect(isCustomFieldsLabelMissing({ fields: [field()], label: { en: '' } })).toBe(true);
  });

  it('should accept a method label written in one language', () => {
    expect(isCustomFieldsLabelMissing({ fields: [field()], label: { fr: 'Animal' } })).toBe(false);
  });
});
