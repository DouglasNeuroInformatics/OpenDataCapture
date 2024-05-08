import React, { useEffect, useRef } from 'react';

import { NotificationHub } from '@douglasneuroinformatics/libui/components';
import { LanguageToggle, ThemeToggle } from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import { InstrumentRenderer } from '@opendatacapture/instrument-renderer';
import { Branding } from '@opendatacapture/react-core';
import type { UpdateAssignmentData } from '@opendatacapture/schemas/assignment';
import axios from 'axios';

import './services/axios';
import './services/i18n';

export type RootProps = {
  bundle: string;
  id: string;
  token: string;
};

export const Root = ({ bundle, id, token }: RootProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const notifications = useNotificationsStore();

  useEffect(() => {
    ref.current!.style.display = 'block';
  }, []);

  const handleSubmit = async (data: unknown) => {
    await axios.patch(
      `/api/assignments/${id}`,
      {
        data: data as UpdateAssignmentData['data'],
        status: 'COMPLETE'
      } satisfies UpdateAssignmentData,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    notifications.addNotification({ type: 'success' });
  };

  return (
    <div className="flex h-screen flex-col" ref={ref} style={{ display: 'none' }}>
      <header className="fixed top-0 z-10 w-full bg-white/80 text-slate-700 shadow backdrop-blur-lg dark:bg-slate-800/75 dark:text-slate-300">
        <div className="container flex items-center justify-between py-3 font-medium">
          <Branding className="[&>span]:hidden sm:[&>span]:block" fontSize="md" />
          <div className="flex gap-3">
            <ThemeToggle className="h-9 w-9" />
            <LanguageToggle
              options={{
                en: 'English',
                fr: 'Français'
              }}
              triggerClassName="h-9 w-9"
            />
          </div>
        </div>
      </header>
      <main className="container flex min-h-0 max-w-3xl flex-grow flex-col pb-16 pt-32 xl:max-w-5xl">
        <InstrumentRenderer bundle={bundle} className="min-h-full w-full" onSubmit={handleSubmit} />
      </main>
      <NotificationHub />
    </div>
  );
};
