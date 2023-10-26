import type { UnilingualFormInstrumentSummary } from '@open-data-capture/types';
import { useTranslation } from 'react-i18next';

import { InstrumentIcon } from './InstrumentIcon';

export type InstrumentCardProps = {
  instrument: UnilingualFormInstrumentSummary;
  onClick: () => void;
};

export const InstrumentCard = ({ instrument, onClick }: InstrumentCardProps) => {
  const { t } = useTranslation();

  return (
    <div
      className="relative transition-all duration-300 ease-in-out hover:scale-[1.03] hover:cursor-pointer hover:shadow-lg"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={onClick}
    >
      <div className="flex flex-col rounded-lg border-2 border-slate-200 border-opacity-50 p-8 dark:border-slate-700 sm:flex-row">
        <div className="mb-4 inline-flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-500 sm:mb-0 sm:mr-8">
          <InstrumentIcon kind={instrument.kind} />
        </div>
        <div className="flex-grow">
          <h3
            className="title-font mb-1 text-lg font-semibold text-slate-900 dark:text-slate-100"
            data-cy="instrument-title"
          >
            {instrument.details.title}
          </h3>
          <h5 className="mb-2 text-slate-600 dark:text-slate-300" data-cy="instrument-card">
            {`${t('tags')}: ${instrument.tags.join(', ')}`}
          </h5>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{instrument.details.description}</p>
        </div>
      </div>
    </div>
  );
};
