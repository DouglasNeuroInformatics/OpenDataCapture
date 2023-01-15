import React from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { sexOptions } from 'common';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Form } from '@/components/form';
import { useAuthStore } from '@/stores/auth';

const formDataSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  sex: z.enum(sexOptions),
  dateOfBirth: z.coerce.date()
});

type FormData = z.infer<typeof formDataSchema>;

export const AddSubjectPage = () => {
  const auth = useAuthStore();
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(formDataSchema)
  });

  const onSubmit = async (data: FormData) => {
    console.log(JSON.stringify(data));

    const response = await fetch(`${import.meta.env.VITE_API_HOST}/api/subjects`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + auth.accessToken!,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      console.error(response);
      alert(`${response.status}: ${response.statusText}`);
      return;
    }

    alert('Success');
    reset();
  };

  return (
    <div className="flex flex-col items-center">
      <h1>Add Subject</h1>
      <div style={{ width: 500 }}>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Form.TextField error={errors.firstName?.message} label="First Name" name="firstName" register={register} />
          <Form.TextField error={errors.lastName?.message} label="Last Name" name="lastName" register={register} />
          <Form.DateField
            control={control}
            error={errors.dateOfBirth?.message}
            label="Date of Birth"
            name="dateOfBirth"
            register={register}
          />
          <Form.SelectField
            control={control}
            error={errors.sex?.message}
            label="Sex"
            name="sex"
            options={sexOptions}
            register={register}
          />
          <Form.SubmitButton />
        </Form>
      </div>
    </div>
  );
};
