import type { FormDataType } from '@douglasneuroinformatics/form-types';
import { formatFormDataAsString, useDownload } from '@douglasneuroinformatics/ui';
import type { Language } from '@open-data-capture/common/core';
import type { FormInstrument } from '@open-data-capture/common/instrument';
import type { Visit } from '@open-data-capture/common/visit';
import { useTranslation } from 'react-i18next';

import { FormRecordList } from './FormRecordList';

export type FormSummaryProps = {
  activeVisit: Visit;
  form: FormInstrument<FormDataType, Language>;
  result: FormDataType;
  timeCollected: number;
};

export const FormSummary = ({ activeVisit, form, result, timeCollected }: FormSummaryProps) => {
  const download = useDownload();
  const { i18n, t } = useTranslation();

  const downloadResult = () => {
    const filename = `${form.name}_v${form.version}_${new Date(timeCollected).toISOString()}.txt`;
    download(filename, () => Promise.resolve(formatFormDataAsString(result)));
  };

  return <FormRecordList form={form} subject={activeVisit.subject} />;

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
