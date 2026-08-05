import { LanguageToggle as BaseLanguageToggle } from '@douglasneuroinformatics/libui/components';
import type { LanguageToggleProps as BaseLanguageToggleProps } from '@douglasneuroinformatics/libui/components';
import type { ActiveLanguages } from '@opendatacapture/schemas/core';

import { useLanguageOptions } from '../../hooks/useLanguageOptions';

export type LanguageToggleProps = Omit<BaseLanguageToggleProps, 'options'> & {
  activeLanguages: ActiveLanguages;
};

/**
 * libui's language toggle, offering the languages this instance has turned on. It renders nothing
 * when only one is active — a control whose every use is a no-op is noise, and hiding it is what
 * makes deactivating every language but one a coherent setting rather than a broken menu.
 */
export const LanguageToggle = ({ activeLanguages, ...props }: LanguageToggleProps) => {
  const options = useLanguageOptions(activeLanguages);
  if (activeLanguages.length < 2) {
    return null;
  }
  return <BaseLanguageToggle options={options} {...props} />;
};
