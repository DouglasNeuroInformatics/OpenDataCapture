/* eslint-disable perfectionist/sort-objects */

import { useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

import { Form } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { FormTypes } from '@opendatacapture/runtime-core';
import { DEFAULT_GROUP_NAME } from '@opendatacapture/schemas/core';
import type { Group } from '@opendatacapture/schemas/group';
import { $SessionType } from '@opendatacapture/schemas/session';
import type { $CreateSessionData } from '@opendatacapture/schemas/session';
import { $SubjectIdentificationMethod } from '@opendatacapture/schemas/subject';
import type { Sex, SubjectIdentificationMethod } from '@opendatacapture/schemas/subject';
import { encodeScopedSubjectId, generateSubjectHash } from '@opendatacapture/subject-utils';
import type { Promisable } from 'type-fest';
import { z } from 'zod/v4';

import { useSubjectDemographicsLookup } from '@/hooks/useSubjectDemographicsLookup';
import { getValueForLanguage } from '@/utils/language';

const currentDate = new Date();

type StartSessionFormValues = FormTypes.PartialData<StartSessionFormData>;

type AutofilledDemographics = Pick<StartSessionFormValues, 'subjectDateOfBirth' | 'subjectSex'>;

/** Empty unless a custom identifier is in use, so switching method clears what it filled in. */
const selectedCustomId = (values: StartSessionFormValues) =>
  values.subjectIdentificationMethod === 'CUSTOM_ID' ? (values.subjectId ?? '') : '';

type StartSessionFormData = {
  sessionDate: Date;
  sessionType: 'IN_PERSON' | 'RETROSPECTIVE';
  subjectDateOfBirth?: Date;
  subjectFirstName?: string;
  subjectId?: string;
  subjectIdentificationMethod: SubjectIdentificationMethod;
  subjectLastName?: string;
  subjectSex?: Sex;
};

type StartSessionFormProps = {
  currentGroup: Group | null;
  customSubjectIds: string[];
  initialValues?: FormTypes.PartialNullableData<StartSessionFormData>;
  onSubmit: (data: $CreateSessionData) => Promisable<void>;
  readOnly: boolean;
  username?: null | string;
};

export const StartSessionForm = ({
  currentGroup,
  customSubjectIds,
  username,
  initialValues,
  readOnly,
  onSubmit
}: StartSessionFormProps) => {
  const { resolvedLanguage, t } = useTranslation();
  const lookupDemographics = useSubjectDemographicsLookup();
  const [autofilled, setAutofilled] = useState<AutofilledDemographics>({});
  const latestCustomId = useRef('');
  const minDateOfBirth = currentGroup?.settings.minimumAge
    ? new Date(currentDate.getTime() - currentGroup.settings.minimumAge * 31556952000)
    : undefined;

  const scopeCustomId = (customId: string) =>
    encodeScopedSubjectId(customId, { groupName: currentGroup?.name ?? DEFAULT_GROUP_NAME });

  const autofillExistingSubject = async (
    values: StartSessionFormValues,
    setValues: Dispatch<SetStateAction<StartSessionFormValues>>
  ) => {
    const customId = selectedCustomId(values);
    latestCustomId.current = customId;
    const demographics = customSubjectIds.includes(customId) ? await lookupDemographics(scopeCustomId(customId)) : null;
    // A slower lookup for an identifier the user has since moved on from must not overwrite the newer one.
    if (latestCustomId.current !== customId) {
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
              options: {
                CUSTOM_ID: t('common.customIdentifier'),
                PERSONAL_INFO: t('common.personalInfo')
              },
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
                      label: t('session.dateAssessed.label')
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
        selector: selectedCustomId
      }}
      validationSchema={z
        .object({
          subjectFirstName: z.string().optional(),
          subjectLastName: z.string().optional(),
          subjectIdentificationMethod: $SubjectIdentificationMethod,
          // Every check on the identifier lives in the refinement below: zod v4 omits an optional
          // property that failed its own checks from the value it hands the refinement, which then
          // reads a typed identifier as missing and adds a contradictory required-field error.
          subjectId: z.string().optional(),
          subjectDateOfBirth: z
            .date()
            .optional()
            .refine(
              (date) => {
                if (!date || !minDateOfBirth) return true;
                return date <= minDateOfBirth;
              },
              {
                message: t({
                  en: `Subject must be above age of ${currentGroup?.settings.minimumAge}`,
                  es: `El sujeto debe tener más de ${currentGroup?.settings.minimumAge} años`,
                  fr: `Le sujet doit avoir au moins ${currentGroup?.settings.minimumAge} ans`
                })
              }
            ),
          subjectSex: z.enum(['MALE', 'FEMALE']).optional(),
          sessionType: $SessionType.exclude(['REMOTE']),
          sessionDate: z
            .date()
            .max(currentDate, { message: t('session.errors.assessmentMustBeInPast') })
            .default(currentDate)
        })
        .superRefine((val, ctx) => {
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
        })}
      onSubmit={async ({
        sessionType,
        sessionDate,
        subjectId,
        subjectFirstName,
        subjectLastName,
        subjectDateOfBirth,
        subjectSex
      }) => {
        if (!subjectId) {
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
          date: sessionDate,
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
