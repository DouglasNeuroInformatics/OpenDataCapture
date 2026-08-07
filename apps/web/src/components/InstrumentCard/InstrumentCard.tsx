import React from 'react';

import { Card, Heading, Tooltip } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { cn } from '@douglasneuroinformatics/libui/utils';
import { licenses } from '@opendatacapture/licenses';
import { InstrumentIcon } from '@opendatacapture/react-core';
import type { TranslatedInstrumentInfo } from '@opendatacapture/schemas/instrument';
import { BadgeAlertIcon, BadgeCheckIcon } from 'lucide-react';

type BaseCardItem = { label: string; tooltip?: React.ReactNode };

type LinkCardItem = BaseCardItem & { href?: null | string; kind: 'link' };

type TextCardItem = BaseCardItem & { kind: 'text'; text?: string };

type CardItem = LinkCardItem | TextCardItem;

type InstrumentCardProps = {
  highlighted?: boolean;
  instrument: TranslatedInstrumentInfo;
  onClick: () => void;
};

export const InstrumentCard = ({ highlighted, instrument, onClick }: InstrumentCardProps) => {
  const { t } = useTranslation();

  const license = licenses.get(instrument.details.license);

  const content: CardItem[] = [
    {
      kind: 'text',
      label: t({
        en: 'Authors',
        es: 'Autores',
        fr: 'Auteurs'
      }),
      text: instrument.details.authors?.join(', ')
    },
    {
      kind: 'text',
      label: t({
        en: 'Description',
        es: 'Descripción',
        fr: 'Description'
      }),
      text: instrument.details.description
    },
    {
      kind: 'text',
      label: t({
        en: 'Edition',
        es: 'Edición',
        fr: 'Édition'
      }),
      text: instrument.kind === 'SERIES' ? undefined : instrument.internal.edition.toString()
    },
    {
      kind: 'text',
      label: t({
        en: 'Languages',
        es: 'Idiomas',
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
        es: 'Licencia',
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
                    es: 'Esta es una licencia libre y de código abierto',
                    fr: "Il s'agit d'une licence libre"
                  })
                : t({
                    en: 'This is not a free and open source license',
                    es: 'Esta no es una licencia libre y de código abierto',
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
        es: 'Enlace de referencia',
        fr: 'Lien vers la référence'
      })
    },
    {
      href: instrument.details.sourceUrl,
      kind: 'link',
      label: t({
        en: 'Source Link',
        es: 'Enlace al código fuente',
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
      className={cn(
        'group flex gap-8 p-6 transition-transform duration-300 ease-in-out hover:scale-[1.03] hover:cursor-pointer sm:p-8',
        highlighted && 'bg-sky-100/60 ring-2 ring-sky-500/60 dark:bg-sky-900/30'
      )}
      data-testid={`instrument-card-${instrument.id}`}
      role="button"
      tabIndex={-1}
      onClick={onClick}
    >
      <div className="hidden shrink-0 items-center justify-center sm:flex md:min-w-24 lg:min-w-32">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-500">
          <InstrumentIcon className="rounded-full" kind={instrument.kind} style={{ height: 'auto', width: '32px' }} />
        </div>
      </div>
      <div className="col-span-6 flex grow flex-col gap-2">
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
                  <span className="font-medium">{item.label + t({ en: ': ', es: ': ', fr: ' : ' })}</span>
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
