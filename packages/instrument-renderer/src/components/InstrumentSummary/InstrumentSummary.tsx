import React from 'react';

import { toBasicISOString, toLowerCase } from '@douglasneuroinformatics/libjs';
import { Button, Heading, Separator } from '@douglasneuroinformatics/libui/components';
import { useDownload } from '@douglasneuroinformatics/libui/hooks';
import { computeInstrumentMeasures } from '@opendatacapture/instrument-utils';
import { CopyButton } from '@opendatacapture/react-core';
import type { InstrumentKind, SomeUnilingualInstrument } from '@opendatacapture/schemas/instrument';
import type { Subject } from '@opendatacapture/schemas/subject';
import { filter } from 'lodash-es';
import { DownloadIcon, PrinterIcon } from 'lucide-react';
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

  const computedMeasures = filter(computeInstrumentMeasures(instrument, data), (_, key) => {
    return !instrument.measures?.[key].hidden;
  });

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

  const copyText = Object.values(computedMeasures)
    .map(({ label, value }) => `${label}: ${value?.toString() ?? 'NA'}`)
    .join('\n');

  const results = Object.values(computedMeasures);

  return (
    <div className="print:bg-primary-foreground space-y-6 print:fixed print:left-0 print:top-0 print:z-50 print:h-screen print:w-screen">
      <div className="flex">
        <div className="flex-grow">
          <Heading variant="h4">
            {instrument.details.title.trim()
              ? t('summary.title', { title: instrument.details.title })
              : t('summary.titleFallback')}
          </Heading>
          <p className="text-muted-foreground text-sm">
            {t('summary.subtitle', {
              dateCompleted: new Date().toLocaleString(i18n.resolvedLanguage, {
                dateStyle: 'long',
                timeStyle: 'long'
              })
            })}
          </p>
        </div>
        <div className="hidden sm:flex sm:items-center sm:gap-1 print:hidden">
          <CopyButton text={copyText} variant="ghost" />
          <Button size="icon" type="button" variant="ghost" onClick={handleDownload}>
            <DownloadIcon />
          </Button>
          <Button size="icon" type="button" variant="ghost" onClick={print}>
            <PrinterIcon />
          </Button>
        </div>
      </div>
      <Separator />
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
      {results.length > 0 && <InstrumentSummaryGroup items={results} title={t('results')} />}
    </div>
  );
};
