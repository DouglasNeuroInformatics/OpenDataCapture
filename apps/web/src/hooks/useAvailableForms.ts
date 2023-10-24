import type { FormInstrumentSummary } from '@open-data-capture/types';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export const useAvailableForms = () => {
  return useQuery({
    queryFn: () => {
      return axios.get<FormInstrumentSummary[]>('/v1/instruments/forms/available').then((response) => response.data);
    },
    queryKey: ['available-forms']
  });
};
