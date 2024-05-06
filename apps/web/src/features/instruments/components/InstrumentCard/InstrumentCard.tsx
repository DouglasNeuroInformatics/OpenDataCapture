import React from 'react';

import { Card } from '@douglasneuroinformatics/libui/components';
import { InstrumentIcon } from '@opendatacapture/react-core';
import type { UnilingualInstrumentSummary } from '@opendatacapture/schemas/instrument';
import { useTranslation } from 'react-i18next';

export type InstrumentCardProps = {
  instrument: UnilingualInstrumentSummary;
  onClick: () => void;
};

export const InstrumentCard = ({ instrument, onClick }: InstrumentCardProps) => {
  const { t } = useTranslation();

  return (
    <Card
      className="relative flex flex-col p-8 transition-all  duration-300 ease-in-out hover:scale-[1.03] hover:cursor-pointer sm:flex-row"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={onClick}
    >
      <div className="mb-4 inline-flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-500 sm:mb-0 sm:mr-8">
        <InstrumentIcon className="rounded-full" kind={instrument.kind} style={{ height: 'auto', width: '32px' }} />
      </div>
      <div className="flex-grow">
        <h3
          className="title-font mb-1 text-lg font-semibold text-slate-900 dark:text-slate-100"
          data-cy="instrument-title"
        >
          {instrument.details.title}
        </h3>
        <h5 className="mb-2 text-slate-700 dark:text-slate-300" data-cy="instrument-card">
          {`${t('tags')}: ${instrument.tags.join(', ')}`}
        </h5>
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{instrument.details.description}</p>
      </div>
    </Card>
  );
};
