import React from 'react';

import { FormDetails } from '@ddcp/common';
import { useTranslation } from 'react-i18next';

interface FormOverviewItemProps {
  heading: string;
  text: string;
}

const FormOverviewItem = ({ heading, text }: FormOverviewItemProps) => {
  return (
    <div className="my-2">
      <h5 className="text-xl font-semibold">{heading}</h5>
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
  const { t } = useTranslation('common');
  return (
    <div>
      <FormOverviewItem heading="Description" text={description} />
      <FormOverviewItem heading="Language" text={t(`languages.${language}`)} />
      <FormOverviewItem heading="Estimated Duration" text={`${estimatedDuration} Minutes`} />
      <FormOverviewItem heading="Instructions" text={instructions} />
    </div>
  );
};
