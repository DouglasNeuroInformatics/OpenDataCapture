/* eslint-disable perfectionist/sort-objects */

import { Form } from '@douglasneuroinformatics/ui/legacy';
import { $SubjectIdentificationData, type SubjectIdentificationData } from '@open-data-capture/common/subject';
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
    <Form<SubjectIdentificationData>
      content={{
        firstName: {
          description: t('identificationData.firstName.description'),
          kind: 'text',
          label: t('identificationData.firstName.label'),
          variant: 'short'
        },
        lastName: {
          description: t('identificationData.lastName.description'),
          kind: 'text',
          label: t('identificationData.lastName.label'),
          variant: 'short'
        },
        dateOfBirth: {
          kind: 'date',
          label: t('identificationData.dateOfBirth.label')
        },
        sex: {
          description: t('identificationData.sex.description'),
          kind: 'options',
          label: t('identificationData.sex.label'),
          options: {
            FEMALE: t('identificationData.sex.female'),
            MALE: t('identificationData.sex.male')
          }
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
