import React, { useState } from 'react';

import { Card } from '@douglasneuroinformatics/libui/components';
import { LockClosedIcon } from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

type LoginButtonProps = {
  onClick: () => void;
};

export const LoginButton = ({ onClick }: LoginButtonProps) => {
  const [showInfo, setShowInfo] = useState(false);
  const { t } = useTranslation('auth');
  return (
    <div className="relative flex items-center">
      <AnimatePresence>
        <motion.div
          animate={{ opacity: showInfo ? 1 : 0, scale: showInfo ? 1 : 0 }}
          className="absolute -top-10 origin-bottom-left"
        >
          <Card className="rounded p-1">
            <span className="whitespace-nowrap text-sm">{t('demo.useCredentials')}</span>
          </Card>
        </motion.div>
      </AnimatePresence>
      <button
        className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-1.5 text-sm font-medium leading-5 text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        type="button"
        onClick={onClick}
        onMouseEnter={() => setShowInfo(true)}
        onMouseLeave={() => setShowInfo(false)}
      >
        {t('login')}
        <LockClosedIcon height={16} width={16} />
      </button>
    </div>
  );
};
