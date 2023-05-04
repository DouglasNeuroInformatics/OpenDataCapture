import React, { useReducer, useState } from 'react';

import { clsx } from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import { CALENDAR_ANIMATION_DURATION, Calendar } from './Calendar';
import { YearSelector } from './YearSelector';

import { ArrowToggle } from '@/components';

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
  onMouseEnter?: React.MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLDivElement>;
}

export const DatePicker = ({ onSelection, ...props }: DatePickerProps) => {
  const [date, dispatch] = useReducer(reducer, new Date());
  const [showYearSelector, setShowYearSelector] = useState(false);
  const { t } = useTranslation('datetime');

  // this is to prevent changing month before prev calendar is unmounted
  const [canSetMonth, setCanSetMonth] = useState(true);

  const monthName = t('months')[date.getMonth()];

  const handleYearSelection = (date: Date) => {
    dispatch({ type: 'set-year', value: date.getFullYear() });
    setShowYearSelector(false);
  };

  return (
    <div className="w-fit bg-slate-50 p-3 shadow-lg" {...props}>
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
            onClick={() => {
              if (canSetMonth) {
                setCanSetMonth(false);
                dispatch({ type: 'decrement' });
                setTimeout(() => setCanSetMonth(true), CALENDAR_ANIMATION_DURATION * 1000);
              }
            }}
          />
          <ArrowToggle
            className="ml-1 flex  items-center justify-center rounded-full p-1 hover:bg-slate-200"
            position="right"
            rotation={0}
            onClick={() => {
              if (canSetMonth) {
                setCanSetMonth(false);
                dispatch({ type: 'increment' });
                setTimeout(() => setCanSetMonth(true), CALENDAR_ANIMATION_DURATION * 1000);
              }
            }}
          />
        </div>
      </div>
      <div>
        <AnimatePresence initial={false} mode="wait">
          {showYearSelector ? (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              initial={{ opacity: 0, y: 10 }}
              key={0}
              transition={{ duration: 0.2 }}
            >
              <YearSelector selected={date} onSelection={handleYearSelection} />
            </motion.div>
          ) : (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              initial={{ opacity: 0, y: -10 }}
              key={1}
              transition={{ duration: 0.2 }}
            >
              <Calendar month={date.getMonth()} year={date.getFullYear()} onSelection={onSelection} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
