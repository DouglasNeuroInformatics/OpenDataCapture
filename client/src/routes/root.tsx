import React from 'react';

import { Navigate, Outlet } from 'react-router-dom';

import Layout from '@/components/Layout';

function rootLoader() {
  return null;
}

const Root = () => {
  const isAuth = true;

  return isAuth ? (
    <Layout>
      <Outlet />
    </Layout>
  ) : (
    <Navigate to="/login" />
  );
};

export { Root as default, rootLoader };
