import React from 'react';

import { BaseFormField, FormInstrument, FormInstrumentContent, FormInstrumentData } from '@ddcp/common';

import { Button, FormValues, Spinner } from '@/components';
import { useTranslation } from 'react-i18next';

const FormSummaryItem = ({ label, value }: { label: string; value: string | number }) => {
  return (
    <div className="my-1">
      <span className="font-semibold">{label}: </span>
      <span>{value}</span>
    </div>
  );
};

export interface FormSummaryProps<T extends FormInstrumentData> {
  instrument: FormInstrument<T>;
  result?: FormValues<T>;
  dateCollected?: Date;
}

export const FormSummary = <T extends FormInstrumentData>({
  dateCollected,
  instrument,
  result
}: FormSummaryProps<T>) => {
  const { t } = useTranslation('instruments');

  if (!result) {
    return <Spinner />;
  }

  return (
    <div>
      <h3 className="my-3 text-xl font-semibold">Metadata</h3>
      <FormSummaryItem label={t('formPage.summary.instrumentTitle')} value={instrument.details.title} />
      <FormSummaryItem label={t('formPage.summary.instrumentVersion')} value={instrument.version} />
      <FormSummaryItem label={t('formPage.summary.dateCollected')} value={dateCollected!.toLocaleString('en-CA')} />
      <h3 className="my-3 text-xl font-semibold">Results</h3>
      <div className="mb-3">
        {Object.keys(result).map((fieldName) => {
          // Fix before finalizing
          const field = instrument.content[fieldName as keyof FormInstrumentContent<T>] as BaseFormField;
          return <FormSummaryItem key={fieldName} label={field.label} value={result[fieldName] as string} />;
        })}
      </div>
      <div className="print:hidden">
        <Button label={t('formPage.summary.print')} onClick={() => print()} />
      </div>
    </div>
  );
};
