import React from 'react';

import { range } from '@douglasneuroinformatics/common';
import { clsx } from 'clsx';

export interface YearSelectorProps {
  currentDate: Date;
  onSelection: (date: Date) => void;
}

export const YearSelector = ({ currentDate, onSelection }: YearSelectorProps) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from(range(currentYear - 100, currentYear + 8)).reverse();
  return (
    <div className="h mt-4 grid h-96 w-72 grid-cols-3 gap-4 overflow-y-scroll">
      {years.map((year) => (
        <div className="flex h-12 items-center justify-center" key={year}>
          <button
            className={clsx('rounded-full p-2 hover:bg-indigo-200', {
              'bg-indigo-800 text-white': year === currentDate.getFullYear()
            })}
            type="button"
            onClick={() => onSelection(new Date(year, 0))}
          >
            {year}
          </button>
        </div>
      ))}
    </div>
  );
};
