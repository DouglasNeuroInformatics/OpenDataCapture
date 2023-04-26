import React, { useMemo, useState } from 'react';

import { FormInstrument, FormInstrumentData, SubjectFormRecords } from '@douglasneuroinformatics/common';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { Dropdown, LineGraph, PageHeader, SelectDropdown, Spinner } from '@/components';
import { useFetch } from '@/hooks/useFetch';

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

  return (
    <div>
      <PageHeader title={`${t('subjectPage.pageTitle')}: ${params.subjectId!.slice(0, 6)}`} />
      <LineGraph
        data={[
          {
            x: '1',
            y: 1
          },
          {
            x: '2',
            y: 2
          },
          {
            x: ' 3',
            y: 3
          }
        ]}
        legend={null}
        lines={[
          {
            name: 'Value',
            val: 'y'
          }
        ]}
        xAxis={{
          key: 'x',
          label: 'X'
        }}
        yAxis={{
          label: 'Y'
        }}
      />
    </div>
  );
};
