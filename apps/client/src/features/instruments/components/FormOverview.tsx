import React, { useContext } from 'react';

import { FormDetails } from '@douglasneuroinformatics/common';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components';
import { StepperContext } from '@/context/StepperContext';

interface FormOverviewItemProps {
  heading: string;
  text: string | string[];
}

const FormOverviewItem = ({ heading, text }: FormOverviewItemProps) => {
  return (
    <div className="my-5">
      <h5 className="mb-1 text-xl font-semibold text-slate-900">{heading}</h5>
      {Array.isArray(text) ? (
        <ul>
          {text.map((s, i) => (
            <li className="my-3" key={i}>
              {s}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-slate-700">{text}</p>
      )}
    </div>
  );
};

interface FormOverviewProps {
  details: FormDetails;
}

export const FormOverview = ({
  details: { description, language, estimatedDuration, instructions }
}: FormOverviewProps) => {
  const { updateIndex } = useContext(StepperContext);

  const { t } = useTranslation();
  return (
    <div className="mb-2">
      <div className="mb-5">
        <FormOverviewItem heading={t('instruments.formPage.overview.description')} text={description} />
        <FormOverviewItem heading={t('instruments.formPage.overview.language')} text={t(`languages.${language}`)} />
        <FormOverviewItem
          heading={t('instruments.formPage.overview.estimated Duration')}
          text={`${estimatedDuration} Minutes`}
        />
        <FormOverviewItem heading={t('instruments.formPage.overview.instructions')} text={instructions} />
      </div>
      <Button label={t('instruments.formPage.overview.begin')} onClick={() => updateIndex('increment')} />
    </div>
  );
};
