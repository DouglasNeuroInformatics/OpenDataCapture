import React, { useEffect, useState } from 'react';

import { ListboxDropdown, SearchBar } from '@douglasneuroinformatics/libui/components';
import type { ListboxDropdownOption } from '@douglasneuroinformatics/libui/components';
import type { UnilingualInstrumentSummary } from '@opendatacapture/schemas/instrument';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useInstrumentSummariesQuery } from '@/hooks/useInstrumentSummariesQuery';
import { useAppStore } from '@/store';

import { InstrumentCard } from '../InstrumentCard';

export const InstrumentsShowcase = () => {
  const currentGroup = useAppStore((store) => store.currentGroup);
  const instrumentSummariesQuery = useInstrumentSummariesQuery();
  const navigate = useNavigate();
  const { t } = useTranslation(['core', 'instruments']);
  const [filteredInstruments, setFilteredInstruments] = useState<UnilingualInstrumentSummary[]>([]);
  const [tagOptions, setTagOptions] = useState<ListboxDropdownOption[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<ListboxDropdownOption[]>([]);
  const [selectedTags, setSelectedTags] = useState<ListboxDropdownOption[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const languageOptions = [
    {
      key: 'en',
      label: t('languages.english')
    },
    {
      key: 'fr',
      label: t('languages.french')
    }
  ];

  useEffect(() => {
    setFilteredInstruments(
      instrumentSummariesQuery.data.filter((summary) => {
        if (currentGroup && !currentGroup?.accessibleInstrumentIds.includes(summary.id)) {
          return false;
        }
        const matchesSearch = summary.details.title.toUpperCase().includes(searchTerm.toUpperCase());
        const matchesLanguages =
          selectedLanguages.length === 0 || selectedLanguages.find(({ key }) => key === summary.language);
        const matchesTags =
          selectedTags.length === 0 || summary.tags.some((tag) => selectedTags.find(({ key }) => key === tag));
        return matchesSearch && matchesLanguages && matchesTags;
      })
    );
  }, [
    currentGroup?.accessibleInstrumentIds,
    instrumentSummariesQuery.data,
    searchTerm,
    selectedLanguages,
    selectedTags
  ]);

  useEffect(() => {
    setTagOptions(
      Array.from(new Set(filteredInstruments.flatMap((item) => item.tags))).map((item) => ({
        key: item,
        label: item
      }))
    );
  }, [filteredInstruments]);

  return (
    <div>
      <div className="my-5 flex flex-col justify-between gap-5 lg:flex-row">
        <SearchBar className="w-full flex-grow" value={searchTerm} onValueChange={setSearchTerm} />
        <div className="flex min-w-96 flex-grow gap-2 lg:flex-shrink">
          <div className="flex w-full" data-cy="tags-btn-dropdown">
            <ListboxDropdown
              widthFull
              options={tagOptions}
              selected={selectedTags}
              setSelected={setSelectedTags}
              title={t('tags')}
            />
          </div>
          <div className="flex w-full" data-cy="language-btn-dropdown">
            <ListboxDropdown
              widthFull
              options={languageOptions}
              selected={selectedLanguages}
              setSelected={setSelectedLanguages}
              title={t('language')}
            />
          </div>
        </div>
      </div>
      <div className="relative grid grid-cols-1 gap-5">
        {filteredInstruments.map((instrument, i) => {
          return (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 80 }}
              initial={{ opacity: 0, y: 80 }}
              key={instrument.id}
              transition={{ bounce: 0.2, delay: 0.15 * i, duration: 1.2, type: 'spring' }}
            >
              <InstrumentCard
                instrument={instrument}
                onClick={() => {
                  navigate(`/instruments/render/${instrument.id}`, { state: { summary: instrument } });
                }}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
