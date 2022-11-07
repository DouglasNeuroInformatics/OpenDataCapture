import React, { useEffect, useState } from 'react';

import Table from 'react-bootstrap/Table';

import Layout from '~/components/Layout';
import Patient from '~/models/Patient';

const ViewPatientsPage = () => {

  const [patients, setPatients] = useState<Patient[]>();

  const getPatients = async () => {
    const response = await fetch('/api/patient');
    if (!response.ok) {
      console.error(response.status, response.statusText);
      return;
    }
    return await response.json();
  };

  useEffect(() => {
    getPatients().then((data) => setPatients(data));
  }, []);

  return (
    <Layout>
      <h1 className='text-center py-4'>View Patients</h1>
      <Table>
        <thead>
          <tr>
            <th>ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Date of Birth</th>
            <th>Sex</th>
          </tr>
        </thead>
        <tbody>
          {patients?.map((patient, i) => (
            <tr key={i}>
              <td>{patient.id || 'NA'}</td>
              <td>{patient.firstName}</td>
              <td>{patient.lastName}</td>
              <td>{patient.dateOfBirth.toString()}</td>
              <td>{patient.sex}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Layout>
  );
};

export default ViewPatientsPage;