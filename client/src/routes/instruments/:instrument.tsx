import React, { useMemo } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { instrumentSchema } from 'common';
import { useForm } from 'react-hook-form';
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import { z } from 'zod';

import Form from '@/components/Form';
import useAuth from '@/hooks/useAuth';

const InstrumentPage = () => {
  const auth = useAuth();
  const params = useParams();

  const { data, error } = useQuery(`Instrument`, async () => {
    const response = await fetch(`${import.meta.env.VITE_API_HOST}/api/instruments/${params.id!}`, {
      headers: {
        Authorization: 'Bearer ' + auth.accessToken!
      }
    });
    return instrumentSchema.parseAsync(await response.json());
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver()
  });

  const onSubmit = async (data: any) => {
    const response = await fetch(`${import.meta.env.VITE_API_HOST}/api/subjects`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + auth.accessToken!,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      alert(`${response.status}: ${response.statusText}`);
    }
  };

  if (!data) {
    return null;
  }


  return (
    <div className="container" style={{ maxWidth: 900 }}>
      <h1 className="text-center">{data.name}</h1>
      <hr className="my-5" />
      <h2>About This Instrument</h2>
      <div className="mt-2">
        <h5>Description</h5>
        <span>{data.description}</span>
      </div>
      <div className="mt-2">
        <h5>Instructions</h5>
        <span>{data.instructions}</span>
      </div>
      <div>
        <h5>Estimated Completion</h5>
        <span>{data.estimatedDuration} Minute(s)</span>
      </div>
      <hr className="my-5" style={{ color: 'black' }} />
      <h2>Questions</h2>
      <Form onSubmit={handleSubmit(onSubmit)}>
        {data.fields.map((field) => {
          if (field.type === 'text') {
            return (
              <Form.TextField
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                error={errors[field.name]?.message}
                label={field.label}
                name={field.name}
                register={register}
              />
            );
          }
        })}
        <Form.SubmitButton />
      </Form>
    </div>
  );
};

export default InstrumentPage;
