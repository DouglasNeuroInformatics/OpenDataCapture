import React from 'react';

import { Heading, SearchBar } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { useNavigate } from 'react-router-dom';

import { PageHeader } from '@/components/PageHeader';
import { useInstrumentInfoQuery } from '@/hooks/useInstrumentInfoQuery';
import { useSearch } from '@/hooks/useSearch';

import { UploadSelectTable } from '../components/UploadSelectTable';

export const UploadSelectPage = () => {
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
          navigate(instrument.id);
        }}
      />
    </React.Fragment>
  );
};
