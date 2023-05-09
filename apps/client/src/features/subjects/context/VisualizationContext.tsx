import React, { createContext, useEffect, useMemo, useState } from 'react';

import { FormInstrumentRecord, SubjectFormRecords } from '@douglasneuroinformatics/common';
import { useParams } from 'react-router-dom';

import { SelectedInstrument, SelectedMeasure } from '../types';

import { Spinner } from '@/components';
import { useFetch } from '@/hooks/useFetch';
import i18n from '@/services/18n';

export type VisualizationContextData = {
  /** Data in the format returned from the API */
  data: SubjectFormRecords[];

  /** An array of all records in the data returned by the API */
  records: Array<
    Pick<FormInstrumentRecord, 'data' | 'time'> & {
      computedMeasures?: Record<string, number> | undefined;
    }
  >;

  /** The selected instrument from among those in the data */
  selectedInstrument: SelectedInstrument | null;

  /** A function to set the selected instrument */
  setSelectedInstrument: React.Dispatch<React.SetStateAction<SelectedInstrument | null>>;

  /** All measure options associated with the selected current selected instrument */
  measureOptions: SelectedMeasure[];

  /** An object with instrument identifiers mapped to titles */
  instrumentOptions: Record<string, string>;

  /** An array of all the measures selected for the current instrument */
  selectedMeasures: SelectedMeasure[];

  /** A function to set the measures selected for the current instrument */
  setSelectedMeasures: React.Dispatch<React.SetStateAction<SelectedMeasure[]>>;
};

export const VisualizationContext = createContext<VisualizationContextData>(null!);

export const VisualizationContextProvider = ({ children }: { children: React.ReactNode }) => {
  const params = useParams();
  const { data } = useFetch<SubjectFormRecords[]>(`/v1/instruments/records/forms`, [], {
    queryParams: {
      subject: params.subjectIdentifier,
      lang: i18n.resolvedLanguage
    }
  });

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
  }, [i18n.resolvedLanguage]);

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
