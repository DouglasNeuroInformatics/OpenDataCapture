import React from 'react';

import { range } from 'common';
import { useTranslation } from 'react-i18next';

export interface CalendarProps {
  year: number;
  month: number;
  onSelection: (date: Date) => void;
}

export const Calendar = ({ year, month, onSelection }: CalendarProps) => {
  const { t } = useTranslation();

  const dayNames = t('datetime.days').map((day) => day.charAt(0).toUpperCase());
  const firstDay = new Date(year, month).getDay();
  const lastDay = new Date(year, month + 1, 0).getDate();
  const days = range(1, lastDay + 1);

  return (
    <div className="grid w-72 grid-cols-7 gap-4">
      {dayNames.map((name, i) => (
        <div className="flex items-center justify-center" key={i}>
          {name}
        </div>
      ))}
      <div style={{ gridColumn: `span ${firstDay} / span ${firstDay}` }} />
      {days.map((day) => (
        <button
          className="flex h-8 w-8 items-center justify-center rounded-full text-sm hover:bg-slate-200"
          key={day}
          type="button"
          onClick={() => onSelection(new Date(year, month, day))}
        >
          {day}
        </button>
      ))}
    </div>
  );
};
