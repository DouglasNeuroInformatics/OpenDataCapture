import { NotificationHub, useNotificationsStore } from '@douglasneuroinformatics/ui';
import { InstrumentRenderer } from '@open-data-capture/instrument-renderer';
import { Navbar } from '@open-data-capture/react-core';
import { useTranslation } from 'react-i18next';

import './services/i18n';

export type RootProps = {
  bundle: string;
};

export const Root = ({ bundle }: RootProps) => {
  const { i18n } = useTranslation('core');
  const notifications = useNotificationsStore();

  const handleSubmit = () => {
    notifications.addNotification({ message: 'Success', type: 'success' });
  };

  return (
    <div className="flex h-screen flex-col bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <header>
        <Navbar i18n={i18n} />;
      </header>
      <main className="container flex max-w-3xl flex-grow flex-col pt-16">
        <InstrumentRenderer bundle={bundle} className="min-h-full w-full" onSubmit={handleSubmit} />
      </main>
      <NotificationHub />
    </div>
  );
};
