import React from 'react';
export var Spinner = function () {
  return React.createElement(
    'div',
    { className: 'flex h-full w-full items-center justify-center' },
    React.createElement('span', { className: 'spinner' })
  );
};
