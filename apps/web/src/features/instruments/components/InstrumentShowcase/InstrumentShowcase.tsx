import { useEffect, useState } from 'react';

import { ListboxDropdown, type ListboxDropdownOption, SearchBar } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { TranslatedInstrumentInfo } from '@opendatacapture/schemas/instrument';
import { AnimatePresence, motion } from 'motion/react';

import { InstrumentCard } from '../InstrumentCard';
import { InstrumentKindDropdown } from './InstrumentKindDropdown';
import { InstrumentLanguageDropdown, type InstrumentShowcaseLanguageOption } from './InstrumentLanguageDropdown';

import type { InstrumentShowcaseKindOption } from './InstrumentKindDropdown';

export const InstrumentShowcase: React.FC<{
  data: TranslatedInstrumentInfo[];
  onSelect: (instrument: TranslatedInstrumentInfo) => void;
}> = ({ data: availableInstruments, onSelect }) => {
  const { t } = useTranslation();
  const [filteredInstruments, setFilteredInstruments] = useState<TranslatedInstrumentInfo[]>(availableInstruments);
  const [tagOptions, setTagOptions] = useState<ListboxDropdownOption[]>([]);
  const [selectedKinds, setSelectedKinds] = useState<InstrumentShowcaseKindOption[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<InstrumentShowcaseLanguageOption[]>([]);
  const [selectedTags, setSelectedTags] = useState<ListboxDropdownOption[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setFilteredInstruments(
      availableInstruments.filter((instrument) => {
        if (selectedKinds.length && !selectedKinds.some(({ key }) => key === instrument.kind)) {
          return false;
        } else if (selectedTags.length && !selectedTags.some(({ key }) => instrument.tags.includes(key))) {
          return false;
        }
        return instrument.details.title.toUpperCase().includes(searchTerm.toUpperCase());
      })
    );
  }, [availableInstruments, selectedKinds, selectedTags, searchTerm]);

  useEffect(() => {
    setTagOptions(
      Array.from(new Set(filteredInstruments.flatMap((item) => item.tags))).map((item) => ({
        key: item,
        label: item
      }))
    );
  }, [availableInstruments]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2.5">
        <SearchBar className="flex-grow" value={searchTerm} onValueChange={setSearchTerm} />
        <div className="flex items-center gap-2.5">
          <InstrumentKindDropdown selected={selectedKinds} setSelected={setSelectedKinds} />
          <ListboxDropdown
            widthFull
            options={tagOptions}
            selected={selectedTags}
            setSelected={setSelectedTags}
            title={t('core.tags')}
          />
          <InstrumentLanguageDropdown selected={selectedLanguages} setSelected={setSelectedLanguages} />
        </div>
      </div>
      <ul className="flex flex-col gap-5">
        <AnimatePresence mode="popLayout">
          {filteredInstruments.map((instrument, i) => {
            return (
              <motion.li
                layout
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 80 }}
                initial={{ opacity: 0, y: 80 }}
                key={instrument.id}
                transition={{ bounce: 0.2, delay: 0.15 * i, duration: 1.5, type: 'spring' }}
              >
                <InstrumentCard instrument={instrument} onClick={() => onSelect(instrument)} />
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </div>
  );
};
