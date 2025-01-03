import { ListboxDropdown } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';

import type { InstrumentShowcaseKindOption } from './types';

export const InstrumentKindDropdown: React.FC<{
  selected: InstrumentShowcaseKindOption[];
  setSelected: React.Dispatch<React.SetStateAction<InstrumentShowcaseKindOption[]>>;
}> = ({ selected, setSelected }) => {
  const { t } = useTranslation();
  return (
    <ListboxDropdown
      widthFull
      options={
        [
          {
            key: 'FORM',
            label: t({
              en: 'Form',
              fr: 'Formulaire'
            })
          },
          {
            key: 'INTERACTIVE',
            label: t({
              en: 'Interactive',
              fr: 'Interactif'
            })
          },
          {
            key: 'SERIES',
            label: 'Series'
          }
        ] satisfies InstrumentShowcaseKindOption[]
      }
      selected={selected}
      setSelected={setSelected}
      title={t({
        en: 'Kind',
        fr: 'Genre'
      })}
    />
  );
};
