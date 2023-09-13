import React from 'react';
import { NotificationHub } from '@douglasneuroinformatics/ui';
import { ErrorBoundary } from 'react-error-boundary';
import { Router } from './Router';
import { ActiveSubject } from '@/components';
import { SetupContextProvider } from '@/context/SetupContext';
import { ErrorFallback, SuspenseFallback } from '@/features/misc';
import './services/i18n';
import './services/axios';
export var App = function () {
  return React.createElement(
    React.Suspense,
    { fallback: React.createElement(SuspenseFallback, null) },
    React.createElement(
      ErrorBoundary,
      { FallbackComponent: ErrorFallback },
      React.createElement(
        SetupContextProvider,
        null,
        React.createElement(ActiveSubject, null),
        React.createElement(NotificationHub, null),
        React.createElement(Router, null)
      )
    )
  );
};
