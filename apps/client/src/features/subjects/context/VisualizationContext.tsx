import React, { createContext } from 'react';

import { SubjectFormRecords } from '@douglasneuroinformatics/common';
import { useParams } from 'react-router-dom';

import { Spinner } from '@/components';
import { useFetch } from '@/hooks/useFetch';

export const VisualizationContext = createContext<{
  data: SubjectFormRecords[];
}>({
  data: []
});

export const VisualizationContextProvider = ({ children }: { children: React.ReactNode }) => {
  const params = useParams();
  const { data } = useFetch<SubjectFormRecords[]>(`/v1/instruments/records/forms?subject=${params.subjectIdentifier!}`);

  if (!data) {
    return <Spinner />;
  }

  return <VisualizationContext.Provider value={{ data }}>{children}</VisualizationContext.Provider>;
};
