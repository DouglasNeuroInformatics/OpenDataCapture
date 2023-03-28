import React from 'react';

import { FormInstrument } from '@ddcp/common';
import { HiOutlineDocumentCheck, HiOutlinePrinter, HiOutlineQuestionMarkCircle } from 'react-icons/hi2';
import { useParams } from 'react-router-dom';

import { FormOverview } from '../components/FormOverview';

import { PageHeader, Spinner, Stepper } from '@/components';
import { useFetch } from '@/hooks/useFetch';

export const FormPage = () => {
  const params = useParams();

  const { data } = useFetch<FormInstrument>(`/instruments/forms/${params.id!}`);

  if (!data) {
    return <Spinner />;
  }

  return (
    <div>
      <PageHeader title={data.details.title} />
      <Stepper
        steps={[
          {
            element: <FormOverview details={data.details} />,
            label: 'Overview',
            icon: <HiOutlineDocumentCheck />
          },
          {
            element: <span>2</span>,
            label: 'Questions',
            icon: <HiOutlineQuestionMarkCircle />
          },
          {
            element: <span>3</span>,
            label: 'Summary',
            icon: <HiOutlinePrinter />
          }
        ]}
      />
    </div>
  );
};
