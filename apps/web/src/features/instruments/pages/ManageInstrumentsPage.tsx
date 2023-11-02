import { Spinner } from '@douglasneuroinformatics/ui';
import { instrumentSourceContainerSchema } from '@open-data-capture/common/instrument';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { Editor } from '@/components/Editor';

export const ManageInstrumentsPage = () => {
  const query = useQuery({
    queryFn: async () => {
      const response = await axios.get('/v1/instruments/sources');
      const result = await instrumentSourceContainerSchema.array().safeParseAsync(response.data);
      if (!result.success) {
        throw new Error('Failed to parse form instrument bundle', { cause: result.error });
      }
      return result.data;
    },
    queryKey: ['instrument-sources'],
    throwOnError: true
  });

  if (!query.data) {
    return <Spinner />;
  }

  return (
    <div className="h-screen py-8">
      <Editor
        files={query.data.map((instrument) => ({
          content: instrument.source,
          path: `${instrument.name}.ts`
        }))}
      />
    </div>
  );
};
