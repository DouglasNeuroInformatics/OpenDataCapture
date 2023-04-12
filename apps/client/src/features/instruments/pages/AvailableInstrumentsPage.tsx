import React from 'react';

import { FormInstrumentSummary } from '@ddcp/common';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import { InstrumentShowcase } from '../components/InstrumentShowcase';

import { PageHeader, Spinner } from '@/components';
import { useFetch } from '@/hooks/useFetch';
import { useNotificationsStore } from '@/stores/notifications-store';

export const AvailableInstrumentsPage = () => {
  const { data, setData } = useFetch<FormInstrumentSummary[]>('/instruments/forms/available');
  const { t } = useTranslation('instruments');
  const notifications = useNotificationsStore();

  if (!data) {
    return <Spinner />;
  }

  const deleteInstrument = async (instrument: FormInstrumentSummary) => {
    await axios.delete(`instruments/forms/${instrument._id}`);
    setData((prevData) => prevData?.filter((item) => item._id !== instrument._id) ?? null);
    notifications.add({ type: 'success' });
  };

  return (
    <div>
      <PageHeader title={t('availableInstruments.pageTitle')} />
      <InstrumentShowcase deleteInstrument={deleteInstrument} instruments={data} />
    </div>
  );
};
