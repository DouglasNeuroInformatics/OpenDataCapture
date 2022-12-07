import React from 'react';

import Modal from 'react-bootstrap/Modal';

import ErrorDisplay from './ErrorDisplay';

interface AlertProps {
  title: string;
  message: string;
  error?: Error;
  handleClose?: () => void;
}

const Alert = ({ title, message, error, handleClose }: AlertProps) => {
  return (
    <Modal centered show={title.length > 0 || message.length > 0} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{message}</p>
        {error && <ErrorDisplay error={error} />}
      </Modal.Body>
    </Modal>
  );
};

export { Alert as default, type AlertProps };
