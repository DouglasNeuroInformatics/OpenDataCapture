import React, { createContext, useEffect, useMemo, useState } from 'react';

import { FormInstrument, FormInstrumentRecord, SubjectFormRecords } from '@ddcp/types';
import { useParams } from 'react-router-dom';

import { Measurements, SelectedInstrument, SelectedMeasure } from '../types';

import { Spinner } from '@/components';
import { useFetch } from '@/hooks/useFetch';
import i18n from '@/services/18n';

/** Apply a callback function to filter items from object */
function filterObj<T extends object>(obj: T, fn: (entry: { key: keyof T; value: T[keyof T] }) => any) {
  const result: Partial<T> = {};
  for (const key in obj) {
    if (fn({ key, value: obj[key] })) {
      result[key] = obj[key];
    }
  }
  return result;
}

export type VisualizationContextData = {
  /** Data in the format returned from the API */
  data: SubjectFormRecords[];

  /** An array of records in the data returned by the API, after applying filters */
  records: Array<
    Pick<FormInstrumentRecord, 'data' | 'time'> & {
      computedMeasures?: Record<string, number> | undefined;
    }
  >;

  /** Merger of `computedMeasures` and `time` for all records  */
  measurements: Measurements;

  /** Minimum unix timestamp for a record */
  minTime: number | null;

  /** A function to set the minimum time */
  setMinTime: React.Dispatch<React.SetStateAction<number | null>>;

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

export type VisualizationContextProviderProps = {
  children: React.ReactNode;
  /** A filter that can be applied to the instrument options based on truthy` */
  instrumentOptionsFilter?: (instrument: FormInstrument) => any;
};

export const VisualizationContextProvider = ({
  children,
  instrumentOptionsFilter = () => true
}: VisualizationContextProviderProps) => {
  const params = useParams();
  const { data } = useFetch<SubjectFormRecords[]>(`/v1/instruments/records/forms`, [], {
    queryParams: {
      subject: params.subjectIdentifier,
      lang: i18n.resolvedLanguage
    }
  });

  const [minTime, setMinTime] = useState<number | null>(null);
  const [selectedInstrument, setSelectedInstrument] = useState<SelectedInstrument | null>(null);
  const [selectedMeasures, setSelectedMeasures] = useState<SelectedMeasure[]>([]);

  // This is to reset all data when language changes
  useEffect(() => {
    setSelectedInstrument(null);
    setSelectedMeasures([]);
  }, [i18n.resolvedLanguage]);

  useEffect(() => {
    setMinTime(null);
  }, [selectedInstrument]);

  const records = useMemo(() => {
    const instrument = data?.find(({ instrument }) => instrument === selectedInstrument);
    if (!instrument) {
      return [];
    }
    return instrument.records.map((record) => record).filter((record) => minTime === null || record.time > minTime);
  }, [data, selectedMeasures, selectedInstrument, minTime]);

  const measurements = useMemo<Measurements>(() => {
    return records
      .map((record) => ({
        time: record.time,
        ...filterObj(record.computedMeasures!, ({ key }) => {
          return selectedMeasures.find((item) => item.key === key);
        })
      }))
      .sort((a, b) => {
        if (a.time > b.time) {
          return 1;
        } else if (b.time > a.time) {
          return -1;
        }
        return 0;
      });
  }, [records]);

  const instrumentOptions = useMemo(() => {
    return data
      ? Object.fromEntries(
          data
            .filter(({ instrument }) => instrumentOptionsFilter(instrument))
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

  if (!data) {
    return <Spinner />;
  }

  return (
    <VisualizationContext.Provider
      value={{
        data,
        records,
        measurements,
        measureOptions,
        instrumentOptions,
        minTime,
        setMinTime,
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
