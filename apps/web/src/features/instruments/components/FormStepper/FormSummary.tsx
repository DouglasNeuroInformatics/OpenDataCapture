import type { FormDataType, PrimitiveFieldValue } from '@douglasneuroinformatics/form-types';
import { Button, Card, formatFormDataAsString, getFormFields, useDownload } from '@douglasneuroinformatics/ui';
import { toBasicISOString } from '@douglasneuroinformatics/utils';
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
        <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
          {t('summary.subtitle', {
            dateCompleted: new Date().toLocaleString(i18n.resolvedLanguage, {
              dateStyle: 'long',
              timeStyle: 'long'
            })
          })}
        </p>
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
      <div className="flex gap-6 px-4 py-5 sm:px-6">
        <Button className="w-full" label={t('common:download')} variant="secondary" onClick={handleDownload} />
        <Button className="w-full" label={t('common:print')} variant="secondary" />
      </div>
    </Card>
  );
};
