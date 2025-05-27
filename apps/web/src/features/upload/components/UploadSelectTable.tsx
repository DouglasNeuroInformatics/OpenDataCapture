import { ClientTable } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { UnilingualInstrumentInfo } from '@opendatacapture/schemas/instrument';

type UploadSelectTableProps = {
  data: UnilingualInstrumentInfo[];
  onSelect: (instrument: UnilingualInstrumentInfo) => void;
};

export const UploadSelectTable = ({ data, onSelect }: UploadSelectTableProps) => {
  const { t } = useTranslation();

  // Renders a table for selecting an instrument to upload data for
  return (
    <ClientTable<UnilingualInstrumentInfo>
      columns={[
        {
          field: (instrument) => instrument.details.title,
          label: t({
            en: 'Title',
            fr: 'Titre'
          })
        },
        {
          field: (instrument) => instrument.kind,
          label: t({
            en: 'Kind',
            fr: 'Genre'
          })
        }
      ]}
      data={data}
      entriesPerPage={15}
      minRows={15}
      onEntryClick={onSelect}
    />
  );
};
