import React from 'react';

interface ErrorDisplayProps {
  error: Error;
}

const ErrorDisplay = ({ error }: ErrorDisplayProps) => {
  return (
    <div>
      <h5>Error Details</h5>
      <div>
        <span className="fw-bold">Name: </span>
        <span>{error.name}</span>
      </div>
      <div>
        <span className="fw-bold">Message: </span>
        <span>{error.message}</span>
      </div>
      <div>
        <span className="fw-bold">Stack: </span>
        <br />
        <span>{error.stack}</span>
      </div>
    </div>
  );
};

export default ErrorDisplay;
