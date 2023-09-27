import type { BaseFormField, FormInstrumentData } from '@douglasneuroinformatics/form-types';
import { Button } from '@douglasneuroinformatics/ui';
import type { FormInstrument } from '@open-data-capture/types';
import { useTranslation } from 'react-i18next';

import { Spinner } from '@/components';
import { useDownload } from '@/hooks/useDownload';
import { useActiveSubjectStore } from '@/stores/active-subject-store';
import { formatDataAsString } from '@/utils/form-utils';

const FormSummaryItem = ({ label, value }: { label: string; value: any }) => {
  return (
    <div className="my-1">
      <span className="font-semibold">{label}: </span>
      <span>{String(value)}</span>
    </div>
  );
};

export type FormSummaryProps<T extends FormInstrumentData> = {
  instrument: FormInstrument<T>;
  result?: T;
  timeCollected: number;
};

export const FormSummary = <T extends FormInstrumentData>({
  timeCollected,
  instrument,
  result
}: FormSummaryProps<T>) => {
  const { activeSubject } = useActiveSubjectStore();
  const download = useDownload();
  const { i18n, t } = useTranslation();

  if (!result) {
    return <Spinner />;
  }

  const downloadResult = () => {
    const filename = `${instrument.name}_v${instrument.version}_${new Date(timeCollected).toISOString()}.txt`;
    download(filename, () => Promise.resolve(formatDataAsString(result)));
  };

  return (
    <div>
      <h3 className="my-3 text-xl font-semibold">{t('instruments.formPage.summary.subject')}</h3>
      <FormSummaryItem
        label={t('instruments.formPage.summary.name')}
        value={`${activeSubject!.firstName} ${activeSubject!.lastName}`}
      />
      <FormSummaryItem label={t('instruments.formPage.summary.dateOfBirth')} value={activeSubject?.dateOfBirth} />
      <FormSummaryItem label={t('instruments.formPage.summary.sex')} value={activeSubject?.sex} />
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
          let field: BaseFormField;
          if (instrument.content instanceof Array) {
            field = instrument.content
              .map((group) => group.fields)
              .reduce((prev, current) => ({ ...prev, ...current }))[fieldName]!;
          } else {
            field = instrument.content[fieldName]!;
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
