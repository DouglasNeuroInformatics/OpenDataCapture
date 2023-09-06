import React, { useState } from 'react';

import { Modal } from '@douglasneuroinformatics/ui';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

export const DemoBanner = () => {
  const { t } = useTranslation();
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
              {t('learnMore')}
            </button>
          </div>
        </div>
      </div>
      <Modal open={isModalOpen} title={t('demo.info')} width="xl" onClose={closeModal}>
        <div className="space-y-2">
          <p>{t('demo.summary')}</p>
          <h5 className="text-lg font-semibold">{t('demo.loginCredentials')}</h5>
          <p>{t('demo.username', { value: 'JaneDoe' })}</p>
          <p>{t('demo.password', { value: 'DataCapture2023' })}</p>
          <p>{t('demo.role', { value: 'Group Manager' })}</p>
          <p>{t('demo.groups', { value: 'Group Manager' })}</p>
        </div>
      </Modal>
    </>
  );
};
