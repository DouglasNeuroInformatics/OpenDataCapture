import type { FormDataType } from '@douglasneuroinformatics/form-types';
import { Card } from '@douglasneuroinformatics/ui';
import { toBasicISOString } from '@douglasneuroinformatics/utils';
import type { Language } from '@open-data-capture/common/core';
import type { FormInstrument } from '@open-data-capture/common/instrument';
import type { Subject } from '@open-data-capture/common/subject';
import { useTranslation } from 'react-i18next';

import { FormRecordListGroup } from './FormRecordListGroup';

export type FormRecordListProps = {
  form: FormInstrument<FormDataType, Language>;
  subject: Subject;
};

export const FormRecordList = ({ form, subject }: FormRecordListProps) => {
  const { i18n, t } = useTranslation(['instruments', 'common']);
  return (
    <Card>
      <div className="border-b px-4 py-5 sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-slate-900 dark:text-slate-100">
          {t('summary.title', { title: form.details.title })}
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
          {t('summary.subtitle', {
            dateCompleted: new Date().toLocaleString(i18n.resolvedLanguage, {
              dateStyle: 'long',
              timeStyle: 'long'
            })
          })}
        </p>
      </div>
      <FormRecordListGroup
        items={[
          {
            label: t('common:fullName'),
            value:
              subject?.firstName && subject.lastName
                ? `${subject.firstName} ${subject.lastName}`
                : t('common:anonymous')
          },
          {
            label: t('common:identificationData.dateOfBirth.label'),
            value: toBasicISOString(subject.dateOfBirth)
          },
          {
            label: t('common:identificationData.sex.label'),
            value: t(`common:identificationData.sex.${subject.sex}`)
          }
        ]}
        title={t('common:subject')}
      />
      <FormRecordListGroup
        items={[
          {
            label: t('instruments:props.title'),
            value: form.details.title
          },
          {
            label: t('instruments:props.version'),
            value: form.version
          }
        ]}
        title={t('common:instrument')}
      />
    </Card>
  );
};
