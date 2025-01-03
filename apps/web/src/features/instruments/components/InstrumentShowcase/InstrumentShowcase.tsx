import { useEffect, useState } from 'react';

import { SearchBar } from '@douglasneuroinformatics/libui/components';
import type { TranslatedInstrumentInfo } from '@opendatacapture/schemas/instrument';
import { AnimatePresence, motion } from 'motion/react';

import { InstrumentCard } from '../InstrumentCard';

export const InstrumentShowcase: React.FC<{
  data: TranslatedInstrumentInfo[];
  onSelect: (instrument: TranslatedInstrumentInfo) => void;
}> = ({ data: availableInstruments, onSelect }) => {
  const [filteredInstruments, setFilteredInstruments] = useState<TranslatedInstrumentInfo[]>(availableInstruments);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setFilteredInstruments(
      availableInstruments.filter((instrument) => {
        const matchesSearch = instrument.details.title.toUpperCase().includes(searchTerm.toUpperCase());
        return matchesSearch;
      })
    );
  }, [availableInstruments, searchTerm]);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <SearchBar className="flex-grow" value={searchTerm} onValueChange={setSearchTerm} />
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
