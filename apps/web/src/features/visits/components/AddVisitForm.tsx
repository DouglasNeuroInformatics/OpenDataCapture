/* eslint-disable perfectionist/sort-objects */

import { Form } from '@douglasneuroinformatics/libui/components';
import type { SubjectIdentificationData } from '@opendatacapture/schemas/subject';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

const EIGHTEEN_YEARS = 568025136000;

const MIN_DATE_OF_BIRTH = new Date(Date.now() - EIGHTEEN_YEARS);

export type AddVisitFormData = SubjectIdentificationData & {
  date: Date;
};

export type AddVisitFormProps = {
  onSubmit: (data: AddVisitFormData) => void;
};

export const AddVisitForm = ({ onSubmit }: AddVisitFormProps) => {
  const { t } = useTranslation(['core', 'visits']);

  return (
    <Form
      className="mx-auto max-w-3xl"
      content={[
        {
          title: t('visits:subjectIdentification.title'),
          description: t('visits:subjectIdentification.description'),
          fields: {
            firstName: {
              description: t('visits:subjectIdentification.firstName.description'),
              kind: 'string',
              label: t('visits:subjectIdentification.firstName.label'),
              variant: 'input'
            },
            lastName: {
              description: t('visits:subjectIdentification.lastName.description'),
              kind: 'string',
              label: t('visits:subjectIdentification.lastName.label'),
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
        date: new Date()
      }}
      submitBtnLabel={t('submit')}
      validationSchema={z.object({
        firstName: z.string(),
        lastName: z.string(),
        dateOfBirth: z.date().max(MIN_DATE_OF_BIRTH, { message: t('visits:errors.mustBeAdult') }),
        sex: z.enum(['MALE', 'FEMALE']),
        date: z.date().max(new Date(), { message: t('visits:errors.assessmentMustBeInPast') })
      })}
      onSubmit={onSubmit}
    />
  );
};
