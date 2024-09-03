import { ClientTable } from '@douglasneuroinformatics/libui/components';
import type { InstrumentInfo } from '@opendatacapture/schemas/instrument';
import { useTranslation } from 'react-i18next';

export type UploadSelectTableProps = {
  data: InstrumentInfo[];
  onSelect: (instrument: InstrumentInfo) => void;
};

export const UploadSelectTable = ({ data, onSelect }: UploadSelectTableProps) => {
  const { t } = useTranslation(['upload', 'core']);

  return (
    <>
      <ClientTable<InstrumentInfo>
        columns={[
          {
            field: (instrument) => (instrument.details ? (instrument.details.title as string) : 'N/A'),
            label: t('index.title')
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
