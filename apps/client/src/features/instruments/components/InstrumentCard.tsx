import React from 'react';

import { FormInstrumentSummary } from '@ddcp/common';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { HiArrowRight, HiPencilSquare, HiXCircle } from 'react-icons/hi2';
import { Link } from 'react-router-dom';

import { useAuthStore } from '@/stores/auth-store';
import { useNotificationsStore } from '@/stores/notifications-store';

export interface InstrumentCardProps {
  instrument: FormInstrumentSummary;
}

export const InstrumentCard = ({ instrument }: InstrumentCardProps) => {
  const { currentUser } = useAuthStore();
  const notifications = useNotificationsStore();
  const { t } = useTranslation('instruments');

  const deleteInstrument = async () => {
    await axios.delete(`instruments/forms/${instrument._id}`);
    notifications.add({ type: 'success' });
  };

  return (
    <div className="relative">
      {currentUser?.ability.can('delete', 'Instrument') && (
        <button className="absolute right-2 top-2 h-6 w-6" type="button" onClick={deleteInstrument}>
          <HiXCircle className="h-full w-full text-red-600" />
        </button>
      )}
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
          <Link className="mt-3 inline-flex items-center text-indigo-500" to={`../forms/${instrument._id}`}>
            Learn More
            <HiArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
