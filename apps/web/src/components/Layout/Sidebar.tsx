import { toBasicISOString, toLowerCase } from '@douglasneuroinformatics/libjs';
import { ThemeToggle } from '@douglasneuroinformatics/libui/components';
import { Branding } from '@opendatacapture/react-core';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import { useActiveVisitStore } from '@/stores/active-visit-store';

import { Navigation } from './Navigation';
import { UserDropup } from './UserDropup';

export const Sidebar = () => {
  const { activeVisit } = useActiveVisitStore();
  const { t } = useTranslation(['core', 'common']);
  return (
    <div className="flex h-screen w-80 flex-col bg-slate-900 p-3 text-slate-300 shadow-lg dark:border-r dark:border-slate-700">
      <Branding className="h-14 md:p-2" logoVariant="light" />
      <hr className="my-1 h-[1px] border-none bg-slate-700" />
      <Navigation
        btn={{
          activeClassName: 'text-slate-100 bg-slate-800',
          className: 'text-slate-300 hover:text-slate-100 hover:bg-slate-800'
        }}
        isAlwaysDark={true}
        orientation="vertical"
      />
      <hr className="invisible mt-auto" />
      <AnimatePresence>
        {activeVisit && (
          <motion.div
            animate={{ opacity: 1 }}
            className="my-3 rounded-md border border-slate-700 bg-slate-800 p-2 tracking-tight"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
          >
            <h3 className="font-medium">{t('common:currentSubject', { context: activeVisit.subject.sex })}</h3>
            <hr className="my-1.5 h-[1px] border-none bg-slate-700" />
            <div className="text-sm">
              <p>{`${t('fullName')}: ${activeVisit.subject.firstName} ${activeVisit.subject.lastName}`}</p>
              <p>
                {`${t('identificationData.dateOfBirth.label')}: ${toBasicISOString(activeVisit.subject.dateOfBirth)}`}{' '}
              </p>
              <p>
                {`${t('identificationData.sex.label')}: ${t(`core:identificationData.sex.${toLowerCase(activeVisit.subject.sex)}`)}`}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <hr className="my-1 h-[1px] border-none bg-slate-700" />
      <div className="flex items-center">
        <UserDropup />
        <ThemeToggle />
      </div>
    </div>
  );
};
