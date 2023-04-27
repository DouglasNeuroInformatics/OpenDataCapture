import React from 'react';

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { Layout } from './components';
import { LoginPage } from './features/auth';
import { ContactPage } from './features/contact';
import {
  AvailableInstrumentsPage,
  CreateInstrumentPage,
  FormPage,
  ManageInstrumentsPage
} from './features/instruments';
import { OverviewPage } from './features/overview/pages/OverviewPage';
import { AddSubjectPage, SubjectPage, SubjectRecordsPage, ViewSubjectsPage } from './features/subjects';
import { UserPage } from './features/user';
import { useAuthStore } from './stores/auth-store';

export const Router = () => {
  const { accessToken, currentUser } = useAuthStore();
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<LoginPage />} path="login" />
        {accessToken ? (
          <Route element={<Layout />}>
            <Route index element={<OverviewPage />} path="overview" />
            <Route element={<ContactPage />} path="contact" />
            <Route element={<UserPage />} path="user" />
            <Route path="subjects">
              <Route element={<AddSubjectPage />} path="add-subject" />
              <Route path="view-subjects">
                <Route index element={<ViewSubjectsPage />} />
                <Route element={<SubjectPage />} path=":subjectIdentifier" />
              </Route>
            </Route>
            <Route path="instruments">
              <Route element={<AvailableInstrumentsPage />} path="available" />
              <Route element={<ManageInstrumentsPage />} path="manage" />
              <Route element={<CreateInstrumentPage />} path="create" />
              <Route path="forms">
                <Route element={<FormPage />} path=":id" />
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
