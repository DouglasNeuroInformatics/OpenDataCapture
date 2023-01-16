import React from 'react';

import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';

import { SubjectsAPI } from '../api/subjects.api';

import { Spinner } from '@/components/core';

export const ViewSubjectsPage = () => {
  const { data, isLoading } = useQuery('ViewSubjects', () => SubjectsAPI.getSubjects());

  if (isLoading) {
    return <Spinner />;
  }

  return (
    data && (
      <div className="flex flex-col items-center">
        <h1>View Subjects</h1>
        <div className="flex flex-col">
          <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
              <div className="overflow-hidden">
                <table className="min-w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900" scope="col">
                        Subject ID
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900" scope="col">
                        Date Registered
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900" scope="col">
                        Date of Birth
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900" scope="col">
                        Sex
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((subject) => (
                      <tr className="border-b" key={subject._id}>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                          <Link to={subject._id!}>{subject._id}</Link>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                          {subject.createdAt?.toDateString()}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                          {subject.dateOfBirth.toDateString()}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{subject.sex}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  );
};
