import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { P, match } from 'ts-pattern';

import { Layout } from './components/Layout';
import * as Auth from './features/auth';
import * as Contact from './features/contact';
import * as InstrumentsModule from './features/instruments';
import * as Overview from './features/overview';
import * as SubjectsModule from './features/subjects';
import * as UserModule from './features/user';
import * as Visits from './features/visits';
import { useAuthStore } from './stores/auth-store';

export const Router = () => {
  const { accessToken } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="auth">
          <Route element={<Auth.LoginPage />} path="login" />
        </Route>
        {match({ accessToken })
          .with({ accessToken: P.string }, () => (
            <Route element={<Layout />}>
              <Route path="contact">
                <Route index element={<Contact.IndexPage />} />
              </Route>
              <Route index element={<Overview.OverviewPage />} path="overview" />
              <Route element={<UserModule.UserPage />} path="user" />
              <Route path="instruments">
                <Route element={<InstrumentsModule.AvailableInstrumentsPage />} path="available" />
                <Route element={<InstrumentsModule.ManageInstrumentsPage />} path="manage" />
                <Route element={<InstrumentsModule.CreateInstrumentPage />} path="create" />
                <Route path="forms">
                  <Route element={<InstrumentsModule.FormPage />} path=":id" />
                </Route>
              </Route>
              <Route path="subjects">
                <Route path="view-subjects">
                  <Route index element={<SubjectsModule.ViewSubjectsPage />} />
                  <Route element={<SubjectsModule.SubjectPage />} path=":subjectIdentifier">
                    <Route index element={<SubjectsModule.SubjectManagementPage />} />
                    <Route element={<SubjectsModule.SubjectRecordsGraphPage />} path="graph" />
                    <Route element={<SubjectsModule.SubjectRecordsTablePage />} path="table" />
                  </Route>
                </Route>
              </Route>
              <Route path="visits">
                <Route element={<Visits.AddVisit />} path="add-visit" />
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
