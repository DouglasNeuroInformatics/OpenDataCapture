import React from 'react';
import { useTranslation } from 'react-i18next';
import { HiPencilSquare } from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';
export var InstrumentCard = function (_a) {
  var instrument = _a.instrument;
  var navigate = useNavigate();
  var t = useTranslation().t;
  var handleClick = function () {
    navigate('../forms/'.concat(instrument.identifier));
  };
  return React.createElement(
    'div',
    {
      className:
        'relative transition-all duration-300 ease-in-out hover:scale-[1.03] hover:cursor-pointer hover:shadow-lg',
      role: 'button',
      tabIndex: 0,
      onClick: handleClick,
      onKeyDown: handleClick
    },
    React.createElement(
      'div',
      {
        className:
          'flex flex-col rounded-lg border-2 border-slate-200 border-opacity-50 p-8 dark:border-slate-700 sm:flex-row'
      },
      React.createElement(
        'div',
        {
          className:
            'mb-4 inline-flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-500 sm:mb-0 sm:mr-8'
        },
        React.createElement(HiPencilSquare, { className: 'h-8 w-8' })
      ),
      React.createElement(
        'div',
        { className: 'flex-grow' },
        React.createElement(
          'h3',
          { className: 'title-font mb-1 text-lg font-semibold text-slate-900 dark:text-slate-100' },
          instrument.details.title
        ),
        React.createElement(
          'h5',
          { className: 'mb-2 text-slate-600 dark:text-slate-300' },
          ''.concat(t('instruments.availableInstruments.filters.tags'), ': ').concat(instrument.tags.join(', '))
        ),
        React.createElement(
          'p',
          { className: 'text-sm leading-relaxed text-slate-600 dark:text-slate-300' },
          instrument.details.description
        )
      )
    )
  );
};
