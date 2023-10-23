/* eslint-disable perfectionist/sort-objects */

import { Form } from '@douglasneuroinformatics/ui';
import type { SubjectIdentificationData } from '@open-data-capture/types';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { useActiveVisitStore } from '@/stores/active-visit-store';

export type IdentificationFormProps = {
  /** Whether to prefill the form with the subject from the active visit, if one exists  */
  fillActiveSubject?: boolean;

  /** Callback function invoked when validation is successful */
  onSubmit: (data: SubjectIdentificationData) => void;

  /** Optional override for the default submit button label */
  submitBtnLabel?: string;
};

export const IdentificationForm = ({ fillActiveSubject, onSubmit, submitBtnLabel }: IdentificationFormProps) => {
  const { activeVisit } = useActiveVisitStore();
  const { t } = useTranslation(['common']);

  return (
    <Form<SubjectIdentificationData>
      content={{
        firstName: {
          description: t('common:identificationData.firstName.description'),
          kind: 'text',
          label: t('common:identificationData.firstName.label'),
          variant: 'short'
        },
        lastName: {
          description: t('common:identificationData.lastName.description'),
          kind: 'text',
          label: t('common:identificationData.lastName.label'),
          variant: 'short'
        },
        dateOfBirth: {
          kind: 'date',
          label: t('common:identificationData.dateOfBirth.label')
        },
        sex: {
          description: t('common:identificationData.sex.description'),
          kind: 'options',
          label: t('common:identificationData.sex.label'),
          options: {
            female: t('common:identificationData.sex.female'),
            male: t('common:identificationData.sex.male')
          }
        }
      }}
      initialValues={fillActiveSubject ? activeVisit?.subject ?? null : null}
      resetBtn={fillActiveSubject}
      submitBtnLabel={submitBtnLabel ?? t('submit')}
      validationSchema={z.object({
        firstName: z.string(),
        lastName: z.string(),
        dateOfBirth: z.date(),
        sex: z.enum(['male', 'female'])
      })}
      onSubmit={onSubmit}
    />
  );
};
