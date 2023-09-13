import React from 'react';
import { Spinner } from '@/components';
export var SuspenseFallback = function () {
  return React.createElement(
    'div',
    { className: 'flex h-screen w-screen items-center justify-center' },
    React.createElement(Spinner, null)
  );
};
