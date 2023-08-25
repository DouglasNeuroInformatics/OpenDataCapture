import React, { useEffect } from 'react';

import { type MotionValue, motion, useSpring, useTransform } from 'framer-motion';

type StatisticCardProps = {
  label: string;
  icon?: JSX.Element;
  value: number;
}

export const StatisticCard = ({ label, icon, value }: StatisticCardProps) => {
  const spring = useSpring(0, { bounce: 0 }) as MotionValue<number>;
  const rounded = useTransform(spring, (latest: number) => Math.floor(latest));

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return (
    <div className="flex w-full rounded-lg border bg-white p-4">
      {icon && <div className="mr-2 flex items-center justify-center text-5xl">{icon}</div>}
      <div className="w-full">
        <motion.h3 className="title-font text-3xl font-medium text-gray-900 sm:text-4xl">{rounded}</motion.h3>
        <p className="leading-relaxed">{label}</p>
      </div>
    </div>
  );
};
