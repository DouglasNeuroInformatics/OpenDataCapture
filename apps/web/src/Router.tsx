import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { P, match } from 'ts-pattern';

import { Layout } from './components';
import * as AuthModule from './features/auth';
import * as ContactModule from './features/contact';
import * as InstrumentsModule from './features/instruments';
import * as OverviewModule from './features/overview';
import * as SubjectsModule from './features/subjects';
import * as UserModule from './features/user';
import { useAuthStore } from './stores/auth-store';

export const Router = () => {
  const { accessToken } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="auth">
          <Route index element={<Navigate to="login" />} />
          <Route element={<AuthModule.LoginPage />} path="login" />
        </Route>
        {match({ accessToken })
          .with({ accessToken: P.string }, () => (
            <Route element={<Layout />}>
              <Route index element={<OverviewModule.OverviewPage />} path="overview" />
              <Route element={<ContactModule.ContactPage />} path="contact" />
              <Route element={<UserModule.UserPage />} path="user" />
              <Route path="subjects">
                <Route element={<SubjectsModule.AddVisitPage />} path="add-visit" />
                <Route path="view-subjects">
                  <Route index element={<SubjectsModule.ViewSubjectsPage />} />
                  <Route element={<SubjectsModule.SubjectPage />} path=":subjectIdentifier">
                    <Route index element={<SubjectsModule.SubjectManagementPage />} />
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
          ))
          .otherwise(() => (
            <Route element={<Navigate to="/auth/login" />} path="*" />
          ))}
      </Routes>
    </BrowserRouter>
  );
};
