import React, { createContext, useEffect, useMemo, useState } from 'react';

import { FormInstrumentRecord, SubjectFormRecords } from '@douglasneuroinformatics/common';
import { useParams } from 'react-router-dom';

import { SelectedInstrument, SelectedMeasure } from '../types';

import { Spinner } from '@/components';
import { useFetch } from '@/hooks/useFetch';

export const VisualizationContext = createContext<{
  data: SubjectFormRecords[];
  records: Array<
    Pick<FormInstrumentRecord, 'data' | 'time'> & {
      computedMeasures?: Record<string, number> | undefined;
    }
  >;
  measureOptions: SelectedMeasure[];
  /** An object with instrument identifiers mapped to titles */
  instrumentOptions: Record<string, string>;
  selectedInstrument: SelectedInstrument | null;
  setSelectedInstrument: React.Dispatch<React.SetStateAction<SelectedInstrument | null>>;
  selectedMeasures: SelectedMeasure[];
  setSelectedMeasures: React.Dispatch<React.SetStateAction<SelectedMeasure[]>>;
}>(null!);

export const VisualizationContextProvider = ({ children }: { children: React.ReactNode }) => {
  const params = useParams();
  const { data } = useFetch<SubjectFormRecords[]>(`/v1/instruments/records/forms?subject=${params.subjectIdentifier!}`);

  const [selectedInstrument, setSelectedInstrument] = useState<SelectedInstrument | null>(null);
  const [selectedMeasures, setSelectedMeasures] = useState<SelectedMeasure[]>([]);

  const records = useMemo(() => {
    if (data) {
      return data.find(({ instrument }) => instrument === selectedInstrument)?.records ?? [];
    }
    return [];
  }, [data, selectedInstrument]);

  const instrumentOptions = useMemo(() => {
    return data
      ? Object.fromEntries(
          data
            .filter(({ instrument }) => instrument.measures)
            .map(({ instrument }) => [instrument.identifier, instrument.details.title])
        )
      : {};
  }, [data]);

  const measureOptions = useMemo(() => {
    const arr: SelectedMeasure[] = [];
    if (selectedInstrument) {
      for (const measure in selectedInstrument.measures) {
        arr.push({
          key: measure,
          label: selectedInstrument.measures[measure].label
        });
      }
    }
    return arr;
  }, [selectedInstrument]);

  // This is to reset all data when language changes
  useEffect(() => {
    setSelectedInstrument(null);
    setSelectedMeasures([]);
  }, [data]);

  if (!data) {
    return <Spinner />;
  }

  return (
    <VisualizationContext.Provider
      value={{
        data,
        records,
        measureOptions,
        instrumentOptions,
        selectedInstrument,
        setSelectedInstrument,
        selectedMeasures,
        setSelectedMeasures
      }}
    >
      {children}
    </VisualizationContext.Provider>
  );
};
