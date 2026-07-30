import React, { useCallback, useEffect, useRef, useState } from 'react';

import { ListboxDropdown, SearchBar } from '@douglasneuroinformatics/libui/components';
import type { ListboxDropdownOption } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { TranslatedInstrumentInfo } from '@opendatacapture/schemas/instrument';
import { AnimatePresence, motion } from 'motion/react';

import { InstrumentCard } from '../InstrumentCard';
import { InstrumentKindDropdown } from './InstrumentKindDropdown';
import { InstrumentLanguageDropdown } from './InstrumentLanguageDropdown';

import type { InstrumentShowcaseKindOption } from './InstrumentKindDropdown';
import type { InstrumentShowcaseLanguageOption } from './InstrumentLanguageDropdown';

export const InstrumentShowcase: React.FC<{
  data: TranslatedInstrumentInfo[];
  onSelect: (instrument: TranslatedInstrumentInfo) => void;
}> = ({ data: availableInstruments, onSelect }) => {
  const { t } = useTranslation();
  const [filteredInstruments, setFilteredInstruments] = useState<TranslatedInstrumentInfo[]>(
    availableInstruments.toSorted((a, b) => a.details.title.localeCompare(b.details.title))
  );
  const [tagOptions, setTagOptions] = useState<ListboxDropdownOption[]>([]);
  const [selectedKinds, setSelectedKinds] = useState<InstrumentShowcaseKindOption[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<InstrumentShowcaseLanguageOption[]>([]);
  const [selectedTags, setSelectedTags] = useState<ListboxDropdownOption[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const updatedFilteredInstruments = availableInstruments.filter(({ details, kind, supportedLanguages, tags }) => {
      if (selectedKinds.length && !selectedKinds.some(({ key }) => key === kind)) {
        return false;
      } else if (selectedLanguages.length && !selectedLanguages.some(({ key }) => supportedLanguages.includes(key))) {
        return false;
      } else if (selectedTags.length && !selectedTags.some(({ key }) => tags.includes(key))) {
        return false;
      }
      return (
        details.title.toUpperCase().includes(searchTerm.toUpperCase()) ||
        tags.join(', ').toUpperCase().includes(searchTerm.toUpperCase())
      );
    });
    updatedFilteredInstruments.sort((a, b) => {
      return a.details.title.localeCompare(b.details.title);
    });
    setFilteredInstruments(updatedFilteredInstruments);
    setHighlightedIndex(0);
  }, [availableInstruments, selectedKinds, selectedLanguages, selectedTags, searchTerm]);

  useEffect(() => {
    setTagOptions(
      Array.from(new Set(filteredInstruments.flatMap((item) => item.tags)))
        .map((item) => ({
          key: item,
          label: item
        }))
        .sort((a, b) => a.label.localeCompare(b.label))
    );
  }, [availableInstruments]);

  useEffect(() => {
    if (highlightedIndex < 0 || !listRef.current) return;
    const items = listRef.current.querySelectorAll<HTMLElement>('[data-instrument-index]');
    items[highlightedIndex]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [highlightedIndex]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter') {
        // The SearchBar is a bare <input> inside a <form>; without preventDefault the Enter keypress
        // submits that form, reloading the app and dropping the user back at the login page.
        event.preventDefault();
        const instrument = filteredInstruments[highlightedIndex];
        if (instrument) {
          onSelect(instrument);
        }
        return;
      }
      if (filteredInstruments.length === 0) return;
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setHighlightedIndex((prev) => Math.min(prev + 1, filteredInstruments.length - 1));
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setHighlightedIndex((prev) => Math.max(prev - 1, 0));
      }
    },
    [filteredInstruments, highlightedIndex, onSelect]
  );

  return (
    <div
      className="flex flex-col gap-5"
      data-testid="instrument-showcase"
      role="toolbar"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-center gap-2.5">
        <SearchBar
          className="grow"
          data-testid="instrument-search-bar"
          value={searchTerm}
          onValueChange={setSearchTerm}
        />
        <div className="flex items-center gap-2.5">
          <div data-testid="instrument-kind-filter">
            <InstrumentKindDropdown selected={selectedKinds} setSelected={setSelectedKinds} />
          </div>
          <div data-testid="instrument-tag-filter">
            <ListboxDropdown
              widthFull
              options={tagOptions}
              selected={selectedTags}
              setSelected={setSelectedTags}
              title={t('core.tags')}
            />
          </div>
          <div data-testid="instrument-language-filter">
            <InstrumentLanguageDropdown selected={selectedLanguages} setSelected={setSelectedLanguages} />
          </div>
        </div>
      </div>
      <ul className="flex flex-col gap-5" ref={listRef}>
        <AnimatePresence mode="popLayout">
          {filteredInstruments.map((instrument, i) => {
            return (
              <motion.li
                layout
                animate={{ opacity: 1, y: 0 }}
                data-instrument-index={i}
                exit={{ opacity: 0, y: 80 }}
                initial={{ opacity: 0, y: 80 }}
                key={instrument.id}
                transition={{ bounce: 0.2, delay: 0.15 * i, duration: 1.5, type: 'spring' }}
              >
                <InstrumentCard
                  highlighted={i === highlightedIndex}
                  instrument={instrument}
                  onClick={() => onSelect(instrument)}
                />
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </div>
  );
};
