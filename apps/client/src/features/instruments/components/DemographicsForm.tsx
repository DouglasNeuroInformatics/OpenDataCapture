import React, { useEffect } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Form } from '@/components/form';
import { useActiveSubjectStore } from '@/stores/active-subject-store';

export const demographicsFormSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dateOfBirth: z.coerce.date()
});

export type DemographicsFormData = z.infer<typeof demographicsFormSchema>;

export interface DemographicsFormProps {
  submitLabel?: string;
  onSubmit: SubmitHandler<DemographicsFormData>;
}

export const DemographicsForm = ({ onSubmit, submitLabel }: DemographicsFormProps) => {
  const { activeSubject } = useActiveSubjectStore();
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<DemographicsFormData>({
    resolver: zodResolver(demographicsFormSchema)
  });

  useEffect(() => {
    activeSubject
      ? reset(activeSubject)
      : reset({
          firstName: '',
          lastName: '',
          dateOfBirth: undefined
        });
  }, [activeSubject]);

  return (
    <div>
      <h3 className="mt-8 mb-5 font-semibold">Demographics Form</h3>
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
