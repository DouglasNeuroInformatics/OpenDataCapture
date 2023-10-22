import { useMemo } from 'react';

import type { FormInstrumentData, NullableFormInstrumentData } from '@douglasneuroinformatics/form-types';
import { Button, formatFormDataAsString, resolveStaticFormFields } from '@douglasneuroinformatics/ui';
import type { FormInstrument } from '@open-data-capture/types';
import { useTranslation } from 'react-i18next';

import { Spinner } from '@/components/Spinner';
import { useDownload } from '@/hooks/useDownload';
import { useActiveVisitStore } from '@/stores/active-visit-store';

const FormSummaryItem = ({ label, value }: { label: string; value: unknown }) => {
  return (
    <div className="my-1">
      <span className="font-semibold">{label}: </span>
      <span>{JSON.stringify(value)}</span>
    </div>
  );
};

export type FormSummaryProps<T extends FormInstrumentData> = {
  instrument: FormInstrument<T>;
  result?: T;
  timeCollected: number;
};

export const FormSummary = <T extends FormInstrumentData>({
  instrument,
  result,
  timeCollected
}: FormSummaryProps<T>) => {
  const { activeVisit } = useActiveVisitStore();
  const download = useDownload();
  const { i18n, t } = useTranslation();

  if (!result) {
    return <Spinner />;
  }

  const downloadResult = () => {
    const filename = `${instrument.name}_v${instrument.version}_${new Date(timeCollected).toISOString()}.txt`;
    download(filename, () => Promise.resolve(formatFormDataAsString(result)));
  };

  const formFields = useMemo(
    () => resolveStaticFormFields(instrument.content, result as NullableFormInstrumentData<T>),
    [instrument, result]
  );

  return (
    <div>
      <h3 className="my-3 text-xl font-semibold">{t('instruments.formPage.summary.subject')}</h3>
      <FormSummaryItem
        label={t('instruments.formPage.summary.name')}
        value={`${activeVisit!.subject.firstName} ${activeVisit!.subject.lastName}`}
      />
      <FormSummaryItem label={t('instruments.formPage.summary.dateOfBirth')} value={activeVisit?.subject.dateOfBirth} />
      <FormSummaryItem label={t('instruments.formPage.summary.sex')} value={activeVisit?.subject.sex} />
      <h3 className="my-3 text-xl font-semibold">{t('instruments.formPage.summary.metadata')}</h3>
      <FormSummaryItem label={t('instruments.formPage.summary.instrumentTitle')} value={instrument.details.title} />
      <FormSummaryItem label={t('instruments.formPage.summary.instrumentVersion')} value={instrument.version} />
      <FormSummaryItem
        label={t('instruments.formPage.summary.timeCollected')}
        value={new Date(timeCollected).toLocaleString(i18n.resolvedLanguage)}
      />
      <h3 className="my-3 text-xl font-semibold">{t('instruments.formPage.summary.results')}</h3>
      <div className="mb-3">
        {Object.keys(result).map((fieldName) => {
          const field = formFields[fieldName];
          if (!field) {
            return null;
          }
          return <FormSummaryItem key={fieldName} label={field.label} value={result[fieldName]} />;
        })}
      </div>
      <div className="flex gap-3 print:hidden">
        <Button
          label={t('instruments.formPage.summary.print')}
          onClick={() => {
            print();
          }}
        />
        <Button label={t('instruments.formPage.summary.download')} onClick={downloadResult} />
      </div>
    </div>
  );
};
