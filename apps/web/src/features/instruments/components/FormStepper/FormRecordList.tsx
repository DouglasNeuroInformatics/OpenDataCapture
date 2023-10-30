import type { FormDataType } from '@douglasneuroinformatics/form-types';
import { Card } from '@douglasneuroinformatics/ui';
import { toBasicISOString } from '@douglasneuroinformatics/utils';
import type { Language } from '@open-data-capture/common/core';
import type { FormInstrument } from '@open-data-capture/common/instrument';
import type { Subject } from '@open-data-capture/common/subject';
import { useTranslation } from 'react-i18next';

import { FormRecordItem } from './FormRecordItem';

export type FormRecordListProps = {
  form: FormInstrument<FormDataType, Language>;
  subject: Subject;
};

export const FormRecordList = ({ form, subject }: FormRecordListProps) => {
  const { i18n, t } = useTranslation(['instruments', 'common']);
  return (
    <Card>
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-slate-900 dark:text-slate-100">
          {t('summary.title', { title: form.details.title })}
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
          {t('summary.subtitle', {
            dateCompleted: new Date().toLocaleDateString(i18n.resolvedLanguage, {
              dateStyle: 'long'
            })
          })}
        </p>
      </div>
      <div className="border-t border-slate-200 px-4 py-5 dark:border-slate-700 sm:p-0">
        <dl className="sm:divide-y sm:divide-slate-200 sm:dark:divide-slate-700">
          <FormRecordItem
            label={t('common:fullName')}
            value={
              subject?.firstName && subject.lastName
                ? `${subject.firstName} ${subject.lastName}`
                : t('common:anonymous')
            }
          />
          <FormRecordItem
            label={t('common:identificationData.dateOfBirth.label')}
            value={toBasicISOString(subject.dateOfBirth)}
          />
          <FormRecordItem
            label={t('common:identificationData.sex.label')}
            value={t(`common:identificationData.sex.${subject.sex}`)}
          />
          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
            <dt className="text-sm font-medium text-slate-600 dark:text-slate-300">Salary expectation</dt>
            <dd className="mt-1 text-sm text-slate-900 dark:text-slate-100 sm:col-span-2 sm:mt-0">$120,000</dd>
          </div>
          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
            <dt className="text-sm font-medium text-slate-600 dark:text-slate-300">About</dt>
            <dd className="mt-1 text-sm text-slate-900 dark:text-slate-100 sm:col-span-2 sm:mt-0">
              Fugiat ipsum ipsum deserunt culpa aute sint do nostrud anim incididunt cillum culpa consequat. Excepteur
              qui ipsum aliquip consequat sint. Sit id mollit nulla mollit nostrud in ea officia proident. Irure nostrud
              pariatur mollit ad adipisicing reprehenderit deserunt qui eu.
            </dd>
          </div>
        </dl>
      </div>
    </Card>
  );
};
