/* eslint-disable no-alert */
import React, { useState } from 'react';

import { FormFieldKind, Language, TextFormField } from '@ddcp/common';
import { useTranslation } from 'react-i18next';

import { Button, FormValues, PrimitiveFormField } from '@/components';

type CreateFormData = {
  title: string;
  description: string;
  language: Language | string;
  instructions: string;
  estimatedDuration: number;
  fields: Array<{
    kind: FormFieldKind | string;
    label: string;
    description: string;
    variant?: TextFormField['variant'];
  }>;
};

export const FormInstrumentBuilder = () => {
  const { t } = useTranslation(['common', 'instruments']);
  const [values, setValues] = useState<FormValues<CreateFormData>>({
    title: null,
    description: null,
    language: null,
    instructions: null,
    estimatedDuration: null,
    fields: [
      {
        kind: null,
        label: null,
        description: null,
        variant: null
      }
    ]
  });

  const updateValue = <K extends keyof Omit<CreateFormData, 'fields'>>(key: K, value: (typeof values)[K]) => {
    setValues((prevValues) => ({ ...prevValues, [key]: value }));
  };

  const updateFieldValue = <K extends keyof CreateFormData['fields'][number]>(
    key: K,
    index: number,
    value: (typeof values)['fields'][number][K]
  ) => {
    setValues((prevValues) => {
      const newValues = { ...prevValues };
      newValues.fields[index][key] = value;
      return newValues;
    });
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    alert(JSON.stringify(values, null, 2));
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <h3 className="font-semibold">Details</h3>
        <PrimitiveFormField
          kind="text"
          label={t('instruments:createInstrument.form.title.label')}
          name="title"
          setValue={(value) => updateValue('title', value)}
          value={values.title}
          variant="short"
        />
        <PrimitiveFormField
          kind="text"
          label={t('instruments:createInstrument.form.description.label')}
          name="description"
          setValue={(value) => updateValue('description', value)}
          value={values.description}
          variant="long"
        />
        <PrimitiveFormField
          kind="options"
          label={t('instruments:createInstrument.form.language.label')}
          name="language"
          options={{
            en: t('languages.en'),
            fr: t('languages.fr')
          }}
          setValue={(value) => updateValue('language', value)}
          value={values.language}
        />
        <PrimitiveFormField
          kind="text"
          label={t('instruments:createInstrument.form.instructions.label')}
          name="instructions"
          setValue={(value) => updateValue('instructions', value)}
          value={values.instructions}
          variant="long"
        />
        <PrimitiveFormField
          kind="numeric"
          label={t('instruments:createInstrument.form.estimatedDuration.label')}
          max={60}
          min={1}
          name="estimatedDuration"
          setValue={(value) => updateValue('estimatedDuration', value)}
          value={values.estimatedDuration}
        />
        <h3 className="font-semibold">Fields</h3>
        {values.fields.map((field, i) => (
          <div key={i}>
            <h3>Field {i + 1}</h3>
            <PrimitiveFormField
              kind="options"
              label="Kind"
              name="kind"
              options={{
                text: 'Text',
                numeric: 'Numeric',
                options: 'Options',
                date: 'Date',
                binary: 'Binary'
              }}
              setValue={(value) => updateFieldValue('kind', i, value)}
              value={field.kind}
            />
            <PrimitiveFormField
              kind="text"
              label="Label"
              name="label"
              setValue={(value) => updateFieldValue('label', i, value)}
              value={field.label}
              variant="short"
            />
            <PrimitiveFormField
              kind="text"
              label="Description"
              name="description"
              setValue={(value) => updateFieldValue('description', i, value)}
              value={field.description}
              variant="short"
            />
          </div>
        ))}
      </div>
      <Button label="Submit" />
    </form>
  );
};
