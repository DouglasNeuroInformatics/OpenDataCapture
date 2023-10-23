import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { P, match } from 'ts-pattern';

import { Layout } from './components/Layout';
import * as Auth from './features/auth';
import * as Contact from './features/contact';
import * as InstrumentsModule from './features/instruments';
import * as Overview from './features/overview';
import * as Subjects from './features/subjects';
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
                <Route index element={<Subjects.IndexPage />} />
                <Route element={<Subjects.SubjectLayout />} path=":subjectIdentifier">
                  <Route element={<Subjects.AssignmentsPage />} path="assignments" />
                  <Route element={<Subjects.GraphPage />} path="graph" />
                  <Route element={<Subjects.TablePage />} path="table" />
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
