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
import { AddVisitPage, SelectVisualizationPage, ViewSubjectsPage } from './features/subjects';
import { UserPage } from './features/user';
import { useAuthStore } from './stores/auth-store';

import { SubjectRecordsGraphPage } from '@/features/subjects/pages/SubjectRecordsGraphPage';
import { SubjectRecordsTablePage } from '@/features/subjects/pages/SubjectRecordsTablePage';

export const Router = () => {
  const { accessToken } = useAuthStore();
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
              <Route element={<AddVisitPage />} path="add-visit" />
              <Route path="view-subjects">
                <Route index element={<ViewSubjectsPage />} />
                <Route path=":subjectIdentifier">
                  <Route index element={<SelectVisualizationPage />} />
                  <Route element={<SubjectRecordsGraphPage />} path="graph" />
                  <Route element={<SubjectRecordsTablePage />} path="table" />
                </Route>
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
