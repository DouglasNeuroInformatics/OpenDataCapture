import React from 'react';

import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';

export type SearchBarProps = Omit<React.ComponentPropsWithoutRef<'input'>, 'type'>;

export const SearchBar = ({ className, placeholder, ...props }: SearchBarProps) => {
  const { t } = useTranslation('common');
  return (
    <input
      className={clsx('block w-full rounded-lg border border-gray-300 px-4 py-3 pl-2 text-sm', className)}
      placeholder={placeholder ?? t('searchBar.placeholder')}
      type="search"
      {...props}
    />
  );
};
