import React, { useState } from 'react';

import clsx from 'clsx';
import { useQuery } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';

import { InstrumentsAPI } from '../api/instruments.api';
import { DemographicsForm, DemographicsFormData } from '../components/DemographicsForm';
import { InstrumentOverview } from '../components/InstrumentOverview';
import { InstrumentRecordForm, InstrumentRecordFormData } from '../components/InstrumentRecordForm';

import { Divider } from '@/components/base';
import { PageHeader, Spinner } from '@/components/core';
import { useNotificationsStore } from '@/stores/notifications-store';

export const InstrumentPage = () => {
  const notifications = useNotificationsStore();
  const navigate = useNavigate();
  const params = useParams();
  const [step, setStep] = useState(0);
  const [demographicsData, setDemographicsData] = useState<DemographicsFormData>();

  const { data, isLoading } = useQuery(`Instrument`, () => InstrumentsAPI.getInstrument(params.id!));

  const submitInstrumentRecord = async (responses: InstrumentRecordFormData) => {
    await InstrumentsAPI.submitRecord(params.id!, demographicsData!, responses);
    notifications.add({ type: 'success' });
    navigate('/home');
  };

  if (isLoading) {
    return <Spinner />;
  }

  return data ? (
    <div className="container" style={{ maxWidth: 900 }}>
      <PageHeader title={data.title} />
      <div className="flex">
        <div className={'bg-cello-900 flex w-full justify-center rounded-xl p-3 text-white shadow-xl'}>
          <span className="mx-2">Overview</span>
        </div>
        <div
          className={clsx('bg-cello-900 mx-5 flex w-full justify-center rounded-xl p-3 text-white shadow-xl', {
            'opacity-50': 1 > step
          })}
        >
          <span className="mx-2">Subject Identification</span>
        </div>
        <div
          className={clsx('bg-cello-900 flex w-full justify-center rounded-xl p-3 text-white shadow-xl', {
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
