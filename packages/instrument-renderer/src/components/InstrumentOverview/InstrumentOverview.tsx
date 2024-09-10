import { Button, Heading, Tooltip } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { licenses } from '@opendatacapture/licenses';
import type { AnyUnilingualInstrument } from '@opendatacapture/runtime-core';
import { BadgeAlertIcon, BadgeCheckIcon } from 'lucide-react';

export type InstrumentOverviewProps = {
  instrument: AnyUnilingualInstrument;
  onNext: () => void;
};

export const InstrumentOverview = ({ instrument, onNext }: InstrumentOverviewProps) => {
  const { t } = useTranslation();

  let language: string;
  if (instrument.language === 'en') {
    language = t({
      en: 'English',
      fr: 'Anglais'
    });
  } else if (instrument.language === 'fr') {
    language = t({
      en: 'French',
      fr: 'Français'
    });
  } else {
    language = instrument.language;
  }

  const license = licenses.get(instrument.details.license);

  return (
    <div className="space-y-6">
      <Heading variant="h4">{instrument.details.title}</Heading>
      <div className="mb-8 space-y-6">
        <div>
          <Heading variant="h5">
            {t({
              en: 'Description',
              fr: 'Description'
            })}
          </Heading>
          <p className="text-muted-foreground text-sm">{instrument.details.description}</p>
        </div>
        <div>
          <Heading variant="h5">
            {t({
              en: 'Language',
              fr: 'Langue'
            })}
          </Heading>
          <p className="text-muted-foreground text-sm">{language}</p>
        </div>
        {instrument.details.authors && (
          <div>
            <Heading variant="h5">
              {t({
                en: 'Authors',
                fr: 'Auteurs'
              })}
            </Heading>
            <p className="text-muted-foreground text-sm">{instrument.details.authors.join(', ')}</p>
          </div>
        )}
        <div>
          <Heading variant="h5">
            {t({
              en: 'License',
              fr: 'Licence'
            })}
          </Heading>
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
                <p>
                  {license?.isOpenSource
                    ? t({
                        en: 'This is a free and open-source license',
                        fr: "Il s'agit d'une licence libre"
                      })
                    : t({
                        en: 'This is not a free and open source license',
                        fr: "Il ne s'agit pas d'une licence libre"
                      })}
                </p>
              </Tooltip.Content>
            </Tooltip>
          </div>
        </div>
        <div>
          {instrument.details.estimatedDuration && (
            <>
              <Heading variant="h5">
                {t({
                  en: 'Estimated Duration',
                  fr: 'Durée estimée'
                })}
              </Heading>
              <p className="text-muted-foreground text-sm">{`${instrument.details.estimatedDuration} minute(s)`}</p>
            </>
          )}
        </div>
        {Boolean(instrument.details.instructions?.length) && (
          <div>
            <Heading variant="h5">
              {t({
                en: 'Instructions',
                fr: 'Instructions'
              })}
            </Heading>
            <p className="text-muted-foreground text-sm">{instrument.details.instructions!.join(', ')}</p>
          </div>
        )}
        {instrument.details.referenceUrl && (
          <div>
            <Heading variant="h5">
              {t({
                en: 'Reference Link',
                fr: 'Lien vers la référence'
              })}
            </Heading>
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
            <Heading variant="h5">
              {t({
                en: 'Source Link',
                fr: 'Lien vers le code source'
              })}
            </Heading>
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
        label={t({
          en: 'Begin',
          fr: 'Commencer'
        })}
        onClick={() => {
          onNext();
        }}
      />
    </div>
  );
};
