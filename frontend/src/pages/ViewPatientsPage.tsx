import React, { useEffect, useState } from 'react';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table';

import Layout from '@/components/Layout';
import Patient from '@/models/Patient';

interface HappinessQuestionnaire {
  _id: string;
  createdAt: string;
  score: number;
}

const ViewPatientsPage = () => {
  const [modalPatientId, setModalPatientId] = useState<string | null>(null);
  const [modalData, setModalData] = useState<HappinessQuestionnaire[]>();
  const [patients, setPatients] = useState<Patient[]>();
  const [updateRequired, setUpdateRequired] = useState(false);

  const getPatients = async () => {
    const response = await fetch('/api/patient');
    if (!response.ok) {
      console.error(response.status, response.statusText);
      return;
    }
    return (await response.json()) as unknown;
  };

  const deletePatient = async (id: string) => {
    const response = await fetch(`/api/patient/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      console.error(response.status, response.statusText);
      return;
    }
    setUpdateRequired(true);
  };

  const updatePatients = () =>
    getPatients().then((data) => {
      setPatients(data);
      setUpdateRequired(false);
    });

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    fetch(`/api/instrument/happiness-scale/${modalPatientId}`)
      .then((data) => data.json())
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      .then((data) => setModalData(data))
      .catch((error) => console.error(error));
  }, [modalPatientId]);

  useEffect(() => {
    void updatePatients();
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    const intervalId = setInterval(updatePatients, 5000);
    return () => clearInterval(intervalId);
  }, [updateRequired]);

  const handleRowClick = (patientId: string | null) => {
    setModalPatientId(patientId);
  };

  return (
    <Layout>
      <h1 className="text-center py-4">View Patients</h1>
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
            <tr
              className="patients-table-row"
              key={i}
              onClick={() => handleRowClick(patient._id || null)}
            >
              <td>{patient._id?.slice(0, 6) || 'NA'}</td>
              <td>{patient.firstName}</td>
              <td>{patient.lastName}</td>
              <td>{new Date(patient.dateOfBirth).toDateString()}</td>
              <td className="text-capitalize">{patient.sex}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Modal centered size="lg" show={modalPatientId !== null}>
        <Modal.Header>
          <Modal.Title>Happiness Scores for Patient {modalPatientId?.slice(0, 6)}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalData?.map((value) => (
            <div className="mb-3" key={value._id}>
              <h5>Entry ID: {value._id}</h5>
              <div>
                <span className="fw-bold">Added: </span>
                <span>{new Date(value.createdAt).toString()}</span>
              </div>
              <div>
                <span className="fw-bold">Score: </span>
                <span>{value.score}</span>
              </div>
            </div>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={() => {
              modalPatientId && deletePatient(modalPatientId);
              setModalPatientId(null);
            }}
            variant="danger"
          >
            Delete
          </Button>
          <Button onClick={() => setModalPatientId(null)} variant="secondary">
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Layout>
  );
};

export default ViewPatientsPage;
