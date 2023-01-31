import React, { useEffect } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { demographicOptions } from 'common';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { SubjectsAPI } from '../api/subjects.api';

import { Form } from '@/components/form';
import { useActiveSubjectStore } from '@/stores/active-subject-store';

export const subjectFormSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  sex: z.enum(demographicOptions.sex),
  dateOfBirth: z.coerce.date()
});

export type SubjectFormSchema = z.infer<typeof subjectFormSchema>;

export interface SubjectFormProps {
  onSuccess: () => void;
}

export const SubjectForm = ({ onSuccess }: SubjectFormProps) => {
  const { setActiveSubject } = useActiveSubjectStore();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<SubjectFormSchema>({
    resolver: zodResolver(subjectFormSchema)
  });

  const onSubmit = async (data: SubjectFormSchema) => {
    await SubjectsAPI.addSubject(data);
    setActiveSubject(data);
    reset();
    onSuccess();
  };

  return (
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
        options={demographicOptions.sex}
        register={register}
      />
      <Form.SubmitButton />
    </Form>
  );
};
