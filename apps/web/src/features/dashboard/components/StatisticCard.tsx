import { useEffect } from 'react';

import { Card } from '@douglasneuroinformatics/libui/components';
import { motion, useSpring, useTransform } from 'motion/react';

type StatisticCardProps = {
  icon?: JSX.Element;
  label: string;
  value: number;
};

export const StatisticCard = ({ icon, label, value }: StatisticCardProps) => {
  const spring = useSpring(0, { bounce: 0 });
  const rounded = useTransform(spring, (latest: number) => Math.floor(latest));

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return (
    <Card className="flex w-full rounded-lg p-4">
      {icon && <div className="mr-2 flex items-center justify-center text-4xl">{icon}</div>}
      <div className="w-full">
        <motion.h3 className="title-font text-2xl font-semibold text-slate-900 sm:text-3xl dark:text-slate-100">
          {rounded}
        </motion.h3>
        <p className="font-medium leading-relaxed">{label}</p>
      </div>
    </Card>
  );
};
