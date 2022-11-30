import React, { useEffect, useState } from 'react';

import type { GetStaticProps } from 'next';

import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table';
import * as yup from 'yup';

import API from '../api/API';
import Layout from '../components/Layout';

type Sex = 'male' | 'female';

const patientSchema = yup.object({
  _id: yup.string().notRequired(),
  firstName: yup.string().required(),
  lastName: yup.string().required(),
  sex: yup.mixed<Sex>().oneOf(['male', 'female']).defined(),
  dateOfBirth: yup.date().required()
});

type Patient = yup.InferType<typeof patientSchema>;

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

  const updatePatients = () =>
    API.getPatients().then((data) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      setPatients(data);
      setUpdateRequired(false);
    });

  useEffect(() => {
    modalPatientId &&
      API.getHappinessScalesForPatient(modalPatientId)
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
      <h1 className="text-center py-2">View Patients (N={patients?.length})</h1>
      <Table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Date of Birth</th>
            <th>Sex</th>
          </tr>
        </thead>
        <tbody>
          {patients?.map((patient, i) => (
            <tr className="patients-table-row" key={i} onClick={() => handleRowClick(patient._id || null)}>
              <td>{patient._id?.slice(0, 6) || 'NA'}</td>
              <td>{new Date(patient.dateOfBirth).toDateString()}</td>
              <td className="text-capitalize">{patient.sex}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Modal centered show={modalPatientId !== null} size="lg">
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
            variant="danger"
            onClick={() => {
              modalPatientId && API.deletePatient(modalPatientId);
              setModalPatientId(null);
            }}
          >
            Delete
          </Button>
          <Button variant="secondary" onClick={() => setModalPatientId(null)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common']))
    }
  };
};

export default ViewPatientsPage;
