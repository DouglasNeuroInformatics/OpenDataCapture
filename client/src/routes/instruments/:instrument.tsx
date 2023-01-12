import React, { useEffect, useState } from 'react';

import { Instrument, instrumentSchema, sexOptions } from 'common';
import { useForm } from 'react-hook-form';
import { useQuery } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';

import DemographicsForm, { DemographicsFormSchema } from '@/components/DemographicsForm';
import InstrumentOverview from '@/components/InstrumentOverview';
import InstrumentRecordForm, { InstrumentRecordFormSchema } from '@/components/InstrumentRecordForm';
import useAuth from '@/hooks/useAuth';

const InstrumentQuestions = () => {
  const auth = useAuth();
  const { register, handleSubmit } = useForm();

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

  return (
    <div>
      <h3>Demographics Questions</h3>
    </div>
  );
};

const InstrumentPage = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const params = useParams();
  const [step, setStep] = useState(0);
  const [demographicsData, setDemographicsData] = useState<DemographicsFormSchema>();
  const [instrumentRecordData, setInstrumentRecordData] = useState<InstrumentRecordFormSchema>();

  const { data, error } = useQuery(`Instrument`, async () => {
    const response = await fetch(`${import.meta.env.VITE_API_HOST}/api/instruments/${params.id!}`, {
      headers: {
        Authorization: 'Bearer ' + auth.accessToken!
      }
    });
    return instrumentSchema.parseAsync(await response.json());
  });

  const submitInstrumentRecord = async (responses: InstrumentRecordFormSchema) => {
    const response = await fetch(`${import.meta.env.VITE_API_HOST}/api/instruments/${params.id!}`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + auth.accessToken!,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        subjectDemographics: demographicsData,
        responses: responses
      })
    });

    if (!response.ok) {
      alert(`${response.status}: ${response.statusText}`);
      return null;
    }

    alert('Success!');
    navigate('/home');
  };

  if (!data) {
    return null;
  }

  return (
    <div className="container" style={{ maxWidth: 900 }}>
      <h1 className="text-center">{data.name}</h1>
      <hr className="my-5 border-slate-300" />
      <div className="flex rounded-xl bg-indigo-800 p-3 text-white shadow-xl">
        <div className="flex w-full justify-center rounded-xl">
          <span className="mx-2">Overview</span>
        </div>
        <div className="flex w-full justify-center rounded-xl">
          <span className="mx-2">Demographics Questions</span>
        </div>
        <div className="flex w-full justify-center">
          <span className="mx-2">Instrument Questions</span>
        </div>
      </div>
      <div>
        {step === 0 && <InstrumentOverview instrument={data} onConfirm={() => setStep(1)} />}
        {step === 1 && (
          <DemographicsForm
            submitLabel="Next"
            onSubmit={(data) => {
              setDemographicsData(data);
              setStep(2);
            }}
          />
        )}
        {step === 2 && (
          <InstrumentRecordForm fields={data.fields} title={data.name} onSubmit={submitInstrumentRecord} />
        )}
      </div>
    </div>
  );
};

export default InstrumentPage;
