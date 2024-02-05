import { useContext } from 'react';

import { Button, StepperContext } from '@douglasneuroinformatics/ui';
import type { AnyUnilingualInstrument } from '@open-data-capture/common/instrument';
import { licenses } from '@open-data-capture/licenses';
import { useTranslation } from 'react-i18next';

import { InstrumentOverviewItem } from './InstrumentOverviewItem';

type InstrumentOverviewProps = {
  instrument: AnyUnilingualInstrument;
  onNext?: () => void;
};

export const InstrumentOverview = ({ instrument }: InstrumentOverviewProps) => {
  const { t } = useTranslation('core');
  const { updateIndex } = useContext(StepperContext);

  let language: string;
  if (instrument.language === 'en') {
    language = t('languages.english');
  } else if (instrument.language === 'fr') {
    language = t('languages.french');
  } else {
    language = instrument.language;
  }

  const license = licenses.get(instrument.details.license);

  instrument.details.referenceUrl;

  return (
    <div className="mb-2">
      <h3 className="text-xl font-semibold">{t('steps.overview')}</h3>
      <div className="mb-8">
        <InstrumentOverviewItem heading={t('description')} text={instrument.details.description} />
        <InstrumentOverviewItem heading={t('language')} text={language} />
        <InstrumentOverviewItem heading={t('authors')} text={instrument.details.authors ?? 'NA'} />
        <InstrumentOverviewItem heading={t('license')} text={license?.name ?? 'NA'} />
        <InstrumentOverviewItem
          heading={t('estimatedDuration')}
          text={t('minutes', {
            minutes: instrument.details.estimatedDuration
          })}
        />
        <InstrumentOverviewItem heading={t('instructions')} text={instrument.details.instructions} />
        {instrument.details.referenceUrl && (
          <InstrumentOverviewItem heading={t('referenceLink')} text={instrument.details.referenceUrl} />
        )}
        {instrument.details.sourceUrl && (
          <InstrumentOverviewItem heading={t('sourceLink')} text={instrument.details.sourceUrl} />
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
