import React from 'react';

import { ListboxDropdown } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { Language } from '@opendatacapture/runtime-core';

export type InstrumentShowcaseLanguageOption = {
  key: Language;
  label: string;
};

export const InstrumentLanguageDropdown: React.FC<{
  selected: InstrumentShowcaseLanguageOption[];
  setSelected: React.Dispatch<React.SetStateAction<InstrumentShowcaseLanguageOption[]>>;
}> = ({ selected, setSelected }) => {
  const { t } = useTranslation();
  return (
    <ListboxDropdown
      widthFull
      options={[
        {
          key: 'en',
          label: t('core.languages.english')
        },
        {
          key: 'fr',
          label: t('core.languages.french')
        }
      ]}
      selected={selected}
      setSelected={setSelected}
      title={t('core.language')}
    />
  );
};
