import React from 'react';

import { Navigate, Outlet } from 'react-router-dom';

import Layout from '@/components/Layout';
import useAuth from '@/hooks/useAuth';

const Root = () => {
  const auth = useAuth();
  return auth.currentUser ? (
    <Layout>
      <Outlet />
    </Layout>
  ) : (
    <Navigate to="/login" />
  );
};

export default Root;
