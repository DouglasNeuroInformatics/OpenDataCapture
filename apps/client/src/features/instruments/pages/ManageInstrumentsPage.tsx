import React, { useState } from 'react';

import { FormInstrumentSummary } from '@douglasneuroinformatics/common';
import { useNotificationsStore } from '@douglasneuroinformatics/ui';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components';
import { useFetch } from '@/hooks/useFetch';

export const ManageInstrumentsPage = () => {
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const { t } = useTranslation();
  const { data, setData } = useFetch<FormInstrumentSummary[]>('/v1/instruments/forms/available');
  const notifications = useNotificationsStore();

  /*
  const deleteInstrument = async (instrument: { _id: string }) => {
    await axios.delete(`instruments/forms/${instrument._id}`);
    setData((prevData) => prevData?.filter((item) => item._id !== instrument._id) ?? null);
    notifications.addNotification({ type: 'success' });
  };
  */

  return (
    <div>
      <PageHeader title={t('instruments.manageInstruments.pageTitle')} />
    </div>
  );
};

export default ManageInstrumentsPage;
