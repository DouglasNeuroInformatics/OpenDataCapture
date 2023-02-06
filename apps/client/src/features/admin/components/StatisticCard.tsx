import React from 'react';

interface StatisticCardProps {
  label: string;
  icon?: JSX.Element;
  value: any;
}

export const StatisticCard = ({ label, icon, value }: StatisticCardProps) => {
  return (
    <div className="flex w-full rounded-lg border bg-white p-4">
      {icon && <div className="mr-2 flex items-center justify-center text-5xl">{icon}</div>}
      <div className="w-full">
        <h2 className="title-font text-3xl font-medium text-gray-900 sm:text-4xl">{value}</h2>
        <p className="leading-relaxed">{label}</p>
      </div>
    </div>
  );
};
