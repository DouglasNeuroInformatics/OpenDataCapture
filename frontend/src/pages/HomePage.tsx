import React from 'react';

import { Link } from 'react-router-dom';
import Layout from '~/components/Layout';

const HomePage = () => {
  return (
    <Layout>
      <div className="d-flex align-items-center justify-content-center h-100">
        <div className='text-center w-75'>
          <h1 className="display-5 fw-bold">The Douglas Neuroinformatics Platform</h1>
          <p className="lead mb-4">
            This is an early prototype of our planned web portal. Here, you can add new patients
            to our database and view a simple table of all patients. Separately, we have also deployed
            a dashboard with Redash, which is connected to our API.
          </p>
          <div>
            <Link className='btn btn-primary btn-lg' to="/add-patient">Try Adding a New Patient</Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;