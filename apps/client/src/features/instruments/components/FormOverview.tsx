import React from 'react';

import { FormDetails } from '@ddcp/common';

interface FormOverviewItemProps {
  heading: string;
  text: string;
}

const FormOverviewItem = ({ heading, text }: FormOverviewItemProps) => {
  return (
    <div>
      <h5>{heading}</h5>
      <p>{text}</p>
    </div>
  );
};

interface FormOverviewProps {
  details: FormDetails;
}

export const FormOverview = ({
  details: { description, language, estimatedDuration, instructions }
}: FormOverviewProps) => {
  return (
    <div>
      <FormOverviewItem heading="Description" text={description} />
      <FormOverviewItem heading="Language" text={language} />
      <FormOverviewItem heading="Estimated Duration" text={`${estimatedDuration} Minutes`} />
      <FormOverviewItem heading="Instructions" text={instructions} />
    </div>
  );
};
