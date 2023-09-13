import React from 'react';
import { Button, Modal } from '@douglasneuroinformatics/ui';
import { useTranslation } from 'react-i18next';
export var ArchiveInstrumentModal = function (_a) {
  var isOpen = _a.isOpen,
    setIsOpen = _a.setIsOpen,
    instrument = _a.instrument,
    onArchive = _a.onArchive;
  var t = useTranslation().t;
  return React.createElement(
    Modal,
    {
      open: isOpen,
      title: t('instruments.manageInstruments.deleteModal.title'),
      onClose: function () {
        setIsOpen(false);
      }
    },
    React.createElement(
      'div',
      null,
      React.createElement(
        'span',
        { className: 'block' },
        t('instruments.manageInstruments.deleteModal.name'),
        ': ',
        instrument.name
      ),
      React.createElement(
        'span',
        { className: 'block' },
        t('instruments.manageInstruments.deleteModal.language'),
        ': ',
        instrument.details.language
      ),
      React.createElement(
        'span',
        { className: 'block' },
        t('instruments.manageInstruments.deleteModal.version'),
        ': ',
        instrument.version
      )
    ),
    React.createElement(
      'div',
      { className: 'mt-5 flex gap-3' },
      React.createElement(Button, {
        label: t('instruments.manageInstruments.deleteModal.delete'),
        type: 'button',
        variant: 'danger',
        onClick: function () {
          setIsOpen(false);
          void onArchive(instrument);
        }
      }),
      React.createElement(Button, {
        label: t('instruments.manageInstruments.deleteModal.cancel'),
        type: 'button',
        variant: 'secondary',
        onClick: function () {
          setIsOpen(false);
        }
      })
    )
  );
};
