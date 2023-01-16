import React, { useState } from 'react';

import { instrumentSchema } from 'common';
import { useQuery } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';

import { DemographicsForm, DemographicsFormSchema } from '../components/DemographicsForm';
import { InstrumentOverview } from '../components/InstrumentOverview';
import { InstrumentRecordForm, InstrumentRecordFormSchema } from '../components/InstrumentRecordForm';

import { useAuthStore } from '@/features/auth';

export const InstrumentPage = () => {
  const auth = useAuthStore();
  const navigate = useNavigate();
  const params = useParams();
  const [step, setStep] = useState(0);
  const [demographicsData, setDemographicsData] = useState<DemographicsFormSchema>();

  const { data, error } = useQuery(`Instrument`, async () => {
    const response = await fetch(`${import.meta.env.VITE_API_HOST}/api/instruments/schemas/${params.id!}`, {
      headers: {
        Authorization: 'Bearer ' + auth.accessToken!
      }
    });
    return instrumentSchema.parseAsync(await response.json());
  });

  const submitInstrumentRecord = async (responses: InstrumentRecordFormSchema) => {
    const response = await fetch(`${import.meta.env.VITE_API_HOST}/api/instruments/records/${params.id!}`, {
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
      const body = await response.json();
      alert(`${response.status}: ${response.statusText}; ${body.message}`);
      return null;
    }

    alert('Success!');
    navigate('/home');
  };

  if (error) {
    alert(error);
  }

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

