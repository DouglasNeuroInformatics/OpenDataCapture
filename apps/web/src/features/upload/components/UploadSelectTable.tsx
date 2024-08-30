import { useInstrumentInfoQuery } from '@/hooks/useInstrumentInfoQuery';
import type { InstrumentInfo } from '@opendatacapture/schemas/instrument';
import { ClientTable } from '@douglasneuroinformatics/libui/components';

export type UploadSelectTableProps = {
  data: InstrumentInfo[];
  onSelect: (instrument: InstrumentInfo) => void;
};

export const UploadSelectTable = ({ data, onSelect }: UploadSelectTableProps) => {
  const insturmentList = useInstrumentInfoQuery();
  return (
    <>
      <ClientTable<InstrumentInfo>
        columns={[]}
        data={data}
        entriesPerPage={15}
        minRows={15}
        onEntryClick={onSelect}
      ></ClientTable>
    </>
  );
};
