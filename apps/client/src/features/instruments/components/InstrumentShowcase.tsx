import React, { useMemo, useState } from 'react';

import { FormInstrumentSummary, Language } from '@ddcp/common';
import { useTranslation } from 'react-i18next';

import { InstrumentCard } from './InstrumentCard';

import { SearchBar, SelectDropdown } from '@/components';

export interface InstrumentShowcaseProps {
  instruments: FormInstrumentSummary[];
  deleteInstrument: (instrument: FormInstrumentSummary) => Promise<void>;
}

export const InstrumentShowcase = ({ deleteInstrument, instruments }: InstrumentShowcaseProps) => {
  const { i18n, t } = useTranslation(['common', 'instruments']);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<Language[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const defaultLanguageOptions = useMemo<Language[]>(() => {
    return [i18n.resolvedLanguage as Language];
  }, [i18n.resolvedLanguage]);

  const languageOptions = Array.from(new Set(instruments.map((item) => item.details.language))).map((item) => ({
    key: item,
    label: t(`common:languages.${item}`)
  }));

  const tagOptions = Array.from(new Set(instruments.flatMap((item) => item.tags))).map((item) => ({
    key: item,
    label: item
  }));

  const filteredInstruments = instruments.filter((instrument) => {
    const matchesSearch = instrument.details.title.toUpperCase().includes(searchTerm.toUpperCase());
    const matchesLanguages = selectedLanguages.length === 0 || selectedLanguages.includes(instrument.details.language);
    const matchesTags = selectedTags.length === 0 || instrument.tags.some((tag) => selectedTags.includes(tag));
    return matchesSearch && matchesLanguages && matchesTags;
  });

  return (
    <div>
      <div className="my-5 flex flex-col justify-between gap-5 lg:flex-row">
        <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <div className="flex flex-grow gap-2 lg:flex-shrink">
          <SelectDropdown
            defaultSelections={defaultLanguageOptions}
            options={languageOptions}
            title={t('instruments:availableInstruments.filters.language')}
            onChange={(selected) => setSelectedLanguages(selected.map((item) => item.key))}
          />
          <SelectDropdown
            options={tagOptions}
            title={t('instruments:availableInstruments.filters.tags')}
            onChange={(selected) => setSelectedTags(selected.map((item) => item.key))}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-5">
        {filteredInstruments.map((instrument, i) => (
          <InstrumentCard deleteInstrument={deleteInstrument} instrument={instrument} key={i} />
        ))}
      </div>
    </div>
  );
};
