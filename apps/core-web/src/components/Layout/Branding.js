import React from 'react';
import { useTranslation } from 'react-i18next';
import logo from '@/assets/logo.png';
export var Branding = function () {
  var t = useTranslation().t;
  return React.createElement(
    'div',
    { className: 'flex items-center p-1 md:p-2' },
    React.createElement('img', { alt: 'logo', className: 'mr-2 w-14 md:w-16', src: logo }),
    React.createElement(
      'span',
      { className: 'text-sm uppercase leading-tight antialiased md:text-base', style: { maxWidth: '7.5em' } },
      t('platform.title')
    )
  );
};
