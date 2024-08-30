import { useInstrumentInfoQuery } from '@/hooks/useInstrumentInfoQuery';
import type { InstrumentInfo } from '@opendatacapture/schemas/instrument';
import { ClientTable } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from 'react-i18next';

export type UploadSelectTableProps = {
  data: InstrumentInfo[];
  onSelect: (instrument: InstrumentInfo) => void;
};

export const UploadSelectTable = ({ data, onSelect }: UploadSelectTableProps) => {
  const { t } = useTranslation(['upload', 'core']);
  const insturmentList = useInstrumentInfoQuery();
  return (
    <>
      <ClientTable<InstrumentInfo>
        columns={[
          {
            field: (insturmentList) => (insturmentList.details ? insturmentList.details.title.toString() : 'N/A'),
            label: t('title')
          }
        ]}
        data={data}
        entriesPerPage={15}
        minRows={15}
        onEntryClick={onSelect}
      ></ClientTable>
    </>
  );
};
