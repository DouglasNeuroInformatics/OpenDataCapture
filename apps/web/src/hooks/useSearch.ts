import { useEffect, useState } from 'react';

import type { ConditionalKeys } from 'type-fest';

type SearchInterface<T> = {
  filteredData: T[];
  searchTerm: string;
  setSearchTerm: (value: string) => void;
};

type SearchSelectFn<T> = (item: T) => string;

export function useSearch<T extends { [key: string]: any }>(
  data: T[],
  key: Extract<ConditionalKeys<T, string>, string>
): SearchInterface<T>;

export function useSearch<T extends { [key: string]: any }>(data: T[], select: SearchSelectFn<T>): SearchInterface<T>;

export function useSearch<T extends { [key: string]: any }>(
  data: T[],
  selectOrKey: Extract<ConditionalKeys<T, string>, string> | SearchSelectFn<T>
) {
  const [filteredData, setFilteredData] = useState<T[]>(data);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setFilteredData(
      data.filter((item) => {
        const searchItem = (typeof selectOrKey === 'string' ? item[selectOrKey] : selectOrKey(item)) as string;
        return searchItem.toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  }, [data, searchTerm]);

  return {
    filteredData,
    searchTerm,
    setSearchTerm
  };
}
