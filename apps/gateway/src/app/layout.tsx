import { NotificationHub } from '@douglasneuroinformatics/ui';
import type { Metadata } from 'next';

import { Header } from '@/components/Header';

import './styles.css';

export const metadata: Metadata = {
  description: 'Open Data Capture Gateway Service',
  title: 'Open Data Capture'
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
        <Header />
        <main className="container flex max-w-3xl flex-grow flex-col">{children}</main>
        <NotificationHub />
      </body>
    </html>
  );
};

export default RootLayout;
