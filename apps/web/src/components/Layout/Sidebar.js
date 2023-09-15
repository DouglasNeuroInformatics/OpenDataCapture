import React from 'react';
import { ThemeToggle } from '@douglasneuroinformatics/ui';
import { Branding } from './Branding';
import { Navigation } from './Navigation';
import { UserDropup } from './UserDropup';
export var Sidebar = function () {
  return React.createElement(
    'div',
    {
      className:
        'flex h-screen w-80 flex-col bg-slate-900 p-3 text-slate-300 shadow-lg dark:border-r dark:border-slate-700'
    },
    React.createElement(Branding, null),
    React.createElement('hr', { className: 'my-1' }),
    React.createElement(Navigation, null),
    React.createElement('hr', { className: 'my-1 mt-auto' }),
    React.createElement(
      'div',
      { className: 'flex items-center' },
      React.createElement(UserDropup, null),
      React.createElement(ThemeToggle, { className: 'hover:backdrop-brightness-150' })
    )
  );
};
