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
import { AddSubjectPage, SelectVisualizationPage, ViewSubjectsPage } from './features/subjects';
import { UserPage } from './features/user';
import { useAuthStore } from './stores/auth-store';

/** Recharts library is huge! */
const SubjectRecordsGraphPage = React.lazy(() => import('@/features/subjects/pages/SubjectRecordsGraphPage'));
const SubjectRecordsTablePage = React.lazy(() => import('@/features/subjects/pages/SubjectRecordsTablePage'));

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
              <Route element={<AddSubjectPage />} path="add-subject" />
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

/**
const LoginPage = React.lazy(() => import('./features/auth/pages/LoginPage'));
const ContactPage = React.lazy(() => import('./features/contact/pages/ContactPage'));
const AvailableInstrumentsPage = React.lazy(() => import('./features/instruments/pages/AvailableInstrumentsPage'));
const CreateInstrumentPage = React.lazy(() => import('./features/instruments/pages/CreateInstrumentPage'));
const FormPage = React.lazy(() => import('./features/instruments/pages/FormPage'));
const ManageInstrumentsPage = React.lazy(() => import('./features/instruments/pages/ManageInstrumentsPage'));
const OverviewPage = React.lazy(() => import('@/features/overview/pages/OverviewPage'));
const AddSubjectPage = React.lazy(() => import('@/features/subjects/pages/AddSubjectPage'));
const SubjectPage = React.lazy(() => import('@/features/subjects/pages/SubjectPage'));
const ViewSubjectsPage = React.lazy(() => import('@/features/subjects/pages/ViewSubjectsPage'));
const UserPage = React.lazy(() => import('@/features/user/pages/UserPage'));
 */
