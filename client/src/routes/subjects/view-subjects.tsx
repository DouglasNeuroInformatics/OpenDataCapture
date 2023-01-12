import React from 'react';

import { Subject, subjectSchema } from 'common';
import { useQuery } from 'react-query';
import { z } from 'zod';

import useAuth from '@/hooks/useAuth';

const ViewSubjectsPage = () => {
  const auth = useAuth();
  const { data, error } = useQuery('ViewSubjects', async () => {
    const response = await fetch(`${import.meta.env.VITE_API_HOST}/api/subjects`, {
      headers: {
        Authorization: 'Bearer ' + auth.accessToken!
      }
    });
    return z.array(subjectSchema).parseAsync(await response.json());
  });

  if (error) {
    console.error(error);
  }

  // console.log(data && z.array(subjectSchema).parse(data));
  // console.log(data, error);

  return (
    data && (
      <div className="flex flex-col items-center">
        <h1>View Subjects</h1>
        <table>
          <thead>
            <tr className="border-b">
              <th>Subject ID</th>
              <th>Date of Birth</th>
              <th>Sex</th>
            </tr>
          </thead>
          <tbody>
            {data.map(
              (
                subject,
                i // later key should be ID
              ) => (
                <tr key={i}>
                  <td className="p-1">{i}</td>
                  <td className="p-1">{subject.dateOfBirth.toDateString()}</td>
                  <td className="p-1">{subject.sex}</td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    )
  );
};

export { ViewSubjectsPage as default };
