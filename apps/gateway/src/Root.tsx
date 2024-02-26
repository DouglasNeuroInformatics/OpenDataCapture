import { BaseLanguageToggle, NotificationHub, ThemeToggle, useNotificationsStore } from '@douglasneuroinformatics/ui';
import type { UpdateAssignmentData } from '@open-data-capture/common/assignment';
import { $Json } from '@open-data-capture/common/core';
import { InstrumentRenderer } from '@open-data-capture/instrument-renderer';
import { Branding } from '@open-data-capture/react-core';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import './services/axios';
import './services/i18n';

export type RootProps = {
  bundle: string;
  id: string;
  token: string;
};

export const Root = ({ bundle, id, token }: RootProps) => {
  const { i18n } = useTranslation('core');
  const notifications = useNotificationsStore();

  const handleSubmit = async (data: unknown) => {
    const result = await $Json.safeParseAsync(data);
    if (!result.success) {
      console.error(result.error);
      notifications.addNotification({ type: 'error' });
      return;
    }
    await axios.patch(
      `/api/assignments/${id}`,
      {
        data: result.data,
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
    <div className="flex h-screen flex-col">
      <header className="fixed top-0 z-10 w-full bg-white/80 text-slate-700 shadow backdrop-blur-lg dark:bg-slate-800/75 dark:text-slate-300">
        <div className="container flex items-center justify-between bg-inherit py-3 font-medium">
          <Branding />
          <div className="flex gap-3 bg-inherit">
            <ThemeToggle />
            <BaseLanguageToggle i18n={i18n} options={['en', 'fr']} />
          </div>
        </div>
      </header>
      <main className="container flex max-w-3xl flex-grow flex-col pb-16 pt-32 xl:max-w-5xl">
        <InstrumentRenderer bundle={bundle} className="min-h-full w-full" onSubmit={handleSubmit} />
      </main>
      <NotificationHub />
    </div>
  );
};
