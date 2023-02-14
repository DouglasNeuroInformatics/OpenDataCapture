import React, { useReducer, useState } from 'react';

import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';

import { ArrowToggle } from '../ArrowToggle';

import { Calendar } from './Calendar';
import { YearSelector } from './YearSelector';

import { TransitionOpacity } from '@/components/transitions';

interface IncrementAction {
  type: 'increment';
}

interface DecrementAction {
  type: 'decrement';
}

interface SetYearAction {
  type: 'set-year';
  value: number;
}

type ReducerAction = IncrementAction | DecrementAction | SetYearAction;

const reducer = (previousDate: Date, action: ReducerAction) => {
  const newDate = new Date(previousDate.valueOf());
  switch (action.type) {
    case 'increment':
      newDate.setMonth(newDate.getMonth() + 1);
      break;
    case 'decrement':
      newDate.setMonth(newDate.getMonth() - 1);
      break;
    case 'set-year':
      newDate.setFullYear(action.value);
  }
  return newDate;
};

export interface DatePickerProps {
  onSelection: (value: Date) => void;
}

export const DatePicker = ({ onSelection }: DatePickerProps) => {
  const [date, dispatch] = useReducer(reducer, new Date());
  const [showYearSelector, setShowYearSelector] = useState(false);
  const { t } = useTranslation();

  const monthName = t('datetime.months')[date.getMonth()];

  const handleYearSelection = (date: Date) => {
    dispatch({ type: 'set-year', value: date.getFullYear() });
    setShowYearSelector(false);
  };

  return (
    <div className="w-fit bg-slate-50 p-3 shadow-lg">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex">
          <span className="font-semibold">{`${monthName} ${date.getFullYear()}`}</span>
          <ArrowToggle
            className="mx-1 flex items-center justify-center rounded-full p-1 hover:bg-slate-200"
            position="up"
            rotation={180}
            onClick={() => setShowYearSelector(!showYearSelector)}
          />
        </div>
        <div className={clsx('flex', { hidden: showYearSelector })}>
          <ArrowToggle
            className="mx-1 flex items-center justify-center rounded-full p-1 hover:bg-slate-200"
            position="left"
            rotation={0}
            onClick={() => dispatch({ type: 'decrement' })}
          />
          <ArrowToggle
            className="ml-1 flex  items-center justify-center rounded-full p-1 hover:bg-slate-200"
            position="right"
            rotation={0}
            onClick={() => dispatch({ type: 'increment' })}
          />
        </div>
      </div>
      <TransitionOpacity show={!showYearSelector}>
        <Calendar month={date.getMonth()} year={date.getFullYear()} onSelection={onSelection} />
      </TransitionOpacity>
      <TransitionOpacity show={showYearSelector}>
        <YearSelector currentDate={date} onSelection={handleYearSelection} />
      </TransitionOpacity>
    </div>
  );
};
