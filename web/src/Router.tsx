import React, { useState } from 'react';

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { Layout } from './components';
import * as AuthModule from './features/auth';
import * as ContactModule from './features/contact';
import * as InstrumentsModule from './features/instruments';
import * as OverviewModule from './features/overview/pages/OverviewPage';
import * as SubjectsModule from './features/subjects';
import * as UserModule from './features/user';
import { useAuthStore } from './stores/auth-store';

export const Router = () => {
  const { accessToken } = useAuthStore();
  const [isSetup, setIsSetup] = useState<boolean | null>(null);

  
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthModule.LoginPage />} path="login" />
        {accessToken ? (
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
        ) : (
          <Route element={<Navigate to="login" />} path="*" />
        )}
      </Routes>
    </BrowserRouter>
  );
};
