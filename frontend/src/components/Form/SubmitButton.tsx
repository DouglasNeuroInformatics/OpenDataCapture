import React from 'react';

import { ButtonProps } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';

const SubmitButton: React.FunctionComponent<ButtonProps> = (props) => {
  return (
    <Button variant="primary" type="submit" {...props}>
      Submit
    </Button>
  );
};

export default SubmitButton;
