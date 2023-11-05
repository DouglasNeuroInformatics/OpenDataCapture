import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { z } from 'zod';

const schema = z.array(
  z.object({
    computedMeasures: z.record(z.number()).optional(),
    data: z.record(z.any()),
    date: z.coerce.date()
  })
);

type UseFormRecordsOptions = {
  enabled?: boolean;
  params: {
    groupId?: string;
    instrumentId?: string;
    minDate?: Date;
    subjectIdentifier?: string;
  };
};

export const useFormRecords = (
  { enabled, params }: UseFormRecordsOptions = {
    enabled: true,
    params: {}
  }
) => {
  return useQuery({
    enabled,
    queryFn: async () => {
      const response = await axios.get('/v1/instrument-records', {
        params
      });
      return schema.parseAsync(response.data);
    },
    queryKey: ['form-records', ...Object.values(params)]
  });
};
