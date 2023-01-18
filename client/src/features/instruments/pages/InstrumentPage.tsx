import clsx from 'clsx';
import React, { useState } from 'react';

import { useQuery } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';

import { InstrumentsAPI } from '../api/instruments.api';
import { DemographicsForm, DemographicsFormData } from '../components/DemographicsForm';
import { InstrumentOverview } from '../components/InstrumentOverview';
import { InstrumentRecordForm, InstrumentRecordFormData } from '../components/InstrumentRecordForm';

export const InstrumentPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [step, setStep] = useState(0);
  const [demographicsData, setDemographicsData] = useState<DemographicsFormData>();

  const { data } = useQuery(`Instrument`, () => InstrumentsAPI.getInstrument(params.id!));
  console.log(data);

  const submitInstrumentRecord = async (responses: InstrumentRecordFormData) => {
    await InstrumentsAPI.submitRecord(params.id!, demographicsData!, responses);
    alert('Success!');
    navigate('/home');
  };

  return data ? (
    <div className="container" style={{ maxWidth: 900 }}>
      <h1 className="text-center">{data.title}</h1>
      <hr className="my-5 border-slate-300" />
      <div className="flex">
        <div className={'flex w-full justify-center rounded-xl bg-indigo-800 p-3 text-white shadow-xl'}>
          <span className="mx-2">Overview</span>
        </div>
        <div
          className={clsx('mx-5 flex w-full justify-center rounded-xl bg-indigo-800 p-3 text-white shadow-xl', {
            'opacity-50': 1 > step
          })}
        >
          <span className="mx-2">Demographics Questions</span>
        </div>
        <div
          className={clsx('flex w-full justify-center rounded-xl bg-indigo-800 p-3 text-white shadow-xl', {
            'opacity-50': 2 > step
          })}
        >
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
        {step === 2 && <InstrumentRecordForm fields={data.data} title={data.title} onSubmit={submitInstrumentRecord} />}
      </div>
    </div>
  ) : null;
};
