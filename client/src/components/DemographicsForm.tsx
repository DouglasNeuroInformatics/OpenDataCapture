import React from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

import Form from './Form';

const demographicsFormSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dateOfBirth: z.coerce.date()
});

type DemographicsFormSchema = z.infer<typeof demographicsFormSchema>;

interface DemographicsFormProps {
  submitLabel?: string;
  onSubmit: SubmitHandler<DemographicsFormSchema>;
}

const DemographicsForm = ({ onSubmit, submitLabel }: DemographicsFormProps) => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<DemographicsFormSchema>({
    resolver: zodResolver(demographicsFormSchema)
  });

  return (
    <div>
      <h3>Demographics Form</h3>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Form.TextField
          error={errors.firstName?.message as string}
          label="First Name"
          name="firstName"
          register={register}
        />
        <Form.TextField
          error={errors.lastName?.message as string}
          label="Last Name"
          name="lastName"
          register={register}
        />
        <Form.DateField
          control={control}
          error={errors.dateOfBirth?.message}
          label="Date of Birth"
          name="dateOfBirth"
          register={register}
        />
        <Form.SubmitButton label={submitLabel} />
      </Form>
    </div>
  );
};

export { DemographicsForm as default, demographicsFormSchema, type DemographicsFormSchema };
