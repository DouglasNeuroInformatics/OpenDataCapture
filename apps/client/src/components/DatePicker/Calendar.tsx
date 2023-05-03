import React from 'react';

import { range } from '@douglasneuroinformatics/common';
import { useTranslation } from 'react-i18next';

export interface CalendarProps {
  year: number;
  month: number;
  onSelection: (date: Date) => void;
}

export const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(function Calendar(props, ref) {
  const { t } = useTranslation('datetime');

  const dayNames = t('days').map((day) => day.charAt(0).toUpperCase());
  const firstDay = new Date(props.year, props.month).getDay();
  const lastDay = new Date(props.year, props.month + 1, 0).getDate();
  const days = range(1, lastDay + 1);

  return (
    <div className="grid w-72 grid-cols-7 gap-4" ref={ref}>
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
          onClick={() => props.onSelection(new Date(props.year, props.month, day))}
        >
          {day}
        </button>
      ))}
    </div>
  );
});
