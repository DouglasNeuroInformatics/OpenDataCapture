import React from 'react';

import { FormInstrumentSummary } from '@ddcp/common';
import { useTranslation } from 'react-i18next';
import { HiPencilSquare } from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';

export interface InstrumentCardProps {
  instrument: FormInstrumentSummary;
}

export const InstrumentCard = ({ instrument }: InstrumentCardProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation('instruments');

  const handleClick = () => {
    navigate(`../forms/${instrument._id}`);
  };

  return (
    <div
      className="relative transition-all duration-300 ease-in-out hover:scale-105 hover:cursor-pointer hover:shadow-2xl"
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleClick}
    >
      <div className="flex flex-col rounded-lg border-2 border-slate-200 border-opacity-50 p-8 sm:flex-row">
        <div className="mb-4 inline-flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-500 sm:mr-8 sm:mb-0">
          <HiPencilSquare className="h-8 w-8" />
        </div>
        <div className="flex-grow">
          <h3 className="title-font mb-1 text-lg font-semibold text-slate-900">{instrument.details.title}</h3>
          <h5 className="mb-2 text-slate-700">{`${t('availableInstruments.filters.tags')}: ${instrument.tags.join(
            ', '
          )}`}</h5>
          <p className="text-sm leading-relaxed text-slate-700">{instrument.details.description}</p>
        </div>
      </div>
    </div>
  );
};
