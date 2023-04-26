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

  const fields = useMemo(() => {
    if (!selectedInstrument) {
      return null;
    } else if (selectedInstrument.content instanceof Array) {
      return selectedInstrument.content
        .map((group) => group.fields)
        .reduce((prev, current) => ({ ...prev, ...current }));
    } else {
      return selectedInstrument.content;
    }
  }, [selectedInstrument]);

  //const m = computeMeasures(selectedInstrument);
  //console.log(m);

  if (!data) {
    return <Spinner />;
  }

  const instruments = data.map((item) => item.instrument);
  const instrumentTitles = instruments.map((instrument) => instrument.details.title);

  return (
    <div>
      <PageHeader title={`${t('subjectPage.pageTitle')}: ${params.subjectId!.slice(0, 6)}`} />
      <h3>Selected Instrument: {selectedInstrument?.details.title ?? 'None'}</h3>
      <div>
        <div className="flex gap-3">
          <Dropdown
            options={instrumentTitles}
            title="Instrument"
            onSelection={(title) => {
              const instrument = instruments.find((instrument) => instrument.details.title === title);
              setSelectedInstrument(instrument);
            }}
          />
          <SelectDropdown options={[]} title="Dropdown" onChange={(selection) => undefined} />
        </div>
      </div>
    </div>
  );
};

export default SubjectPage;
