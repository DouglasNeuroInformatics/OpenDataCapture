import { Card, useDownload } from '@douglasneuroinformatics/ui';
import { toBasicISOString } from '@douglasneuroinformatics/utils';
import { ArrowDownTrayIcon, PrinterIcon } from '@heroicons/react/24/outline';
import { toLowerCase } from '@open-data-capture/common/core';
import type { InstrumentKind, SomeUnilingualInstrument } from '@open-data-capture/common/instrument';
import type { Subject } from '@open-data-capture/common/subject';
import { computeInstrumentMeasures } from '@open-data-capture/instrument-utils';
import { useTranslation } from 'react-i18next';

import { InstrumentSummaryGroup } from './InstrumentSummaryGroup';

export type InstrumentSummaryProps<TKind extends InstrumentKind> = {
  data: any;
  instrument: SomeUnilingualInstrument<TKind>;
  subject?: Pick<Subject, 'dateOfBirth' | 'firstName' | 'id' | 'lastName' | 'sex'>;
  timeCollected: number;
};

export const InstrumentSummary = <TKind extends InstrumentKind>({
  data,
  instrument,
  subject,
  timeCollected
}: InstrumentSummaryProps<TKind>) => {
  const download = useDownload();
  const { i18n, t } = useTranslation('core');

  const computedMeasures = computeInstrumentMeasures(instrument, data);

  const handleDownload = () => {
    const filename = `${instrument.name}_v${instrument.version}_${new Date(timeCollected).toISOString()}.json`;
    void download(filename, () => JSON.stringify(data, null, 2));
  };

  let language: string;
  if (instrument.language === 'en') {
    language = t('languages.english');
  } else if (instrument.language === 'fr') {
    language = t('languages.french');
  } else {
    language = instrument.language;
  }

  return (
    <Card>
      <div className="border-b px-4 py-5 sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-slate-900 dark:text-slate-100">
          {t('summary.title', { title: instrument.details.title })}
        </h3>
        <div className="mt-1 grid grid-cols-3">
          <p className="col-span-2 text-sm text-slate-700 dark:text-slate-300">
            {t('summary.subtitle', {
              dateCompleted: new Date().toLocaleString(i18n.resolvedLanguage, {
                dateStyle: 'long',
                timeStyle: 'long'
              })
            })}
          </p>
          <div className="flex justify-end gap-4 text-slate-700 dark:text-slate-300 print:hidden">
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
      {subject && (
        <InstrumentSummaryGroup
          items={[
            {
              label: t('fullName'),
              value:
                subject?.firstName && subject.lastName ? `${subject.firstName} ${subject.lastName}` : t('anonymous')
            },
            {
              label: t('identificationData.dateOfBirth.label'),
              value: toBasicISOString(subject.dateOfBirth)
            },
            {
              label: t('identificationData.sex.label'),
              value: t(`identificationData.sex.${toLowerCase(subject.sex)}`)
            }
          ]}
          title={t('subject')}
        />
      )}
      <InstrumentSummaryGroup
        items={[
          {
            label: t('title'),
            value: instrument.details.title
          },
          {
            label: t('language'),
            value: language
          },
          {
            label: t('version'),
            value: instrument.version
          }
        ]}
        title={t('instrument')}
      />
      <InstrumentSummaryGroup items={Object.values(computedMeasures)} title={t('responses')} />
    </Card>
  );
};
