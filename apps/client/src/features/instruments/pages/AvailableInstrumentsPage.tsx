import React from 'react';

import { FormInstrumentSummary } from '@ddcp/common';
import { useTranslation } from 'react-i18next';

import { InstrumentCard } from '../components/InstrumentCard';

import { Dropdown, PageHeader, SearchBar, Spinner } from '@/components';
import { useFetch } from '@/hooks/useFetch';

export const AvailableInstrumentsPage = () => {
  const { data } = useFetch<FormInstrumentSummary[]>('/instruments/forms/available');
  const { t } = useTranslation('instruments');

  if (!data) {
    return <Spinner />;
  }

  const languages = new Set(data.map((item) => item.details.language));
  const tags = new Set(data.flatMap((item) => item.tags));

  return (
    <div>
      <PageHeader title={t('availableInstruments.pageTitle')} />
      <div className="md:mx-6">
        <div className="my-5 flex flex-col justify-between gap-5 lg:flex-row">
          <SearchBar />
          <div className="flex flex-grow gap-2 lg:flex-shrink">
            <Dropdown options={[]} title={t('availableInstruments.filters.language')} onSelection={() => null} />
            <Dropdown options={[]} title={t('availableInstruments.filters.tags')} onSelection={() => null} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-5">
          {data.map((instrument, i) => (
            <InstrumentCard instrument={instrument} key={i} />
          ))}
        </div>
      </div>
    </div>
  );
};
