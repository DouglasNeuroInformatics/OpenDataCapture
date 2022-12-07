import React, { useEffect, useState } from 'react';

import type { GetStaticProps } from 'next';

import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table';
import { type SubjectArraySchema, type HappinessQuestionnaireArraySchema } from 'schemas';

import API from '../api/API';
import Layout from '../components/Layout';

const ViewSubjectsPage = () => {
  const [modalSubjectId, setModalSubjectId] = useState<string | null>(null);
  const [modalData, setModalData] = useState<HappinessQuestionnaireArraySchema>();
  const [subjects, setSubjects] = useState<SubjectArraySchema>();
  const [updateRequired, setUpdateRequired] = useState(false);

  const updateSubjects = () =>
    API.getSubjects().then((data) => {
      setSubjects(data);
      setUpdateRequired(false);
    });

  useEffect(() => {
    modalSubjectId &&
      API.getHappinessScalesForSubject(modalSubjectId)
        .then((data) => setModalData(data))
        .catch((error) => console.error(error));
  }, [modalSubjectId]);

  useEffect(() => {
    void updateSubjects();
    const intervalId = setInterval(() => void updateSubjects(), 5000);
    return () => clearInterval(intervalId);
  }, [updateRequired]);

  const handleRowClick = (subjectId: string | null) => {
    setModalSubjectId(subjectId);
  };

  return (
    <Layout>
      <h1 className="text-center py-2">View Subjects (N={subjects?.length})</h1>
      <Table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Date of Birth</th>
            <th>Sex</th>
          </tr>
        </thead>
        <tbody>
          {subjects?.map((subject, i) => (
            <tr className="subjects-table-row" key={i} onClick={() => handleRowClick(subject._id || null)}>
              <td>{subject._id?.slice(0, 6) || 'NA'}</td>
              <td>{new Date(subject.dateOfBirth).toDateString()}</td>
              <td className="text-capitalize">{subject.sex}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Modal centered show={modalSubjectId !== null} size="lg">
        <Modal.Header>
          <Modal.Title>Happiness Scores for Subject {modalSubjectId?.slice(0, 6)}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalData?.map((value) => (
            <div className="mb-3" key={value._id}>
              <h5>Entry ID: {value._id}</h5>
              <div>
                <span className="fw-bold">Added: </span>
                <span>{value.createdAt && new Date(value.createdAt).toString()}</span>
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
              modalSubjectId && API.deleteSubject(modalSubjectId);
              setModalSubjectId(null);
            }}
          >
            Delete
          </Button>
          <Button variant="secondary" onClick={() => setModalSubjectId(null)}>
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

export default ViewSubjectsPage;
