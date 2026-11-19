/* eslint-disable perfectionist/sort-objects -- the form renders fields in key order, so they must follow the order the user fills them in */

import { useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

import { Form } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { FormTypes } from '@opendatacapture/runtime-core';
import { DEFAULT_GROUP_NAME } from '@opendatacapture/schemas/core';
import type { Group } from '@opendatacapture/schemas/group';
import { $SessionType } from '@opendatacapture/schemas/session';
import type { $CreateSessionData } from '@opendatacapture/schemas/session';
import type { Sex } from '@opendatacapture/schemas/subject';
import type { SubjectIdentificationSettings } from '@opendatacapture/schemas/subject-identification';
import { encodeScopedSubjectId, generateSubjectHash } from '@opendatacapture/subject-utils';
import type { Promisable } from 'type-fest';
import { z } from 'zod/v4';

import { useCustomIdentificationFields } from '@/hooks/useCustomIdentificationFields';
import type { CustomFieldsFormData } from '@/hooks/useCustomIdentificationFields';
import { useSubjectDemographicsLookup } from '@/hooks/useSubjectDemographicsLookup';
import { useSubjectIdentificationMethodOptions } from '@/hooks/useSubjectIdentificationMethodOptions';
import { getValueForLanguage } from '@/utils/language';

const MILLISECONDS_PER_YEAR = 31556952000;

const isNotInFuture = (date: Date) => date <= new Date();

type StartSessionFormValues = FormTypes.PartialData<StartSessionFormData>;

type AutofilledDemographics = Pick<StartSessionFormValues, 'subjectDateOfBirth' | 'subjectSex'>;

type StartSessionFormData = CustomFieldsFormData & {
  sessionDate?: Date;
  sessionType: 'IN_PERSON' | 'RETROSPECTIVE';
  subjectDateOfBirth?: Date;
  subjectFirstName?: string;
  subjectId?: string;
  subjectLastName?: string;
  subjectSex?: Sex;
};

type StartSessionFormProps = {
  currentGroup: Group | null;
  customSubjectIds: string[];
  initialValues?: FormTypes.PartialNullableData<StartSessionFormData>;
  onSubmit: (data: $CreateSessionData) => Promisable<void>;
  readOnly: boolean;
  subjectIdentificationSettings: Pick<SubjectIdentificationSettings, 'customFields' | 'offeredMethods'>;
  username?: null | string;
};

export const StartSessionForm = ({
  currentGroup,
  customSubjectIds,
  subjectIdentificationSettings,
  username,
  initialValues,
  readOnly,
  onSubmit
}: StartSessionFormProps) => {
  const { resolvedLanguage, t } = useTranslation();
  const lookupDemographics = useSubjectDemographicsLookup();
  const [autofilled, setAutofilled] = useState<AutofilledDemographics>({});
  const latestIdentity = useRef('');
  const customFields = useCustomIdentificationFields(subjectIdentificationSettings.customFields);
  const { options: methodOptions } = useSubjectIdentificationMethodOptions(subjectIdentificationSettings);

  const scopeCustomId = (customId: string) => {
    return encodeScopedSubjectId(customId, { groupName: currentGroup?.name ?? DEFAULT_GROUP_NAME });
  };

  /**
   * What identifies the subject so far, if enough to look them up: empty for personal information,
   * an incomplete entry or a method switch, so either of the last two clears what was filled in.
   */
  const selectIdentity = (values: StartSessionFormValues) => {
    if (values.subjectIdentificationMethod === 'CUSTOM_ID') {
      return values.subjectId ? `CUSTOM_ID:${values.subjectId}` : '';
    } else if (
      values.subjectIdentificationMethod === 'CUSTOM_FIELDS' &&
      Object.keys(customFields.findErrors(values)).length === 0
    ) {
      return `CUSTOM_FIELDS:${JSON.stringify(customFields.orderValues(values))}`;
    }
    return '';
  };

  /** The stored id of a subject who may already exist, or null when there can be none yet. */
  const findExistingSubjectId = async (values: StartSessionFormValues) => {
    if (values.subjectIdentificationMethod === 'CUSTOM_FIELDS') {
      return customFields.deriveSubjectId(values);
    }
    // A custom id absent from the group's suggestions belongs to no subject, so it is not looked up.
    return values.subjectId && customSubjectIds.includes(values.subjectId) ? scopeCustomId(values.subjectId) : null;
  };

  const autofillExistingSubject = async (
    values: StartSessionFormValues,
    setValues: Dispatch<SetStateAction<StartSessionFormValues>>
  ) => {
    const identity = selectIdentity(values);
    latestIdentity.current = identity;
    const subjectId = identity ? await findExistingSubjectId(values) : null;
    const demographics = subjectId ? await lookupDemographics(subjectId) : null;
    // A slower lookup for an identifier the user has since moved on from must not overwrite the newer one.
    if (latestIdentity.current !== identity) {
      return;
    }
    const next: AutofilledDemographics = {
      subjectDateOfBirth: demographics?.dateOfBirth ?? undefined,
      subjectSex: demographics?.sex ?? undefined
    };
    setValues((current) => ({
      ...current,
      subjectDateOfBirth:
        next.subjectDateOfBirth ?? (autofilled.subjectDateOfBirth ? undefined : current.subjectDateOfBirth),
      subjectSex: next.subjectSex ?? (autofilled.subjectSex ? undefined : current.subjectSex)
    }));
    setAutofilled(next);
  };

  return (
    <Form
      preventResetValuesOnReset
      suspendWhileSubmitting
      className="mx-auto max-w-3xl"
      content={[
        {
          title: t('common.identificationMethod'),
          description: t('common.identificationMethodDesc'),
          fields: {
            subjectIdentificationMethod: {
              kind: 'string',
              label: 'Method',
              options: methodOptions,
              variant: 'select'
            }
          }
        },
        {
          title: t('common.subjectIdentification.title'),
          fields: {
            subjectId: {
              kind: 'dynamic',
              deps: ['subjectIdentificationMethod'],
              render({ subjectIdentificationMethod }) {
                return subjectIdentificationMethod === 'CUSTOM_ID'
                  ? {
                      kind: 'string',
                      label: t('common.identifier'),
                      variant: 'combobox',
                      allowCustomValue: true,
                      options: Object.fromEntries(customSubjectIds.map((id) => [id, id]))
                    }
                  : null;
              }
            },
            ...customFields.formFields,
            subjectFirstName: {
              kind: 'dynamic',
              deps: ['subjectIdentificationMethod'],
              render({ subjectIdentificationMethod }) {
                return subjectIdentificationMethod === 'PERSONAL_INFO'
                  ? {
                      description: t('common.subjectIdentification.firstName.description'),
                      kind: 'string',
                      label: t('common.subjectIdentification.firstName.label'),
                      variant: 'input'
                    }
                  : null;
              }
            },
            subjectLastName: {
              kind: 'dynamic',
              deps: ['subjectIdentificationMethod'],
              render({ subjectIdentificationMethod }) {
                return subjectIdentificationMethod === 'PERSONAL_INFO'
                  ? {
                      description: t('common.subjectIdentification.lastName.description'),
                      kind: 'string',
                      label: t('common.subjectIdentification.lastName.label'),
                      variant: 'input'
                    }
                  : null;
              }
            },
            subjectDateOfBirth: {
              disabled: autofilled.subjectDateOfBirth !== undefined,
              kind: 'date',
              label: t('core.identificationData.dateOfBirth.label')
            },
            subjectSex: {
              description: t('core.identificationData.sex.description'),
              disabled: autofilled.subjectSex !== undefined,
              kind: 'string',
              label: t('core.identificationData.sex.label'),
              options: {
                FEMALE: t('core.identificationData.sex.female'),
                MALE: t('core.identificationData.sex.male')
              },
              variant: 'select'
            }
          }
        },
        {
          title: t('session.additionalData.title'),
          fields: {
            sessionType: {
              kind: 'string',
              label: t('session.type.label'),
              variant: 'select',
              options: {
                RETROSPECTIVE: t('session.type.retrospective'),
                IN_PERSON: t('session.type.in-person')
              }
            },
            sessionDate: {
              kind: 'dynamic',
              deps: ['sessionType'],
              render({ sessionType }) {
                return sessionType === 'RETROSPECTIVE'
                  ? {
                      description: t('session.dateAssessed.description'),
                      kind: 'date',
                      label: t('session.dateAssessed.label'),
                      variant: 'datetime'
                    }
                  : null;
              }
            }
          }
        }
      ]}
      data-testid="start-session-form"
      initialValues={initialValues}
      readOnly={readOnly}
      submitBtnLabel={t('core.submit')}
      subscribe={{
        onChange: autofillExistingSubject,
        selector: selectIdentity
      }}
      validationSchema={z
        .object({
          subjectFirstName: z.string().optional(),
          subjectLastName: z.string().optional(),
          subjectIdentificationMethod: z.enum(Object.keys(methodOptions)),
          // Every check on the identifier and the two dates lives in the refinement below: zod v4
          // omits an optional property that failed its own checks from the value it hands the
          // refinement, which then reads the field as missing and adds a contradictory required-field
          // error.
          subjectId: z.string().optional(),
          subjectDateOfBirth: z.date().optional(),
          subjectSex: z.enum(['MALE', 'FEMALE']).optional(),
          sessionType: $SessionType.exclude(['REMOTE']),
          sessionDate: z.date().optional(),
          ...customFields.shape
        })
        .superRefine((val, ctx) => {
          if (val.sessionType === 'RETROSPECTIVE') {
            if (!val.sessionDate) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: t('core.form.requiredField'),
                path: ['sessionDate']
              });
            } else if (!isNotInFuture(val.sessionDate)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: t('session.errors.assessmentMustBeInPast'),
                path: ['sessionDate']
              });
            }
          }
          if (val.subjectIdentificationMethod === 'CUSTOM_ID') {
            if (!val.subjectId) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: t('core.form.requiredField'),
                path: ['subjectId']
              });
            } else if (val.subjectId.includes('$')) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: t({
                  en: 'Illegal character: $',
                  es: 'Carácter no permitido: $',
                  fr: 'Caractère non autorisé : $'
                }),
                path: ['subjectId']
              });
            } else if (currentGroup?.settings.idValidationRegex) {
              try {
                const regex = new RegExp(currentGroup?.settings.idValidationRegex);
                if (!regex.test(val.subjectId)) {
                  ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message:
                      getValueForLanguage(
                        currentGroup.settings.idValidationRegexErrorMessage ?? {},
                        resolvedLanguage
                      ) ??
                      t({
                        en: `Must match regular expression: ${regex.source}`,
                        es: `Debe coincidir con la expresión regular: ${regex.source}`,
                        fr: `Doit correspondre à l'expression régulière : ${regex.source}`
                      }),
                    path: ['subjectId']
                  });
                }
              } catch (err) {
                // this should be checked already on the backend
                console.error(err);
              }
            }
          } else if (val.subjectIdentificationMethod === 'CUSTOM_FIELDS') {
            for (const [key, message] of Object.entries(customFields.findErrors(val))) {
              ctx.addIssue({ code: z.ZodIssueCode.custom, message, path: [key] });
            }
          } else {
            const requiredKeys = ['subjectFirstName', 'subjectLastName', 'subjectSex', 'subjectDateOfBirth'] as const;
            for (const key of requiredKeys) {
              if (!val[key]) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: t('core.form.requiredField'),
                  path: [key]
                });
              }
            }
          }
          const minimumAge = currentGroup?.settings.minimumAge;
          const minDateOfBirth = minimumAge ? new Date(Date.now() - minimumAge * MILLISECONDS_PER_YEAR) : undefined;
          if (val.subjectDateOfBirth && !isNotInFuture(val.subjectDateOfBirth)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: t({
                en: 'Date of birth must be in the past',
                es: 'La fecha de nacimiento debe estar en el pasado',
                fr: 'La date de naissance doit être dans le passé'
              }),
              path: ['subjectDateOfBirth']
            });
          } else if (val.subjectDateOfBirth && minDateOfBirth && val.subjectDateOfBirth > minDateOfBirth) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: t({
                en: `Subject must be above age of ${minimumAge}`,
                es: `El sujeto debe tener más de ${minimumAge} años`,
                fr: `Le sujet doit avoir au moins ${minimumAge} ans`
              }),
              path: ['subjectDateOfBirth']
            });
          }
        })}
      onSubmit={async (values) => {
        const { sessionType, sessionDate, subjectFirstName, subjectLastName, subjectDateOfBirth, subjectSex } = values;
        let { subjectId } = values;
        if (values.subjectIdentificationMethod === 'CUSTOM_FIELDS') {
          subjectId = await customFields.deriveSubjectId(values);
        } else if (!subjectId) {
          subjectId = await generateSubjectHash({
            firstName: subjectFirstName!,
            lastName: subjectLastName!,
            dateOfBirth: subjectDateOfBirth!,
            sex: subjectSex!
          });
        } else {
          subjectId = scopeCustomId(subjectId);
        }
        await onSubmit({
          // Only a retrospective session has a date of its own; an in-person one starts now.
          date: sessionDate ?? new Date(),
          groupId: currentGroup?.id ?? null,
          username: username ?? null,
          type: sessionType,
          subjectData: {
            id: subjectId,
            firstName: subjectFirstName,
            lastName: subjectLastName,
            dateOfBirth: subjectDateOfBirth,
            sex: subjectSex
          }
        });
      }}
    />
  );
};

export type { StartSessionFormData };
