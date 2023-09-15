import React from 'react';
import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
export var ErrorPage = function () {
  var error = useRouteError();
  var errorInfo = {};
  if (isRouteErrorResponse(error)) {
    (errorInfo.code = error.status), (errorInfo.message = error.statusText);
  } else if (error instanceof Error) {
    errorInfo.message = error.message;
  } else {
    errorInfo.message = 'An unknown error occurred';
  }
  return React.createElement(
    'div',
    { className: 'flex h-screen flex-col items-center justify-center' },
    React.createElement('h1', null, 'Oops!'),
    React.createElement(
      'h3',
      null,
      ''.concat(errorInfo.code ? errorInfo.code.toString() + ' | ' : '', ' ').concat(errorInfo.message)
    )
  );
};
