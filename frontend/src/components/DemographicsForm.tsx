import React, { ChangeEvent, useState } from 'react';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import type { Patient } from '~/models';

const DemographicsForm = () => {

  const [data, setData] = useState<Patient>({
    firstName: '',
    lastName: '',
    dateOfBirth: new Date(1900, 0, 1),
    sex: null
  });

  const [startDate, setStartDate] = useState(new Date());

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log(data);
  };

  const handleChange = (event: ChangeEvent, key: string) => {
    const target = event.target as HTMLInputElement; // tbd
    setData(prevData => ({ ...prevData, [key]: target.value }));
  };
  
  return (
    <div>
      <h3 className='mb-3'>Demographic Information</h3>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="formFirstName">
          <Form.Label>First Name</Form.Label>
          <Form.Control type="text" placeholder="First Name" value={data.firstName} onChange={(e) => handleChange(e, 'firstName')} />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formLastName">
          <Form.Label>Last Name</Form.Label>
          <Form.Control type="text" placeholder="Last Name" />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label htmlFor="select-sex">Sex</Form.Label>
          <Form.Select defaultValue='' placeholder="TEST" id="select-sex" onChange={(e) => handleChange(e, 'sex')}>
            <option disabled value=''>Please select</option>
            <option value='Male'>Male</option>
            <option value='Female'>Female</option>
          </Form.Select>
        </Form.Group>
        <ReactDatePicker selected={startDate} onChange={(date: Date) => setStartDate(date)} />
        <Button variant="primary" type="submit">
          Submit
        </Button>
      </Form>
    </div>
  );
};

export default DemographicsForm;