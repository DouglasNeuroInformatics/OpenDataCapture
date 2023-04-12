import React, { useState } from 'react';

import { FormInstrumentSummary } from '@ddcp/common';
import { useTranslation } from 'react-i18next';
import { HiArrowRight, HiPencilSquare, HiXCircle } from 'react-icons/hi2';
import { Link } from 'react-router-dom';

import { Button, Modal } from '@/components';
import { useAuthStore } from '@/stores/auth-store';

export interface InstrumentCardProps {
  deleteInstrument: (instrument: FormInstrumentSummary) => Promise<void>;
  instrument: FormInstrumentSummary;
}

export const InstrumentCard = ({ deleteInstrument, instrument }: InstrumentCardProps) => {
  const { currentUser } = useAuthStore();
  const { t } = useTranslation('instruments');
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  return (
    <div className="relative">
      <Modal
        open={isDeleteConfirmOpen}
        title={t('availableInstruments.deleteModal.title')}
        onClose={() => setIsDeleteConfirmOpen(false)}
      >
        <div>
          <span className="block">
            {t('availableInstruments.deleteModal.name')}: {instrument.name}
          </span>
          <span className="block">
            {t('availableInstruments.deleteModal.language')}: {instrument.details.language}
          </span>
          <span className="block">
            {t('availableInstruments.deleteModal.version')}: {instrument.version}
          </span>
        </div>
        <div className="mt-5 flex gap-3">
          <Button
            label={t('availableInstruments.deleteModal.delete')}
            type="button"
            variant="red"
            onClick={() => {
              setIsDeleteConfirmOpen(false);
              void deleteInstrument(instrument);
            }}
          />
          <Button
            label={t('availableInstruments.deleteModal.cancel')}
            type="button"
            variant="light"
            onClick={() => setIsDeleteConfirmOpen(false)}
          />
        </div>
      </Modal>
      {currentUser?.ability.can('delete', 'Instrument') && (
        <button className="absolute right-2 top-2 h-6 w-6" type="button" onClick={() => setIsDeleteConfirmOpen(true)}>
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
