/* eslint-disable perfectionist/sort-objects */

import { Form } from '@douglasneuroinformatics/ui';
import type { SubjectIdentificationData } from '@open-data-capture/common/subject';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

export type AddVisitFormData = SubjectIdentificationData & {
  date: Date;
};

export type AddVisitFormProps = {
  onSubmit: (data: AddVisitFormData) => void;
};

export const AddVisitForm = ({ onSubmit }: AddVisitFormProps) => {
  const { t } = useTranslation(['common', 'visits']);

  return (
    <Form<AddVisitFormData>
      className="mx-auto max-w-3xl"
      content={[
        {
          title: t('visits:subjectIdentification.title'),
          description: t('visits:subjectIdentification.description'),
          fields: {
            firstName: {
              description: t('visits:subjectIdentification.firstName.description'),
              kind: 'text',
              label: t('visits:subjectIdentification.firstName.label'),
              variant: 'short'
            },
            lastName: {
              description: t('visits:subjectIdentification.lastName.description'),
              kind: 'text',
              label: t('visits:subjectIdentification.lastName.label'),
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
                female: t('identificationData.sex.female'),
                male: t('identificationData.sex.male')
              }
            }
          }
        },
        {
          title: t('visits:additionalData.title'),
          fields: {
            date: {
              description: t('visits:dateAssessed.description'),
              kind: 'date',
              label: t('visits:dateAssessed.label')
            }
          }
        }
      ]}
      initialValues={{
        firstName: null,
        lastName: null,
        dateOfBirth: null,
        sex: null,
        date: new Date()
      }}
      submitBtnLabel={t('submit')}
      validationSchema={z.object({
        firstName: z.string(),
        lastName: z.string(),
        dateOfBirth: z.date(),
        sex: z.enum(['male', 'female']),
        date: z.date()
      })}
      onSubmit={onSubmit}
    />
  );
};
