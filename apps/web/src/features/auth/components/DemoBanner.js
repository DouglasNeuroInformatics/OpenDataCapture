import React, { useState } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { DemoModal } from './DemoModal';
export var DemoBanner = function () {
  var t = useTranslation().t;
  var _a = useState(false),
    isModalOpen = _a[0],
    setIsModalOpen = _a[1];
  var openModal = function () {
    setIsModalOpen(true);
  };
  var closeModal = function () {
    setIsModalOpen(false);
  };
  return React.createElement(
    React.Fragment,
    null,
    React.createElement(
      'div',
      { className: 'flex w-full items-center justify-center bg-sky-700 text-sky-100' },
      React.createElement(
        'div',
        { className: 'container py-2' },
        React.createElement(
          'div',
          { className: 'flex flex-col items-center justify-between lg:flex-row' },
          React.createElement(
            'div',
            { className: 'my-1 flex items-center gap-3' },
            React.createElement(InformationCircleIcon, { className: 'hidden h-6 w-6 lg:block' }),
            React.createElement(
              'p',
              { className: 'text-center font-medium text-slate-100 lg:text-left' },
              t('demo.welcome')
            )
          ),
          React.createElement(
            'button',
            {
              className:
                'my-1 w-full rounded-lg border border-sky-400 px-3 py-1.5 hover:bg-sky-600 hover:shadow-lg lg:w-auto',
              type: 'button',
              onClick: openModal
            },
            t('learnMore')
          )
        )
      )
    ),
    React.createElement(DemoModal, { isOpen: isModalOpen, onClose: closeModal })
  );
};
