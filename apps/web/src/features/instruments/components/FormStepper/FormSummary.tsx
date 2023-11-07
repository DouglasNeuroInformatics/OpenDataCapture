import type { FormDataType, PrimitiveFieldValue } from '@douglasneuroinformatics/form-types';
import { Card, formatFormDataAsString, getFormFields, useDownload } from '@douglasneuroinformatics/ui';
import { toBasicISOString } from '@douglasneuroinformatics/utils';
import { ArrowDownTrayIcon, PrinterIcon } from '@heroicons/react/24/outline';
import type { Language } from '@open-data-capture/common/core';
import type { FormInstrument } from '@open-data-capture/common/instrument';
import type { Visit } from '@open-data-capture/common/visit';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';

import { FormSummaryGroup } from './FormSummaryGroup';

export type FormSummaryProps = {
  activeVisit: Visit;
  data: FormDataType;
  form: FormInstrument<FormDataType, Language>;
  timeCollected: number;
};

export const FormSummary = ({ activeVisit, data, form, timeCollected }: FormSummaryProps) => {
  const download = useDownload();
  const { i18n, t } = useTranslation(['instruments', 'common']);

  const handleDownload = () => {
    const filename = `${form.name}_v${form.version}_${new Date(timeCollected).toISOString()}.txt`;
    download(filename, () => Promise.resolve(formatFormDataAsString(data)));
  };

  const subject = activeVisit.subject;

  const fields = getFormFields(form.content);

  return (
    <Card>
      <div className="border-b px-4 py-5 sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-slate-900 dark:text-slate-100">
          {t('summary.title', { title: form.details.title })}
        </h3>
        <div className="mt-1 grid grid-cols-3">
          <p className="col-span-2 text-sm text-slate-600 dark:text-slate-300">
            {t('summary.subtitle', {
              dateCompleted: new Date().toLocaleString(i18n.resolvedLanguage, {
                dateStyle: 'long',
                timeStyle: 'long'
              })
            })}
          </p>
          <div className="flex justify-end gap-4 text-slate-600 dark:text-slate-300 print:hidden">
            <button type="button">
              <ArrowDownTrayIcon height={20} width={20} onClick={handleDownload} />
            </button>
            <button type="button">
              <PrinterIcon
                height={20}
                width={20}
                onClick={() => {
                  print();
                }}
              />
            </button>
          </div>
        </div>
      </div>
      <FormSummaryGroup
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
      <FormSummaryGroup
        items={[
          {
            label: t('instruments:props.title'),
            value: form.details.title
          },
          {
            label: t('common:language'),
            value: match(form.language)
              .with('en', () => t('common:languages.english'))
              .with('fr', () => t('common:languages.french'))
              .otherwise(() => form.language)
          },
          {
            label: t('instruments:props.version'),
            value: form.version
          }
        ]}
        title={t('common:instrument')}
      />
      <FormSummaryGroup
        items={Object.keys(fields).map((fieldName) => {
          return match(fields[fieldName]!)
            .with({ kind: 'array' }, (field) => ({
              label: field.label,
              value: 'NA'
            }))
            .with({ kind: 'dynamic' }, (field) => {
              const staticField = field.render(data);
              if (!staticField || staticField.kind === 'array') {
                return {
                  label: staticField?.label ?? '',
                  value: 'NA'
                };
              }
              return {
                label: staticField.label,
                value: (data[fieldName] ?? 'NA') as PrimitiveFieldValue
              };
            })
            .otherwise((field) => ({
              label: field.label,
              value: data[fieldName] as PrimitiveFieldValue
            }));
        })}
        title={t('common:responses')}
      />
    </Card>
  );
};
