import React from 'react';
import { Button } from '@douglasneuroinformatics/ui';
export var ErrorFallback = function (_a) {
  var error = _a.error;
  return React.createElement(
    'div',
    { className: 'flex h-screen w-screen flex-col items-center justify-center text-red-500', role: 'alert' },
    React.createElement('h2', { className: 'text-3xl font-semibold' }, 'Oops! Something went wrong'),
    React.createElement('p', null, 'Error Message: ', error.message),
    React.createElement(Button, {
      className: 'mt-4',
      label: 'Refresh',
      onClick: function () {
        window.location.assign(window.location.origin);
      }
    })
  );
};
