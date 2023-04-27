import React, { HTMLProps, useMemo, useState } from 'react';

import { FormInstrument, FormInstrumentData, SubjectFormRecords } from '@douglasneuroinformatics/common';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { Dropdown, LineGraph, PageHeader, SelectDropdown, Spinner } from '@/components';
import { useFetch } from '@/hooks/useFetch';
import { RecordsGraph } from '../components/RecordsGraph';

function computeMeasures<T extends FormInstrumentData>(instrument?: FormInstrument<T>) {
  if (!instrument?.measures) {
    return null;
  }
  return Object.fromEntries(
    Object.entries(instrument.measures).map(([key, { label, formula }]) => {
      return [key, { label, formula }];
    })
  );
}

export const SubjectPage = () => {
  const params = useParams();
  const { t } = useTranslation('subjects');
  const { data } = useFetch<SubjectFormRecords[]>(`/instruments/records/forms?subject=${params.subjectId!}`);
  const [selectedInstrument, setSelectedInstrument] = useState<FormInstrument>();

  if (!data) {
    return <Spinner />;
  }

  const instruments = data.map(({ instrument }) => instrument);

  return (
    <div>
      <PageHeader title={`${t('subjectPage.pageTitle')}: ${params.subjectId!.slice(0, 6)}`} />
      <RecordsGraph />
    </div>
  );
};
