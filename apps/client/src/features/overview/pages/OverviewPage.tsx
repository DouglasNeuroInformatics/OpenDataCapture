import React from 'react';

import { HiUsers } from 'react-icons/hi2';

import { StatisticCard } from '../components/StatisticCard';

import { PageHeader } from '@/components/core';
import { useAuthStore } from '@/stores/auth-store';

export const OverviewPage = () => {
  const { currentUser } = useAuthStore();

  const pageTitle = currentUser?.firstName ? `Welcome Back, ${currentUser.firstName}` : 'Welcome Back';

  return (
    <div>
      <PageHeader title={pageTitle} />
      <section className="body-font text-gray-600">
        <div className="container mx-auto px-5 py-24">
          <div className="-m-4 grid grid-cols-1 gap-5 text-center md:grid-cols-3">
            <StatisticCard icon={<HiUsers />} label="Total Users" value={5} />
            <StatisticCard icon={<HiUsers />} label="Total Subjects" value={5} />
            <StatisticCard icon={<HiUsers />} label="Total Instruments" value={5} />
          </div>
        </div>
      </section>
    </div>
  );
};
