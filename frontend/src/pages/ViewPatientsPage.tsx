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

  const deletePatient = async (id: string) => {
    const response = await fetch(`/api/patient/${id}`, {
      method: 'DELETE'
    });
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
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {patients?.map((patient, i) => (
            <tr key={i}>
              <td>{patient._id?.slice(0, 6) || 'NA'}</td>
              <td>{patient.firstName}</td>
              <td>{patient.lastName}</td>
              <td>{patient.dateOfBirth.toString()}</td>
              <td>{patient.sex}</td>
              <td>
                <button type="button" className="btn-close"
                  onClick={() => patient._id && deletePatient(patient._id)} />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Layout>
  );
};

export default ViewPatientsPage;