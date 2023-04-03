import React from 'react';

import { FormInstrumentSummary } from '@ddcp/common';
import { HiArrowRight, HiPencilSquare } from 'react-icons/hi2';
import { Link } from 'react-router-dom';

export interface InstrumentCardProps {
  instrument: FormInstrumentSummary;
}

export const InstrumentCard = ({ instrument }: InstrumentCardProps) => {
  return (
    <div className="flex flex-col rounded-lg border-2 border-slate-200 border-opacity-50 p-8 sm:flex-row">
      <div className="mb-4 inline-flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-500 sm:mr-8 sm:mb-0">
        <HiPencilSquare className="h-8 w-8" />
      </div>
      <div className="flex-grow">
        <h2 className="title-font mb-3 text-lg font-medium text-slate-900">{instrument.details.title}</h2>
        <p className="text-sm leading-relaxed text-slate-700">{instrument.details.description}</p>
        <Link className="mt-3 inline-flex items-center text-indigo-500" to={`../forms/${instrument._id}`}>
          Learn More
          <HiArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};
