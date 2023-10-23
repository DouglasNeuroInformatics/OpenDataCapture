/* eslint-disable perfectionist/sort-objects */

import { BrowserRouter, Navigate, type RouteObject, useRoutes } from 'react-router-dom';

import { Layout } from './components/Layout';
import { authRoutes } from './features/auth';
import { contactRoute } from './features/contact';
import * as InstrumentsModule from './features/instruments';
import { overviewRoute } from './features/overview';
import * as Subjects from './features/subjects';
import { userRoute } from './features/user';
import { visitsRoute } from './features/visits';
import { useAuthStore } from './stores/auth-store';

const publicRoutes: RouteObject[] = [
  authRoutes,
  {
    path: '*',
    element: <Navigate to="/auth/login" />
  }
];

const protectedRoutes: RouteObject[] = [
  authRoutes,
  {
    element: <Layout />,
    children: [contactRoute, overviewRoute, userRoute, visitsRoute]
  }
];

export const AppRoutes = () => {
  const { accessToken } = useAuthStore();
  const element = useRoutes(accessToken ? protectedRoutes : publicRoutes);
  return element;
};

export const Router = () => {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};

// export const Router = () => {
//   const { accessToken } = useAuthStore();

//   return (
//     <BrowserRouter>
//       <Routes>
//         {match({ accessToken })
//           .with({ accessToken: P.string }, () => (
//             <Route element={<Layout />}>
//               <Route path="instruments">
//                 <Route element={<InstrumentsModule.AvailableInstrumentsPage />} path="available" />
//                 <Route element={<InstrumentsModule.ManageInstrumentsPage />} path="manage" />
//                 <Route element={<InstrumentsModule.CreateInstrumentPage />} path="create" />
//                 <Route path="forms">
//                   <Route element={<InstrumentsModule.FormPage />} path=":id" />
//                 </Route>
//               </Route>
//               <Route path="subjects">
//                 <Route index element={<Subjects.IndexPage />} />
//                 <Route element={<Subjects.SubjectLayout />} path=":subjectIdentifier">
//                   <Route element={<Subjects.AssignmentsPage />} path="assignments" />
//                   <Route element={<Subjects.GraphPage />} path="graph" />
//                   <Route element={<Subjects.TablePage />} path="table" />
//                 </Route>
//               </Route>
//             </Route>
//           ))
//           .otherwise(() => (
//             <Route element={<Navigate to="/auth/login" />} path="*" />
//           ))}
//       </Routes>
//     </BrowserRouter>
//   );
// };
