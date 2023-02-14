import React from 'react';

import { clsx } from 'clsx';
import { range } from 'common';

export interface YearSelectorProps {
  currentDate: Date;
  onSelection: (date: Date) => void;
}

export const YearSelector = ({ currentDate, onSelection }: YearSelectorProps) => {
  const years = range(currentDate.getFullYear() - 10, currentDate.getFullYear() + 11);
  return (
    <div className="grid w-72 grid-cols-3 gap-4">
      {years.map((year) => (
        <button
          className={clsx('rounded-full p-2 hover:bg-indigo-200', {
            'bg-indigo-800 text-white': year === currentDate.getFullYear()
          })}
          key={year}
          onClick={() => onSelection(new Date(year, 0))}
        >
          {year}
        </button>
      ))}
    </div>
  );
};
