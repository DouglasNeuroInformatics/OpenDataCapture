import React from 'react';

import { ErrorBoundary } from 'react-error-boundary';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { ActiveSubject, Notifications } from '@/components/core';
import { LoginPage } from '@/features/auth';
import { ErrorFallback, HomePage, SuspenseFallback } from '@/features/misc';
import { useAuthStore } from '@/stores/auth-store';

import './services/axios';
import './services/18n';

export const App = () => {
  const auth = useAuthStore();
  return (
    <React.Suspense fallback={<SuspenseFallback />}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <ActiveSubject />
        <Notifications />
        <BrowserRouter>
          <Routes>
            <Route element={<LoginPage />} path="login" />
            {auth.accessToken ? (
              <>
                <Route index element={<HomePage />} path="/home" />
              </>
            ) : (
              <Route element={<Navigate to="login" />} path="*" />
            )}
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </React.Suspense>
  );
};

