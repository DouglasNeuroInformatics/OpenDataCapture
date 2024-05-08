import React from 'react';

import { Button, Heading, Tooltip } from '@douglasneuroinformatics/libui/components';
import { licenses } from '@opendatacapture/licenses';
import type { AnyUnilingualInstrument } from '@opendatacapture/schemas/instrument';
import { BadgeAlertIcon, BadgeCheckIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export type InstrumentOverviewProps = {
  instrument: Omit<AnyUnilingualInstrument, 'content' | 'measures' | 'validationSchema'>;
  onNext: () => void;
};

export const InstrumentOverview = ({ instrument, onNext }: InstrumentOverviewProps) => {
  const { t } = useTranslation('core');

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
    <div className="space-y-6">
      <Heading variant="h4">{instrument.details.title}</Heading>
      <div className="mb-8 space-y-6">
        <div>
          <Heading variant="h5">{t('description')}</Heading>
          <p className="text-muted-foreground text-sm">{instrument.details.description}</p>
        </div>
        <div>
          <Heading variant="h5">{t('language')}</Heading>
          <p className="text-muted-foreground text-sm">{language}</p>
        </div>
        {instrument.details.authors && (
          <div>
            <Heading variant="h5">{t('authors')}</Heading>
            <p className="text-muted-foreground text-sm">{instrument.details.authors.join(', ')}</p>
          </div>
        )}
        <div>
          <Heading variant="h5">{t('license')}</Heading>
          <div className="flex items-center">
            <p className="text-muted-foreground text-sm">{license?.name ?? 'NA'}</p>&nbsp;
            <Tooltip>
              <Tooltip.Trigger className="p-1" size="icon" variant="ghost">
                {license?.isOpenSource ? (
                  <BadgeCheckIcon className="fill-green-600 stroke-white" />
                ) : (
                  <BadgeAlertIcon className="fill-red-600 stroke-white" />
                )}
              </Tooltip.Trigger>
              <Tooltip.Content>
                <p>{license?.isOpenSource ? t('openSourceLicense') : t('proprietaryLicense')}</p>
              </Tooltip.Content>
            </Tooltip>
          </div>
        </div>
        <div>
          <Heading variant="h5">{t('estimatedDuration')}</Heading>
          <p className="text-muted-foreground text-sm">
            {t('minutes', {
              minutes: instrument.details.estimatedDuration
            })}
          </p>
        </div>
        {Boolean(instrument.details.instructions?.length) && (
          <div>
            <Heading variant="h5">{t('instructions')}</Heading>
            <p className="text-muted-foreground text-sm">{instrument.details.instructions!.join(', ')}</p>
          </div>
        )}
        {instrument.details.referenceUrl && (
          <div>
            <Heading variant="h5">{t('referenceLink')}</Heading>
            <a
              className="text-muted-foreground hover:text-foreground text-sm underline underline-offset-1"
              href={instrument.details.referenceUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              {instrument.details.referenceUrl}
            </a>
          </div>
        )}
        {instrument.details.sourceUrl && (
          <div>
            <Heading variant="h5">{t('sourceLink')}</Heading>
            <a
              className="text-muted-foreground hover:text-foreground text-sm underline underline-offset-1"
              href={instrument.details.sourceUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              {instrument.details.sourceUrl}
            </a>
          </div>
        )}
      </div>
      <Button
        className="w-full"
        label={t('begin')}
        onClick={() => {
          onNext();
        }}
      />
    </div>
  );
};
