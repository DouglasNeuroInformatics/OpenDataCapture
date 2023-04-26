import React from 'react';

import { BaseFormField, FormInstrument, FormInstrumentData } from '@douglasneuroinformatics/common';
import { useTranslation } from 'react-i18next';

import { Button, Spinner } from '@/components';
import { useDownload } from '@/hooks/useDownload';
import { useActiveSubjectStore } from '@/stores/active-subject-store';

const FormSummaryItem = ({ label, value }: { label: string; value: any }) => {
  return (
    <div className="my-1">
      <span className="font-semibold">{label}: </span>
      <span>{String(value)}</span>
    </div>
  );
};

export interface FormSummaryProps<T extends FormInstrumentData> {
  instrument: FormInstrument<T>;
  result?: T;
  dateCollected?: Date;
}

export const FormSummary = <T extends FormInstrumentData>({
  dateCollected,
  instrument,
  result
}: FormSummaryProps<T>) => {
  const { activeSubject } = useActiveSubjectStore();
  const download = useDownload();
  const { t } = useTranslation('instruments');

  if (!result) {
    return <Spinner />;
  }

  const downloadResult = () => {
    const filename = `${instrument.name}_v${instrument.version}_${dateCollected!.toISOString()}.json`;
    download(filename, () => Promise.resolve(JSON.stringify(result, null, 2)));
  };

  return (
    <div>
      <h3 className="my-3 text-xl font-semibold">{t('formPage.summary.subject')}</h3>
      <FormSummaryItem
        label={t('formPage.summary.name')}
        value={`${activeSubject!.firstName} ${activeSubject!.lastName}`}
      />
      <FormSummaryItem label={t('formPage.summary.dateOfBirth')} value={activeSubject?.dateOfBirth} />
      <FormSummaryItem label={t('formPage.summary.sex')} value={activeSubject?.sex} />
      <h3 className="my-3 text-xl font-semibold">{t('formPage.summary.metadata')}</h3>
      <FormSummaryItem label={t('formPage.summary.instrumentTitle')} value={instrument.details.title} />
      <FormSummaryItem label={t('formPage.summary.instrumentVersion')} value={instrument.version} />
      <FormSummaryItem label={t('formPage.summary.dateCollected')} value={dateCollected!.toLocaleString('en-CA')} />
      <h3 className="my-3 text-xl font-semibold">{t('formPage.summary.results')}</h3>
      <div className="mb-3">
        {Object.keys(result).map((fieldName) => {
          let field: BaseFormField;
          if (instrument.content instanceof Array) {
            field = instrument.content
              .map((group) => group.fields)
              .reduce((prev, current) => ({ ...prev, ...current }))[fieldName]!;
          } else {
            field = instrument.content[fieldName];
          }
          return <FormSummaryItem key={fieldName} label={field.label} value={result[fieldName]} />;
        })}
      </div>
      <div className="flex gap-3 print:hidden">
        <Button label={t('formPage.summary.print')} onClick={() => print()} />
        <Button label={t('formPage.summary.download')} onClick={downloadResult} />
      </div>
    </div>
  );
};
