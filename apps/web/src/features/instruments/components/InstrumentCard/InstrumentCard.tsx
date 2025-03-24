import { Card, Heading, Tooltip } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { licenses } from '@opendatacapture/licenses';
import { InstrumentIcon } from '@opendatacapture/react-core';
import type { TranslatedInstrumentInfo } from '@opendatacapture/schemas/instrument';
import { BadgeAlertIcon, BadgeCheckIcon } from 'lucide-react';

type BaseCardItem = { label: string; tooltip?: React.ReactNode };

type LinkCardItem = BaseCardItem & { href?: null | string; kind: 'link' };

type TextCardItem = BaseCardItem & { kind: 'text'; text?: string };

type CardItem = LinkCardItem | TextCardItem;

export type InstrumentCardProps = {
  instrument: TranslatedInstrumentInfo;
  onClick: () => void;
};

export const InstrumentCard = ({ instrument, onClick }: InstrumentCardProps) => {
  const { t } = useTranslation();

  const license = licenses.get(instrument.details.license);

  const content: CardItem[] = [
    {
      kind: 'text',
      label: t({
        en: 'Authors',
        fr: 'Auteurs'
      }),
      text: instrument.details.authors?.join(', ')
    },
    {
      kind: 'text',
      label: t({
        en: 'Description',
        fr: 'Description'
      }),
      text: instrument.details.description
    },
    {
      kind: 'text',
      label: t({
        en: 'Edition',
        fr: 'Édition'
      }),
      text: instrument.internal?.edition.toString()
    },
    {
      kind: 'text',
      label: t({
        en: 'Languages',
        fr: 'Langues'
      }),
      text: instrument.supportedLanguages
        .map((language) => {
          switch (language) {
            case 'en':
              return 'English';
            case 'fr':
              return 'Français';
          }
        })
        .join(', ')
    },
    {
      kind: 'text',
      label: t({
        en: 'License',
        fr: 'Licence'
      }),
      text: license?.name ?? 'NA',
      tooltip: (
        <Tooltip>
          <Tooltip.Trigger className="p-0 hover:bg-transparent" size="icon" variant="ghost">
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
      )
    },
    {
      href: instrument.details.referenceUrl,
      kind: 'link',
      label: t({
        en: 'Reference Link',
        fr: 'Lien vers la référence'
      })
    },
    {
      href: instrument.details.sourceUrl,
      kind: 'link',
      label: t({
        en: 'Source Link',
        fr: 'Lien vers le code source'
      })
    },
    {
      kind: 'text',
      label: 'Tags',
      text: instrument.tags.join(', ')
    }
  ];

  return (
    <Card
      className="group flex gap-8 p-6 transition-transform duration-300 ease-in-out hover:scale-[1.03] hover:cursor-pointer sm:p-8"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={onClick}
    >
      <div className="hidden flex-shrink-0 items-center justify-center sm:flex md:min-w-24 lg:min-w-32">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-500">
          <InstrumentIcon className="rounded-full" kind={instrument.kind} style={{ height: 'auto', width: '32px' }} />
        </div>
      </div>
      <div className="col-span-6 flex flex-grow flex-col gap-2">
        <Heading variant="h4">{instrument.details.title}</Heading>
        <div className="flex flex-col gap-2 text-sm tracking-tight">
          {content.map((item) => {
            if (item.kind === 'link' && !item.href) {
              return null;
            } else if (item.kind === 'text' && !item.text) {
              return null;
            }
            return (
              <div className="flex items-center gap-1" key={item.label}>
                <p className="line-clamp-3 leading-tight">
                  <span className="font-medium">{item.label + t({ en: ': ', fr: ' : ' })}</span>
                  {item.kind === 'text' && <span className="text-muted-foreground">{item.text}</span>}
                  {item.kind === 'link' && (
                    <a
                      className="text-muted-foreground underline-offset-1 hover:underline"
                      href={item.href!}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {item.href}
                    </a>
                  )}
                </p>
                {item.tooltip}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};
