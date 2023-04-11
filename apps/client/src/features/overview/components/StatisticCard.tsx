import React from 'react';

import { animated, useSpring } from '@react-spring/web';

interface StatisticCardProps {
  label: string;
  icon?: JSX.Element;
  value: number;
}

export const StatisticCard = ({ label, icon, value }: StatisticCardProps) => {
  const springs = useSpring({
    from: { value: 0 },
    to: { value }
  });

  return (
    <div className="flex w-full rounded-lg border bg-white p-4">
      {icon && <div className="mr-2 flex items-center justify-center text-5xl">{icon}</div>}
      <div className="w-full">
        <animated.h3 className="title-font text-3xl font-medium text-gray-900 sm:text-4xl">
          {springs.value.to((v) => Math.floor(v))}
        </animated.h3>
        <p className="leading-relaxed">{label}</p>
      </div>
    </div>
  );
};
