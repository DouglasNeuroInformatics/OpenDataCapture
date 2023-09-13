import React from 'react';
import { Button, Modal } from '@douglasneuroinformatics/ui';
import { useTranslation } from 'react-i18next';
import { useDisclaimerStore } from '../stores/disclaimer-store';
import { useAuthStore } from '@/stores/auth-store';
export var Disclaimer = function (_a) {
  var _b = _a.isRequired,
    isRequired = _b === void 0 ? import.meta.env.PROD : _b;
  var _c = useAuthStore(),
    currentUser = _c.currentUser,
    logout = _c.logout;
  var _d = useDisclaimerStore(),
    isAccepted = _d.isAccepted,
    username = _d.username,
    setIsAccepted = _d.setIsAccepted;
  var t = useTranslation().t;
  var handleClose = function () {
    setIsAccepted(true, currentUser.username);
  };
  var show =
    (!isAccepted || (currentUser === null || currentUser === void 0 ? void 0 : currentUser.username) !== username) &&
    isRequired;
  return React.createElement(
    Modal,
    { open: show, title: t('disclaimer.title'), onClose: handleClose },
    React.createElement('p', null, t('disclaimer.message')),
    React.createElement(
      'div',
      { className: 'mt-3 flex' },
      React.createElement(Button, {
        className: 'mr-2',
        label: t('disclaimer.accept'),
        size: 'sm',
        onClick: handleClose
      }),
      React.createElement(Button, {
        label: t('disclaimer.decline'),
        size: 'sm',
        variant: 'secondary',
        onClick: function () {
          logout();
        }
      })
    )
  );
};
