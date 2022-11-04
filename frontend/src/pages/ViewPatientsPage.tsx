import React, { useEffect, useState } from 'react';

import Table from 'react-bootstrap/Table';

import Layout from '~/components/Layout';
import { type Patient } from '~/models';

const ViewPatientsPage = () => {

  const [patients, setPatients] = useState<Patient[]>();

  const getPatients = async () => {
    const response = await fetch('/api/patients');
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
            <th>First Name</th>
            <th>Last Name</th>
            <th>Date of Birth</th>
            <th>Sex</th>
          </tr>
        </thead>
        <tbody>
          {patients?.map((patient, i) => (
            <tr key={i}>
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