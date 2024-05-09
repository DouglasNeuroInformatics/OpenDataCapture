import React from 'react';

import { toBasicISOString, toLowerCase } from '@douglasneuroinformatics/libjs';
import { AlertDialog, LanguageToggle, ThemeToggle } from '@douglasneuroinformatics/libui/components';
import { Branding } from '@opendatacapture/react-core';
import { isSubjectWithPersonalInfo } from '@opendatacapture/subject-utils';
import { AnimatePresence, motion } from 'framer-motion';
import { StopCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import { useNavItems } from '@/hooks/useNavItems';
import { useAppStore } from '@/store';

import { NavButton } from '../NavButton';
import { UserDropup } from '../UserDropup';

export const Sidebar = () => {
  const navItems = useNavItems();
  const currentSession = useAppStore((store) => store.currentSession);
  const endSession = useAppStore((store) => store.endSession);
  const location = useLocation();
  const navigate = useNavigate();

  const { t } = useTranslation(['core', 'common', 'layout']);
  return (
    <div className="flex h-screen w-[19rem] flex-col bg-slate-900 px-3 py-2 text-slate-100 shadow-lg dark:border-r dark:border-slate-700">
      <div>
        <Branding className="h-12" fontSize="md" logoVariant="light" />
      </div>
      <hr className="my-2 h-[1px] border-none bg-slate-700" />
      <nav className="flex w-full flex-col divide-y divide-slate-700">
        {navItems.map((items, i) => (
          <div className="flex flex-col py-1 first:pt-0 last:pb-0" key={i}>
            {items.map(({ disabled, id, ...props }) => (
              <NavButton
                disabled={disabled && location.pathname !== id}
                id={id}
                isActive={location.pathname === id}
                key={id}
                {...props}
              />
            ))}
            {i === navItems.length - 1 && (
              <AlertDialog>
                <AlertDialog.Trigger asChild>
                  <NavButton
                    disabled={currentSession === null}
                    icon={StopCircle}
                    id="#"
                    isActive={false}
                    label={t('layout:navLinks.endSession')}
                  />
                </AlertDialog.Trigger>
                <AlertDialog.Content>
                  <AlertDialog.Header>
                    <AlertDialog.Title>{t('layout:endSessionModal.title')}</AlertDialog.Title>
                    <AlertDialog.Description>{t('layout:endSessionModal.message')}</AlertDialog.Description>
                  </AlertDialog.Header>
                  <AlertDialog.Footer>
                    <AlertDialog.Action
                      className="min-w-24"
                      onClick={() => {
                        endSession();
                        navigate('/session/start-session');
                      }}
                    >
                      {t('core:yes')}
                    </AlertDialog.Action>
                    <AlertDialog.Cancel className="min-w-24">{t('core:no')}</AlertDialog.Cancel>
                  </AlertDialog.Footer>
                </AlertDialog.Content>
              </AlertDialog>
            )}
          </div>
        ))}
      </nav>
      <hr className="invisible mt-auto" />
      <AnimatePresence>
        {currentSession && (
          <motion.div
            animate={{ opacity: 1 }}
            className="my-2 rounded-md border border-slate-700 bg-slate-800 p-2 text-sm tracking-tight text-slate-300"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
          >
            <h5 className="text-sm font-medium">{t('common:sessionInProgress')}</h5>
            <hr className="my-1.5 h-[1px] border-none bg-slate-700" />
            {isSubjectWithPersonalInfo(currentSession.subject) ? (
              <div>
                <p>{`${t('fullName')}: ${currentSession.subject.firstName} ${currentSession.subject.lastName}`}</p>
                <p>
                  {`${t('identificationData.dateOfBirth.label')}: ${toBasicISOString(currentSession.subject.dateOfBirth)}`}{' '}
                </p>
                <p>
                  {`${t('identificationData.sex.label')}: ${t(`core:identificationData.sex.${toLowerCase(currentSession.subject.sex)}`)}`}
                </p>
              </div>
            ) : (
              <div>
                <p>ID: {currentSession.subject.id}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <hr className="my-1 h-[1px] border-none bg-slate-700" />
      <div className="flex items-center justify-between py-2">
        <UserDropup />
        <div className="flex h-full items-center gap-2">
          <LanguageToggle
            contentClassName="bg-slate-800 border-slate-700 text-slate-300"
            itemClassName="bg-slate-800 hover:bg-slate-700 focus:bg-slate-700 focus:text-slate-100"
            options={{
              en: 'English',
              fr: 'Français'
            }}
            triggerClassName="hover:bg-slate-800 hover:text-slate-300 focus-visible:ring-0"
            variant="ghost"
          />
          <ThemeToggle className="hover:bg-slate-800 hover:text-slate-300" variant="ghost" />
        </div>
      </div>
    </div>
  );
};
