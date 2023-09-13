import React from 'react';
import { Modal } from '@douglasneuroinformatics/ui';
import { snakeToCamelCase } from '@douglasneuroinformatics/utils';
import { demoUsers } from '@open-data-capture/demo';
import { useTranslation } from 'react-i18next';
export var DemoModal = function (_a) {
  var isOpen = _a.isOpen,
    onClose = _a.onClose;
  var t = useTranslation().t;
  return React.createElement(
    Modal,
    { showCloseButton: true, open: isOpen, title: t('demo.info'), width: 'xl', onClose: onClose },
    React.createElement(
      'div',
      { className: 'my-3' },
      React.createElement('p', { className: 'leading-tight' }, t('demo.summary')),
      React.createElement('h5', { className: 'my-3 text-lg font-semibold' }, t('demo.loginCredentials')),
      demoUsers.map(function (user) {
        var role = t('basePermissionLevel.'.concat(snakeToCamelCase(user.basePermissionLevel)));
        return React.createElement(
          'div',
          { className: 'my-3 leading-tight', key: user.username },
          React.createElement('p', null, t('demo.username', { value: user.username })),
          React.createElement('p', null, t('demo.password', { value: user.password })),
          React.createElement('p', null, t('demo.role', { value: role })),
          React.createElement('p', null, t('demo.groups', { value: user.groupNames.join(', ') }))
        );
      })
    )
  );
};
