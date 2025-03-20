import { useEffect, useRef } from 'react';

import { LanguageToggle, NotificationHub, ThemeToggle } from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import { InstrumentRenderer } from '@opendatacapture/instrument-renderer';
import type { InstrumentSubmitHandler } from '@opendatacapture/instrument-renderer';
import { Branding } from '@opendatacapture/react-core';
import type { UpdateRemoteAssignmentData } from '@opendatacapture/schemas/assignment';
import type { InstrumentBundleContainer } from '@opendatacapture/schemas/instrument';
import axios from 'axios';

import './services/axios';
import './services/i18n';

export type RootProps = {
  id: string;
  initialSeriesIndex?: number;
  target: InstrumentBundleContainer;
  token: string;
};

export const Root = ({ id, initialSeriesIndex, target, token }: RootProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const notifications = useNotificationsStore();

  useEffect(() => {
    ref.current!.style.display = 'flex';
  }, []);

  const handleSubmit: InstrumentSubmitHandler = async (result) => {
    let updateData: UpdateRemoteAssignmentData;
    if (target.kind === 'SERIES' && result.kind === 'SERIES') {
      updateData = {
        ...result,
        status: result.instrumentId === target.items.at(-1)?.id ? 'COMPLETE' : undefined
      };
    } else if (target.kind !== 'SERIES') {
      updateData = {
        data: result.data,
        kind: 'SCALAR',
        status: 'COMPLETE'
      };
    } else {
      notifications.addNotification({ message: 'Internal Server Error', type: 'error' });
      return;
    }
    await axios.patch(`/api/assignments/${id}`, updateData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
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
        <InstrumentRenderer
          className="min-h-full w-full"
          initialSeriesIndex={initialSeriesIndex}
          target={target}
          onSubmit={handleSubmit}
        />
      </main>
      <NotificationHub />
    </div>
  );
};
