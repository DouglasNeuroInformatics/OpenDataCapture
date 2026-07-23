import { useEffect, useRef, useState } from 'react';

import { LanguageToggle, ThemeToggle } from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { Language } from '@douglasneuroinformatics/libui/i18n';
import { CoreProvider } from '@douglasneuroinformatics/libui/providers';
import { Branding, InstrumentRenderer } from '@opendatacapture/react-core';
import type { InstrumentSubmitHandler } from '@opendatacapture/react-core';
import type { UpdateRemoteAssignmentData } from '@opendatacapture/schemas/assignment';
import type { InstrumentBundleContainer } from '@opendatacapture/schemas/instrument';
import axios from 'axios';

import CapWidget from './components/Cap';

import './services/axios';
import './services/i18n';

const GATEWAY_LANGUAGES: { [key: string]: string } = { en: 'English', fr: 'Français' };
const VALID_LANGUAGES = ['en', 'es', 'fr'];

export type RootProps = {
  id: string;
  initialSeriesIndex?: number;
  lang?: string;
  target: InstrumentBundleContainer;
  token: string;
};

export const Root = ({ id, initialSeriesIndex, lang, target, token }: RootProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const notifications = useNotificationsStore();
  const { changeLanguage } = useTranslation();

  const [verified, setVerified] = useState(false);

  useEffect(() => {
    ref.current!.style.display = 'flex';
    const targetLang = lang ?? new URLSearchParams(window.location.search).get('lang') ?? undefined;
    if (targetLang && VALID_LANGUAGES.includes(targetLang)) {
      changeLanguage(targetLang as Language);
    }
  }, []);

  // Solving the Cap challenge redeems a short-lived token; exchange it immediately for a
  // server-side verification flag so the form is not bound by the token's 20-minute lifetime.
  const handleSolve = async (token: string) => {
    try {
      await axios.post('/api/auth/verify', { id, token });
      setVerified(true);
    } catch {
      notifications.addNotification({ message: 'Verification failed, please try again', type: 'error' });
    }
  };

  const handleSubmit: InstrumentSubmitHandler = async (result) => {
    if (!verified) {
      notifications.addNotification({ message: 'Please complete the verification challenge', type: 'error' });
      return;
    }
    let updateData: UpdateRemoteAssignmentData;
    if (target.kind === 'SERIES' && result.kind === 'SERIES') {
      updateData = {
        ...result,
        status: result.complete ? 'COMPLETE' : undefined
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
    <CoreProvider>
      <div className="flex h-screen flex-col" ref={ref} style={{ display: 'none' }}>
        <header className="fixed top-0 z-10 w-full bg-white/80 text-slate-700 shadow-sm backdrop-blur-lg dark:bg-slate-800/75 dark:text-slate-300">
          <div className="container flex items-center justify-between py-3 font-medium">
            <Branding className="[&>span]:hidden sm:[&>span]:block" fontSize="md" />
            <div className="flex gap-3">
              <ThemeToggle className="h-9 w-9" />
              <LanguageToggle options={GATEWAY_LANGUAGES} triggerClassName="h-9 w-9" />
            </div>
          </div>
        </header>
        <main className="container flex min-h-0 max-w-3xl grow flex-col pb-16 pt-32 xl:max-w-5xl">
          <InstrumentRenderer
            disableSummaryActions
            beforeBegin={<CapWidget onSolve={(token) => void handleSolve(token)} />}
            className="min-h-full w-full"
            disableBegin={!verified}
            initialSeriesIndex={initialSeriesIndex}
            target={target}
            onSubmit={handleSubmit}
          />
        </main>
      </div>
    </CoreProvider>
  );
};
