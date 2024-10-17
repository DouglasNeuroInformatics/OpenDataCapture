import { ClientTable } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { InstrumentInfo } from '@opendatacapture/schemas/instrument';

export type UploadSelectTableProps = {
  data: InstrumentInfo[];
  onSelect: (instrument: InstrumentInfo) => void;
};

export const UploadSelectTable = ({ data, onSelect }: UploadSelectTableProps) => {
  const { t } = useTranslation();

  // Renders a table for selecting an instrument to upload data for
  return (
    <ClientTable<InstrumentInfo>
      columns={[
        {
          field: (instrument) => (instrument.details?.title as string) ?? 'N/A',
          label: t({
            en: 'Select an instrument',
            fr: 'Selectionnez un instrument'
          })
        }
      ]}
      data={data}
      entriesPerPage={15}
      onEntryClick={onSelect}
    />
  );
};
