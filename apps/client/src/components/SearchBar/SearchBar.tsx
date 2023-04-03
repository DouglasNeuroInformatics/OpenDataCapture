import React, { HTMLProps } from 'react';

import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';

export type SearchBarProps = Omit<HTMLProps<HTMLInputElement>, 'type'>;

export const SearchBar = ({ className, required = true, placeholder, ...props }: SearchBarProps) => {
  const { t } = useTranslation('common');
  return (
    <input
      className={clsx('block w-full rounded-lg border border-gray-300 px-4 py-3 pl-2 text-sm', className)}
      placeholder={placeholder ?? t('searchBar.placeholder')}
      required={required}
      type="search"
      {...props}
    />
  );
};
