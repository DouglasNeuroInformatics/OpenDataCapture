import React from 'react';

import { Stats } from 'common';
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { SubjectsAPI } from '../api/subjects.api';

import { Divider } from '@/components/base';
import { Spinner } from '@/components/core';

export const SubjectPage = () => {
  const params = useParams();
  const { data, isLoading } = useQuery('Subject', () => SubjectsAPI.getSubjectInstrumentRecords(params.id!));

  if (isLoading) {
    return <Spinner />;
  }

  const graphData = data?.map((record) => ({
    timepoint: record.dateCollected.split('T')[0],
    mean: Stats.mean(Object.values(record.data), 2),
    std: Stats.std(Object.values(record.data), 2)
  }));

  return data ? (
    <div>
      <h1 className="text-center">Instruments for Subject: {params.id?.slice(0, 6)}</h1>
      <Divider />
      <div>
        <h3 className="mt-5 text-center">Brief Psychiatric Rating Scale</h3>
        <ResponsiveContainer height={400} width="100%">
          <LineChart data={graphData} margin={{ bottom: 20 }}>
            <Line dataKey="mean" stroke="#8884d8" type="monotone" />
            <Line dataKey="std" stroke="#8884d8" type="monotone" />
            <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
            <XAxis dataKey="timepoint" label={{ offset: -15, position: 'insideBottom', value: 'Timepoint' }} />
            <YAxis label={{ angle: -90, value: 'Total Score' }} />
            <Tooltip />
            <Legend height={36} verticalAlign="top" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  ) : null;
};

export default SubjectPage;
