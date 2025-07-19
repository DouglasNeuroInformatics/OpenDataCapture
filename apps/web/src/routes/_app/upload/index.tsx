import React from 'react';

import { ClientTable, Heading, SearchBar } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { UnilingualInstrumentInfo } from '@opendatacapture/schemas/instrument';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

import { PageHeader } from '@/components/PageHeader';
import { useInstrumentInfoQuery } from '@/hooks/useInstrumentInfoQuery';
import { useSearch } from '@/hooks/useSearch';

const UploadSelectTable: React.FC<{
  data: UnilingualInstrumentInfo[];
  onSelect: (instrument: UnilingualInstrumentInfo) => void;
}> = ({ data, onSelect }) => {
  const { t } = useTranslation();
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

const RouteComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data } = useInstrumentInfoQuery({
    params: {
      kind: 'FORM'
    }
  });

  const { filteredData, searchTerm, setSearchTerm } = useSearch(data ?? [], (instrument) => instrument.details.title);

  return (
    <React.Fragment>
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {t({
            en: 'Select Instrument (Experimental Feature)',
            fr: 'Selectionnez un instrument (Fonctionnalité expérimentale)'
          })}
        </Heading>
      </PageHeader>
      <SearchBar
        className="mb-3"
        placeholder={t({
          en: 'Search by Instrument Title',
          fr: "Recherche par titre de l'instrument"
        })}
        value={searchTerm}
        onValueChange={setSearchTerm}
      />
      <UploadSelectTable
        data={filteredData}
        onSelect={(instrument) => {
          void navigate({ params: { instrumentId: instrument.id }, to: '/upload/$instrumentId' });
        }}
      />
    </React.Fragment>
  );
};

export const Route = createFileRoute('/_app/upload/')({
  component: RouteComponent
});
