import React, { useEffect, useMemo, useState } from 'react';

import { FormInstrumentSummary, Language } from '@ddcp/common';
import { animated, useTrail } from '@react-spring/web';
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

  const filteredInstruments = useMemo(() => {
    return instruments.filter((instrument) => {
      const matchesSearch = instrument.details.title.toUpperCase().includes(searchTerm.toUpperCase());
      const matchesLanguages =
        selectedLanguages.length === 0 || selectedLanguages.includes(instrument.details.language);
      const matchesTags = selectedTags.length === 0 || instrument.tags.some((tag) => selectedTags.includes(tag));
      return matchesSearch && matchesLanguages && matchesTags;
    });
  }, [instruments, searchTerm, selectedLanguages, selectedTags]);

  const [trails, api] = useTrail(
    filteredInstruments.length,
    (index) => ({
      config: { tension: 280, friction: 60 },
      from: {
        opacity: 0,
        y: 80
      },
      to: {
        opacity: 1,
        y: 0
      },
      reset: true
    }),
    [filteredInstruments]
  );

  const languageOptions = Array.from(new Set(instruments.map((item) => item.details.language))).map((item) => ({
    key: item,
    label: t(`common:languages.${item}`)
  }));

  const tagOptions = Array.from(new Set(instruments.flatMap((item) => item.tags))).map((item) => ({
    key: item,
    label: item
  }));

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
      <div className="relative grid grid-cols-1 gap-5">
        {trails.map((style, i) => (
          <animated.div key={i} style={style}>
            <InstrumentCard deleteInstrument={deleteInstrument} instrument={filteredInstruments[i]} />
          </animated.div>
        ))}
      </div>
    </div>
  );
};
