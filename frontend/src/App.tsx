import React from 'react';

import { BrowserRouter, Route, Routes } from 'react-router-dom';

import AddPatientPage from '@/pages/AddPatientPage';
import ErrorPage from '@/pages/ErrorPage';
import HomePage from '@/pages/HomePage';
import ViewPatientsPage from '@/pages/ViewPatientsPage';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<HomePage />} path="/" />
        <Route element={<AddPatientPage />} path="/add-patient" />
        <Route element={<ViewPatientsPage />} path="/view-patients" />
        <Route element={<ErrorPage status="404" message="Not Found" />} path="*" />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
