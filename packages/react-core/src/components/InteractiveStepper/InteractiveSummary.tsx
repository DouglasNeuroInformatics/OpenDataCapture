import { Card, useDownload } from '@douglasneuroinformatics/ui';
import { ArrowDownTrayIcon, PrinterIcon } from '@heroicons/react/24/outline';
import type { Json, Language } from '@open-data-capture/common/core';
import type { InteractiveInstrument } from '@open-data-capture/common/instrument';
import type { Subject } from '@open-data-capture/common/subject';
import { useTranslation } from 'react-i18next';

export type InteractiveSummaryProps = {
  data: unknown;
  instrument: InteractiveInstrument<Json, Language>;
  subject?: Pick<Subject, 'dateOfBirth' | 'firstName' | 'identifier' | 'lastName' | 'sex'>;
  timeCollected: number;
};

export const InteractiveSummary = ({ data, instrument, timeCollected }: InteractiveSummaryProps) => {
  const download = useDownload();
  const { i18n, t } = useTranslation('core');

  const handleDownload = () => {
    const filename = `${instrument.name}_v${instrument.version}_${new Date(timeCollected).toISOString()}.json`;
    void download(filename, () => JSON.stringify(data, null, 2));
  };

  return (
    <Card>
      <div className="border-b px-4 py-5 sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-slate-900 dark:text-slate-100">
          {t('summary.title', { title: instrument.details.title })}
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
          <div className="flex justify-end gap-4 text-slate-600 print:hidden dark:text-slate-300">
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
      <div className="px-4 py-5 sm:px-6">
        <h5 className="mb-2 font-medium">{t('data')}</h5>
        {JSON.stringify(data, null, 2)}
      </div>
    </Card>
  );
};
