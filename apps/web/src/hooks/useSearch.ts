import { useEffect, useState } from 'react';

type SearchInterface<T> = {
  filteredData: T[];
  searchTerm: string;
  setSearchTerm: (value: string) => void;
};

export function useSearch<T>(data: T[], select: (item: T) => string): SearchInterface<T> {
  const [filteredData, setFilteredData] = useState<T[]>(data);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setFilteredData(data.filter((item) => select(item).toLowerCase().includes(searchTerm.toLowerCase())));
  }, [data, searchTerm]);

  return {
    filteredData,
    searchTerm,
    setSearchTerm
  };
}
