import React, { useState } from 'react';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import type Patient from '@/models/Patient';

const DemoModal = ({ patientData }: { patientData: Patient }) => {
  return (
    <Modal centered show={true}>
      <Modal.Header closeButton>
        <Modal.Title>Success!</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <span>You have successfully submitted a new patient into our database.</span>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary">View All Patients in My Study</Button>
        <Button variant="secondary">Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DemoModal;
