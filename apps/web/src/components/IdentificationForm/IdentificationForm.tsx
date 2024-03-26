/* eslint-disable perfectionist/sort-objects */

import { Form } from '@douglasneuroinformatics/libui/components';
import { $SubjectIdentificationData, type SubjectIdentificationData } from '@opendatacapture/schemas/subject';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('core');

  return (
    <Form
      content={{
        firstName: {
          description: t('identificationData.firstName.description'),
          kind: 'string',
          label: t('identificationData.firstName.label'),
          variant: 'input'
        },
        lastName: {
          description: t('identificationData.lastName.description'),
          kind: 'string',
          label: t('identificationData.lastName.label'),
          variant: 'input'
        },
        dateOfBirth: {
          kind: 'date',
          label: t('identificationData.dateOfBirth.label')
        },
        sex: {
          description: t('identificationData.sex.description'),
          kind: 'string',
          label: t('identificationData.sex.label'),
          options: {
            FEMALE: t('identificationData.sex.female'),
            MALE: t('identificationData.sex.male')
          },
          variant: 'select'
        }
      }}
      initialValues={fillActiveSubject ? activeVisit?.subject : undefined}
      resetBtn={fillActiveSubject}
      submitBtnLabel={submitBtnLabel ?? t('submit')}
      validationSchema={$SubjectIdentificationData}
      onSubmit={onSubmit}
    />
  );
};
