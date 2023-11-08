import { useState } from 'react';

import { Card } from '@douglasneuroinformatics/ui';
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
          className="absolute -top-8 origin-bottom-left"
        >
          <Card className="rounded p-1">
            <span className="whitespace-nowrap text-sm">{t('demo.useCredentials')}</span>
          </Card>
        </motion.div>
      </AnimatePresence>
      <button
        type="button"
        onClick={onClick}
        onMouseEnter={() => setShowInfo(true)}
        onMouseLeave={() => setShowInfo(false)}
      >
        <LockClosedIcon height={16} width={16} />
      </button>
    </div>
  );
};
