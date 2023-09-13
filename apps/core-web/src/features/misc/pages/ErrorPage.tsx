import React from 'react';

import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

type ErrorInfo = {
  code?: number;
  message: string;
};

export const ErrorPage = () => {
  const error = useRouteError();
  const errorInfo: Partial<ErrorInfo> = {};

  if (isRouteErrorResponse(error)) {
    (errorInfo.code = error.status), (errorInfo.message = error.statusText);
  } else if (error instanceof Error) {
    errorInfo.message = error.message;
  } else {
    errorInfo.message = 'An unknown error occurred';
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h1>Oops!</h1>
      <h3>{`${errorInfo.code ? errorInfo.code.toString() + ' | ' : ''} ${errorInfo.message}`}</h3>
    </div>
  );
};
