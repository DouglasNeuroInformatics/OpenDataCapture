import { Card, Heading, Tooltip } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { Language } from '@douglasneuroinformatics/libui/i18n';
import { licenses } from '@opendatacapture/licenses';
import { InstrumentIcon } from '@opendatacapture/react-core';
import type { UnilingualInstrumentInfo } from '@opendatacapture/schemas/instrument';
import { BadgeAlertIcon, BadgeCheckIcon } from 'lucide-react';

export type InstrumentCardProps = {
  instrument: UnilingualInstrumentInfo & {
    supportedLanguages: Language[];
  };
  onClick: () => void;
};

export const InstrumentCard = ({ instrument, onClick }: InstrumentCardProps) => {
  const { t } = useTranslation();

  const license = licenses.get(instrument.details.license);

  return (
    <Card
      className="relative flex flex-col p-8 transition-all duration-300 ease-in-out hover:scale-[1.03] hover:cursor-pointer sm:flex-row"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={onClick}
    >
      <div className="mb-4 inline-flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-500 sm:mb-0 sm:mr-8">
        <InstrumentIcon className="rounded-full" kind={instrument.kind} style={{ height: 'auto', width: '32px' }} />
      </div>
      <div className="flex-grow">
        <Heading
          className="title-font mb-0.5 font-semibold text-slate-900 dark:text-slate-100"
          data-cy="instrument-card-title"
          variant="h4"
        >
          {instrument.details.title}
        </Heading>
        <div className="text-muted-foreground mb-2 flex flex-col text-sm">
          {instrument.details.authors && (
            <span>{`${t({ en: 'Authors:', fr: 'Auteurs :' })} ${instrument.details.authors.join(', ')}`}</span>
          )}
          <span data-cy="instrument-card-tags">
            {`${t({ en: 'Tags:', fr: 'Tags :' })} ${instrument.tags.join(', ')}`}
          </span>
          <span>
            {`${t({
              en: 'Supported Languages: ',
              fr: 'Langues disponibles :'
            })} ${instrument.supportedLanguages
              .map((language) => {
                switch (language) {
                  case 'en':
                    return 'English';
                  case 'fr':
                    return 'Français';
                }
              })
              .join(', ')}`}
          </span>
          <div className="flex items-center">
            <span className="text-muted-foreground text-sm">
              {t({
                en: 'License: ',
                fr: 'Licence : '
              }) + (license?.name ?? 'NA')}
            </span>
            &nbsp;
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
          {instrument.details.referenceUrl && (
            <div className="flex items-center">
              <span>
                {t({
                  en: 'Reference Link: ',
                  fr: 'Lien vers la référence : '
                })}
              </span>
              &nbsp;
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
            <div className="flex items-center">
              <span>
                {t({
                  en: 'Source Link',
                  fr: 'Lien vers le code source'
                })}
              </span>
              &nbsp;
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
        <div className="flex items-center"></div>
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{instrument.details.description}</p>
      </div>
    </Card>
  );
};
