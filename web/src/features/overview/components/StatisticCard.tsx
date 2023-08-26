import React, { useEffect } from 'react';

import { type MotionValue, motion, useSpring, useTransform } from 'framer-motion';

type StatisticCardProps = {
  label: string;
  icon?: JSX.Element;
  value: number;
};

export const StatisticCard = ({ label, icon, value }: StatisticCardProps) => {
  const spring = useSpring(0, { bounce: 0 }) as MotionValue<number>;
  const rounded = useTransform(spring, (latest: number) => Math.floor(latest));

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return (
    <div className="flex w-full rounded-2xl bg-white p-4 text-slate-600 shadow-lg ring-1 ring-slate-900/5 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-300/5">
      {icon && <div className="mr-2 flex items-center justify-center text-5xl">{icon}</div>}
      <div className="w-full">
        <motion.h3 className="title-font text-3xl font-medium text-slate-900 dark:text-slate-100 sm:text-4xl">
          {rounded}
        </motion.h3>
        <p className="leading-relaxed">{label}</p>
      </div>
    </div>
  );
};
