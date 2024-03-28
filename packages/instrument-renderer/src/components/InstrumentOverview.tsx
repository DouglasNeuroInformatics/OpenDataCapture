import React from 'react';

import { Button, Popover } from '@douglasneuroinformatics/libui/components';
import { useLegacyStepper } from '@douglasneuroinformatics/libui/hooks';
import { cn } from '@douglasneuroinformatics/libui/utils';
import { ShieldCheckIcon, ShieldExclamationIcon } from '@heroicons/react/24/solid';
import { licenses } from '@opendatacapture/licenses';
import type { AnyUnilingualInstrument } from '@opendatacapture/schemas/instrument';
import { useTranslation } from 'react-i18next';

import { InstrumentOverviewItem } from './InstrumentOverviewItem';

type InstrumentOverviewProps = {
  instrument: AnyUnilingualInstrument;
  onNext?: () => void;
};

export const InstrumentOverview = ({ instrument }: InstrumentOverviewProps) => {
  const { t } = useTranslation('core');
  const { updateIndex } = useLegacyStepper();

  let language: string;
  if (instrument.language === 'en') {
    language = t('languages.english');
  } else if (instrument.language === 'fr') {
    language = t('languages.french');
  } else {
    language = instrument.language;
  }

  const license = licenses.get(instrument.details.license);

  return (
    <div className="mb-2">
      <h3 className="text-xl font-semibold">{t('steps.overview')}</h3>
      <div className="mb-8">
        <InstrumentOverviewItem heading={t('description')} text={instrument.details.description} />
        <InstrumentOverviewItem heading={t('language')} text={language} />
        {instrument.details.authors && (
          <InstrumentOverviewItem heading={t('authors')} text={instrument.details.authors.join(', ') ?? 'NA'} />
        )}
        <InstrumentOverviewItem
          afterText={
            <Popover>
              <Popover.Trigger asChild>
                <Button
                  className={cn(license?.isOpenSource ? 'text-sky-700' : 'text-red-500')}
                  size="icon"
                  variant="ghost"
                >
                  {license?.isOpenSource ? (
                    <ShieldCheckIcon className="h-5 w-5" />
                  ) : (
                    <ShieldExclamationIcon className="h-5 w-5" />
                  )}
                </Button>
              </Popover.Trigger>
              <Popover.Content className="w-min whitespace-nowrap p-1.5 text-sm">
                {license?.isOpenSource ? t('openSourceLicense') : t('proprietaryLicense')}
              </Popover.Content>
            </Popover>
          }
          heading={t('license')}
          text={license?.name ?? 'NA'}
        />
        <InstrumentOverviewItem
          heading={t('estimatedDuration')}
          text={t('minutes', {
            minutes: instrument.details.estimatedDuration
          })}
        />
        <InstrumentOverviewItem heading={t('instructions')} text={instrument.details.instructions} />
        {instrument.details.referenceUrl && (
          <InstrumentOverviewItem heading={t('referenceLink')} kind="link" text={instrument.details.referenceUrl} />
        )}
        {instrument.details.sourceUrl && (
          <InstrumentOverviewItem heading={t('sourceLink')} kind="link" text={instrument.details.sourceUrl} />
        )}
      </div>
      <Button
        className="w-full"
        label={t('begin')}
        onClick={() => {
          updateIndex('increment');
        }}
      />
    </div>
  );
};
