import React from 'react';

import Layout from '@/components/Layout';

interface ErrorPageProps {
  message: string;
  status: string;
}

const ErrorPage = ({ message, status }: ErrorPageProps) => {
  return (
    <Layout>
      <div className="d-flex flex-column align-items-center justify-content-center h-100">
        <h1 className="display-1">{status}</h1>
        <h2>{message}</h2>
      </div>
    </Layout>
  );
};

export default ErrorPage;
