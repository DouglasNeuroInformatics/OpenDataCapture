import type { FormDataType } from '@douglasneuroinformatics/form-types';
import { Spinner, formatFormDataAsString, useDownload } from '@douglasneuroinformatics/ui';
import type { Language } from '@open-data-capture/common/core';
import type { FormInstrument } from '@open-data-capture/common/instrument';
import { useTranslation } from 'react-i18next';

import { FormRecordList } from '@/components/FormRecordList';
import { useActiveVisitStore } from '@/stores/active-visit-store';

export type FormSummaryProps = {
  form: FormInstrument<FormDataType, Language>;
  result: FormDataType;
  timeCollected: number;
};

export const FormSummary = ({ form, result, timeCollected }: FormSummaryProps) => {
  const { activeVisit } = useActiveVisitStore();
  const download = useDownload();
  const { i18n, t } = useTranslation();

  if (!result) {
    return <Spinner />;
  }

  const downloadResult = () => {
    const filename = `${form.name}_v${form.version}_${new Date(timeCollected).toISOString()}.txt`;
    download(filename, () => Promise.resolve(formatFormDataAsString(result)));
  };

  return <FormRecordList />;

  // return (
  //   <div>
  //     <h3 className="my-3 text-xl font-semibold">{t('instruments.formPage.summary.subject')}</h3>
  //     <FormSummaryItem
  //       label={t('instruments.formPage.summary.name')}
  //       value={`${activeVisit!.subject.firstName} ${activeVisit!.subject.lastName}`}
  //     />
  //     <FormSummaryItem label={t('instruments.formPage.summary.dateOfBirth')} value={activeVisit?.subject.dateOfBirth} />
  //     <FormSummaryItem label={t('instruments.formPage.summary.sex')} value={activeVisit?.subject.sex} />
  //     <h3 className="my-3 text-xl font-semibold">{t('instruments.formPage.summary.metadata')}</h3>
  //     <FormSummaryItem label={t('instruments.formPage.summary.instrumentTitle')} value={instrument.details.title} />
  //     <FormSummaryItem label={t('instruments.formPage.summary.instrumentVersion')} value={instrument.version} />
  //     <FormSummaryItem
  //       label={t('instruments.formPage.summary.timeCollected')}
  //       value={new Date(timeCollected).toLocaleString(i18n.resolvedLanguage)}
  //     />
  //     <h3 className="my-3 text-xl font-semibold">{t('instruments.formPage.summary.results')}</h3>
  //     <div className="mb-3">
  //       {Object.keys(result).map((fieldName) => {
  //         const field = formFields[fieldName];
  //         if (!field) {
  //           return null;
  //         }
  //         return <FormSummaryItem key={fieldName} label={field.label} value={result[fieldName]} />;
  //       })}
  //     </div>
  //     <div className="flex gap-3 print:hidden">
  //       <Button
  //         label={t('instruments.formPage.summary.print')}
  //         onClick={() => {
  //           print();
  //         }}
  //       />
  //       <Button label={t('instruments.formPage.summary.download')} onClick={downloadResult} />
  //     </div>
  //   </div>
  // );
};
