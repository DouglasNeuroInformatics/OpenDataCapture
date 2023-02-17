import React from 'react';

import { FormProvider, useFieldArray, useForm } from 'react-hook-form';

import { TextField } from '../TextField';

import { Button } from '@/components/base';

type FormValues = {
  cart: {
    name: string;
    amount: string;
  }[];
};

export const DynamicForm = () => {
  const methods = useForm<FormValues>({
    defaultValues: {
      cart: [
        {
          name: '',
          amount: ''
        }
      ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    name: 'cart',
    control: methods.control
  });

  const handleFormSubmission = (data: any) => {
    // eslint-disable-next-line no-alert
    alert(JSON.stringify(data, null, 2));
    methods.reset();
  };

  const appendField = () => {
    append({
      name: '',
      amount: ''
    });
  };

  const removeLastField = () => {
    if (fields.length > 1) {
      remove(fields.length - 1);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleFormSubmission)}>
        {fields.map((field, index) => (
          <section key={field.id}>
            <TextField kind="text" label="Name" name={`cart.${index}.name`} variant="short" />
            <TextField kind="text" label="Amount" name={`cart.${index}.amount`} variant="short" />
          </section>
        ))}
        <div className="mb-5 flex gap-5">
          <Button label="Append" type="button" onClick={appendField} />
          <Button label="Remove" type="button" onClick={removeLastField} />
        </div>
        <Button label="Submit Form" type="submit" />
      </form>
    </FormProvider>
  );
};
