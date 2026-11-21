import type { LocalizedString } from '@opendatacapture/schemas/core';
import type { SubjectIdentificationMethod } from '@opendatacapture/schemas/subject';
import {
  $CustomFieldsDefinitionData,
  $CustomIdentificationField
} from '@opendatacapture/schemas/subject-identification';
import type {
  $UpdateSubjectIdentificationSettingsData,
  CustomFieldsDefinitionData,
  CustomIdentificationField,
  SubjectIdentificationSettings
} from '@opendatacapture/schemas/subject-identification';

import { authoredLanguages, omitBlankLanguages } from './language';

/** A field being edited. Its `key` keeps the field's inputs with it when the fields are reordered. */
type CustomFieldDraft = CustomIdentificationField & { key: string };

type CustomFieldsDraft = Omit<CustomFieldsDefinitionData, 'fields'> & { fields: CustomFieldDraft[] };

/**
 * Everything the Subject Identification tab saves with its one button. A section added to the tab
 * adds its part here and to {@link toSubjectIdentificationDraft} and
 * {@link toUpdateSubjectIdentificationSettingsData}.
 */
type SubjectIdentificationDraft = {
  customFields: CustomFieldsDraft | null;
  offeredMethods: SubjectIdentificationMethod[];
};

/**
 * The body the draft would send, before the schema has checked it: the draft may offer no method
 * while it is being edited, which the schema refuses.
 */
type UncheckedSubjectIdentificationSettingsData = Omit<$UpdateSubjectIdentificationSettingsData, 'offeredMethods'> & {
  offeredMethods: SubjectIdentificationMethod[];
};

type CustomFieldIssues = {
  label: boolean;
  pattern: boolean;
};

const createCustomFieldDraft = (): CustomFieldDraft => ({ key: crypto.randomUUID(), label: {}, pattern: '' });

/** A definition has at least one field, so a new one starts with a field to fill in. */
const createCustomFieldsDraft = (): CustomFieldsDraft => ({ fields: [createCustomFieldDraft()], label: {} });

const toSubjectIdentificationDraft = ({
  customFields,
  offeredMethods
}: SubjectIdentificationSettings): SubjectIdentificationDraft => ({
  customFields: customFields && {
    fields: customFields.fields.map((field) => ({ ...field, key: crypto.randomUUID() })),
    label: customFields.label
  },
  offeredMethods
});

const omitBlankOptionalText = (value: LocalizedString | null | undefined): LocalizedString | null => {
  return authoredLanguages(value).length > 0 ? omitBlankLanguages(value) : null;
};

const toUpdateSubjectIdentificationSettingsData = ({
  customFields,
  offeredMethods
}: SubjectIdentificationDraft): UncheckedSubjectIdentificationSettingsData => ({
  customFields: customFields && {
    fields: customFields.fields.map(({ description, label, pattern, patternErrorMessage }) => ({
      description: omitBlankOptionalText(description),
      label: omitBlankLanguages(label),
      pattern,
      patternErrorMessage: omitBlankOptionalText(patternErrorMessage)
    })),
    label: omitBlankLanguages(customFields.label)
  },
  offeredMethods
});

// The schema decides what is invalid; the editor only decides where to say so.
const findCustomFieldIssues = ({ label, pattern }: CustomFieldDraft): CustomFieldIssues => ({
  label: !$CustomIdentificationField.shape.label.safeParse(label).success,
  pattern: !$CustomIdentificationField.shape.pattern.safeParse(pattern).success
});

const isCustomFieldsLabelMissing = ({ label }: CustomFieldsDraft): boolean => {
  return !$CustomFieldsDefinitionData.shape.label.safeParse(label).success;
};

export {
  createCustomFieldDraft,
  createCustomFieldsDraft,
  findCustomFieldIssues,
  isCustomFieldsLabelMissing,
  toSubjectIdentificationDraft,
  toUpdateSubjectIdentificationSettingsData
};

export type {
  CustomFieldDraft,
  CustomFieldIssues,
  CustomFieldsDraft,
  SubjectIdentificationDraft,
  UncheckedSubjectIdentificationSettingsData
};
