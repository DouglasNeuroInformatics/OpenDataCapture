import React, { useState } from 'react';

import { HiArrowLeft, HiArrowRight } from 'react-icons/hi';

import { PaginationButton } from './PaginationButton';

export interface TableColumn<T> {
  title: string;
  field: keyof T;
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
}

export const Table = <T extends Record<string, string | number | Date>>({ data, columns }: TableProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;

  const currentEntries = data.slice(indexOfFirstEntry, indexOfLastEntry);

  const pageCount = Math.ceil(data.length / entriesPerPage);

  const pageNumbers = [...Array(pageCount).keys()].map((i) => i + 1);
  console.log(currentEntries, pageCount);

  return (
    <div className="h-full p-3">
      <table className="divide-y divide-slate-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th
                className="whitespace-nowrap px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-slate-500"
                key={index}
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="overflow-scroll">
          {currentEntries.map((entry, entryIndex) => (
            <tr className="odd:bg-white even:bg-slate-100" key={entryIndex}>
              {columns.map(({ field, title }, columnIndex) => {
                return (
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium" key={title + columnIndex}>
                    <span>{entry[field].toString()}</span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="my-3 flex">
        <PaginationButton>
          <HiArrowLeft />
        </PaginationButton>
        {pageNumbers.map((page) => (
          <PaginationButton active={currentPage === page} className="mx-1" onClick={() => setCurrentPage(page)}>
            {page}
          </PaginationButton>
        ))}
        <PaginationButton>
          <HiArrowRight />
        </PaginationButton>
      </div>
    </div>
  );
};
