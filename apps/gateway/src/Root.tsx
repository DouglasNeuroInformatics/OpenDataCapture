import { NotificationHub, useNotificationsStore } from '@douglasneuroinformatics/ui';
import { InstrumentRenderer } from '@open-data-capture/instrument-renderer';
import { Navbar } from '@open-data-capture/react-core';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import './services/axios';
import './services/i18n';

export type RootProps = {
  bundle: string;
};

export const Root = ({ bundle }: RootProps) => {
  const { i18n } = useTranslation('core');
  const notifications = useNotificationsStore();

  const handleSubmit = async () => {
    await axios.post('/api/assignments');
    notifications.addNotification({ message: 'Success', type: 'success' });
  };

  return (
    <div className="flex h-screen flex-col">
      <header>
        <Navbar i18n={i18n} />
      </header>
      <main className="container flex max-w-3xl flex-grow flex-col pb-16 pt-32 xl:max-w-5xl">
        <InstrumentRenderer bundle={bundle} className="min-h-full w-full" onSubmit={handleSubmit} />
      </main>
      <NotificationHub />
    </div>
  );
};
