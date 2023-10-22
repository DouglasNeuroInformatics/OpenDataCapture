import { useState } from 'react';

import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

import { DemoModal } from './DemoModal';

export const DemoBanner = () => {
  const { t } = useTranslation('auth');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="flex w-full items-center justify-center bg-sky-700 text-sky-100">
        <div className="container py-2">
          <div className="flex flex-col items-center justify-between lg:flex-row">
            <div className="my-1 flex items-center gap-3">
              <InformationCircleIcon className="hidden h-6 w-6 lg:block" />
              <p className="text-center font-medium text-slate-100 lg:text-left">{t('demo.welcome')}</p>
            </div>
            <button
              className="my-1 w-full rounded-lg border border-sky-400 px-3 py-1.5 hover:bg-sky-600 hover:shadow-lg lg:w-auto"
              type="button"
              onClick={openModal}
            >
              {t('demo.learnMore')}
            </button>
          </div>
        </div>
      </div>
      <DemoModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
};
