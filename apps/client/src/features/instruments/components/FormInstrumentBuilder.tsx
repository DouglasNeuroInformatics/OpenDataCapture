/* eslint-disable no-alert */
import React, { useState } from 'react';

import { FormFieldKind, Language, TextFormField } from '@ddcp/common';
import { useTranslation } from 'react-i18next';

import { ArrayField, Button, PrimitiveFormField } from '@/components';

type CustomFormValues = {
  title: string | null;
  description: string | null;
  language: Language | null;
  instructions: string | null;
  estimatedDuration: number | null;
  fields: Array<{
    kind: FormFieldKind | null;
    label: string | null;
    description: string | null;
    variant: TextFormField['variant'] | null;
    min: number | null;
    max: number | null;
    options: string | null;
  }>;
};

type BasicKey = keyof Omit<CustomFormValues, 'fields'>;

type FieldKey = keyof CustomFormValues['fields'][number];

type FieldValue<K extends FieldKey> = CustomFormValues['fields'][number][K];

const getDefaultFieldValues = () => ({
  kind: null,
  label: null,
  description: null,
  variant: null,
  min: null,
  max: null,
  options: null
});

const getDefaultValues = () => ({
  title: null,
  description: null,
  language: null,
  instructions: null,
  estimatedDuration: null,
  fields: [getDefaultFieldValues()]
});

export const FormInstrumentBuilder = () => {
  const { t } = useTranslation(['common', 'instruments']);
  const [values, setValues] = useState<CustomFormValues>(getDefaultValues());

  const updateValue = <K extends BasicKey>(key: K, value: (typeof values)[K]) => {
    setValues((prevValues) => ({ ...prevValues, [key]: value }));
  };

  const updateFieldValue = <K extends FieldKey>(key: K, index: number, value: FieldValue<K>) => {
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

  const appendField = () => {
    setValues((prevValues) => ({ ...prevValues, fields: [...prevValues.fields, getDefaultFieldValues()] }));
  };

  const removeField = () => {
    setValues((prevValues) => {
      if (prevValues.fields.length > 1) {
        return { ...prevValues, fields: prevValues.fields.slice(0, -1) };
      }
      return prevValues;
    });
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
          setValue={(value) => updateValue('language', value as Language | null)}
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
              setValue={(value) => updateFieldValue('kind', i, value as FormFieldKind | null)}
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
            {field.kind === 'text' && (
              <PrimitiveFormField
                kind="options"
                label="Variant"
                name="variant"
                options={{
                  short: 'Short',
                  long: 'Long',
                  password: 'Password'
                }}
                setValue={(value) => updateFieldValue('variant', i, value as TextFormField['variant'] | null)}
                value={field.variant}
              />
            )}
            {field.kind === 'numeric' && (
              <>
                <PrimitiveFormField
                  kind="numeric"
                  label="Minimum"
                  max={100}
                  min={0}
                  name="min"
                  setValue={(value) => updateFieldValue('min', i, value)}
                  value={field.min}
                />
                <PrimitiveFormField
                  kind="numeric"
                  label="Maximum"
                  max={100}
                  min={0}
                  name="max"
                  setValue={(value) => updateFieldValue('max', i, value)}
                  value={field.max}
                />
              </>
            )}
            {field.kind === 'options' && (
              <PrimitiveFormField
                description="Please input options as key value pairs separated by newlines."
                kind="text"
                label="Options"
                name="options"
                setValue={(value) => updateFieldValue('options', i, value)}
                value={field.options}
                variant="long"
              />
            )}
          </div>
        ))}
        <div className="my-2 flex gap-2">
          <Button label="Append Field" type="button" onClick={appendField} />
          <Button label="Remove Field" type="button" onClick={removeField} />
        </div>
      </div>
      <Button className="mt-5 w-full" label="Submit" />
    </form>
  );
};
