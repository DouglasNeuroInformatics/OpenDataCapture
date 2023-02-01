import React from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { demographicOptions, subjectDemographicsSchema } from 'common';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { SubjectsAPI } from '../api/subjects.api';

import { Form } from '@/components/form';
import { useActiveSubjectStore } from '@/stores/active-subject-store';

export const subjectFormSchema = subjectDemographicsSchema.required({
  firstName: true,
  lastName: true
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
      <Form.Group title="Required Fields">
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
      </Form.Group>
      <Form.Group title="Optional Fields">
        <Form.TextField
          error={errors.forwardSortationArea?.message}
          label="Forward Sortation Area"
          name="forwardSortationArea"
          register={register}
        />
        <Form.SelectField
          control={control}
          error={errors.ethnicity?.message}
          label="Ethnicity"
          name="ethnicity"
          options={demographicOptions.ethnicity}
          register={register}
        />
        <Form.SelectField
          control={control}
          error={errors.gender?.message}
          label="Gender"
          name="gender"
          options={demographicOptions.gender}
          register={register}
        />
        <Form.SelectField
          control={control}
          error={errors.employmentStatus?.message}
          label="Employment Status"
          name="employmentStatus"
          options={demographicOptions.employmentStatus}
          register={register}
        />
        <Form.SelectField
          control={control}
          error={errors.maritalStatus?.message}
          label="Marital Status"
          name="maritalStatus"
          options={demographicOptions.maritalStatus}
          register={register}
        />
        <Form.SelectField
          control={control}
          error={errors.firstLanguage?.message}
          label="First Language"
          name="firstLanguage"
          options={demographicOptions.firstLanguage}
          register={register}
        />
      </Form.Group>
      <Form.SubmitButton />
    </Form>
  );
};
