import React, { useContext } from 'react';

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { P, match } from 'ts-pattern';

import { Layout, Spinner } from './components';
import { SetupContext } from './context/SetupContext';
import * as AuthModule from './features/auth';
import * as ContactModule from './features/contact';
import * as InstrumentsModule from './features/instruments';
import * as OverviewModule from './features/overview';
import * as SetupModule from './features/setup';
import * as SubjectsModule from './features/subjects';
import * as UserModule from './features/user';
import { useAuthStore } from './stores/auth-store';

/**
 * Generates the app routes dynamically based on:
 * 1. Whether the app is setup
 * 2. Whether the user is logged in
 *
 * Changes in the auth store or setup context will trigger a rerender of this component,
 * that can serve to redirect the user (e.g., after a successful setup or login)
 */
export const Router = () => {
  const { accessToken } = useAuthStore();
  const { isSetup } = useContext(SetupContext);

  return (
    <BrowserRouter>
      {match({ accessToken, isSetup })
        .with({ accessToken: P.string, isSetup: true }, () => (
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<OverviewModule.OverviewPage />} path="overview" />
              <Route element={<ContactModule.ContactPage />} path="contact" />
              <Route element={<UserModule.UserPage />} path="user" />
              <Route path="subjects">
                <Route element={<SubjectsModule.AddVisitPage />} path="add-visit" />
                <Route path="view-subjects">
                  <Route index element={<SubjectsModule.ViewSubjectsPage />} />
                  <Route path=":subjectIdentifier">
                    <Route index element={<SubjectsModule.SelectVisualizationPage />} />
                    <Route element={<SubjectsModule.SubjectRecordsGraphPage />} path="graph" />
                    <Route element={<SubjectsModule.SubjectRecordsTablePage />} path="table" />
                  </Route>
                </Route>
              </Route>
              <Route path="instruments">
                <Route element={<InstrumentsModule.AvailableInstrumentsPage />} path="available" />
                <Route element={<InstrumentsModule.ManageInstrumentsPage />} path="manage" />
                <Route element={<InstrumentsModule.CreateInstrumentPage />} path="create" />
                <Route path="forms">
                  <Route element={<InstrumentsModule.FormPage />} path=":id" />
                </Route>
              </Route>
            </Route>
          </Routes>
        ))
        .with({ accessToken: P.nullish, isSetup: true }, () => (
          <Routes>
            <Route element={<AuthModule.LoginPage />} path="login" />
            <Route element={<Navigate to="login" />} path="*" />
          </Routes>
        ))
        .with({ isSetup: false }, () => (
          <Routes>
            <Route element={<SetupModule.SetupPage />} path="setup" />
            <Route element={<Navigate to="setup" />} path="*" />
          </Routes>
        ))
        .otherwise(() => (
          <div className="flex h-screen items-center justify-center">
            <Spinner />
          </div>
        ))}
    </BrowserRouter>
  );
};
