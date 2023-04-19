import React, { useState } from 'react';

import { DateUtils } from '@douglasneuroinformatics/common';
import { clsx } from 'clsx';
import { HiArrowLeft, HiArrowRight } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

function formatValue(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  } else if (typeof value === 'number') {
    return value.toFixed(2).toString();
  } else if (typeof value === 'undefined') {
    return 'NA';
  }

  if (value instanceof Date) {
    return DateUtils.toBasicISOString(value);
  }

  return JSON.stringify(value);
}

export interface TableColumn<T> {
  name: string;
  field: keyof T | ((entry: T) => unknown);
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  entryLinkFactory?: (entry: T) => string;
}

export const Table = <T extends Record<PropertyKey, unknown>>({ columns, data, entryLinkFactory }: TableProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const navigate = useNavigate();

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;

  const currentEntries = data.slice(indexOfFirstEntry, indexOfLastEntry);
  const pageCount = Math.ceil(data.length / entriesPerPage);
  const pageNumbers = [...Array(pageCount).keys()].map((i) => i + 1);

  return (
    <div>
      <div className="scrollbar-hidden overflow-x-scroll">
        <table className="relative w-full table-auto border">
          <thead>
            <tr>
              {columns.map((column, i) => (
                <th className="whitespace-nowrap px-6 py-3 text-left" key={i}>
                  {column.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentEntries.map((entry, i) => (
              <tr
                className="odd:bg-slate-100 hover:bg-zinc-200"
                key={i}
                onClick={() => {
                  if (!entryLinkFactory) {
                    return;
                  }
                  navigate(entryLinkFactory(entry));
                }}
              >
                {columns.map(({ field }, j) => {
                  const value = typeof field === 'function' ? field(entry) : entry[field];
                  return (
                    <td className="whitespace-nowrap px-6 py-3" key={j}>
                      <span>{formatValue(value)}</span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mb-2 mt-6 flex justify-center">
        <button className="flex h-8 w-8 items-center justify-center rounded-full border">
          <HiArrowLeft />
        </button>
        {pageNumbers.map((page) => (
          <button
            className={clsx('mx-1 flex h-8 w-8 items-center justify-center rounded-full border', {
              'bg-slate-600 text-slate-100': currentPage === page,
              'hover:bg-slate-200': currentPage !== page
            })}
            key={page}
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </button>
        ))}
        <button className="flex h-8 w-8 items-center justify-center rounded-full border">
          <HiArrowRight />
        </button>
      </div>
    </div>
  );
};
