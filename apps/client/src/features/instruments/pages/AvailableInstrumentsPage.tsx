import React, { useState } from 'react';

import { FormInstrumentSummary } from '@ddcp/common';
import { useTranslation } from 'react-i18next';

import { InstrumentCard } from '../components/InstrumentCard';

import { Dropdown, PageHeader, SearchBar, SelectDropdown, Spinner } from '@/components';
import { useFetch } from '@/hooks/useFetch';

export const AvailableInstrumentsPage = () => {
  let { data } = useFetch<FormInstrumentSummary[]>('/instruments/forms/available');
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useTranslation(['common', 'instruments']);

  if (!data) {
    return <Spinner />;
  }

  if (searchTerm) {
    data = data.filter((item) => item.details.title.toUpperCase().includes(searchTerm.toUpperCase()));
  }

  const languageOptions = Array.from(new Set(data.map((item) => item.details.language))).map((item) => ({
    key: item,
    label: t(`common:languages.${item}`)
  }));

  const tagOptions = Array.from(new Set(data.flatMap((item) => item.tags))).map((item) => ({
    key: item,
    label: item
  }));

  return (
    <div>
      <PageHeader title={t('instruments:availableInstruments.pageTitle')} />
      <div>
        <div className="my-5 flex flex-col justify-between gap-5 lg:flex-row">
          <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <div className="flex flex-grow gap-2 lg:flex-shrink">
            <SelectDropdown options={languageOptions} title={t('instruments:availableInstruments.filters.language')} />
            <SelectDropdown options={tagOptions} title={t('instruments:availableInstruments.filters.tags')} />
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
