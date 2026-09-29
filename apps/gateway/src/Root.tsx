import { useEffect, useRef, useState } from 'react';

import { ThemeToggle } from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import { CoreProvider } from '@douglasneuroinformatics/libui/providers';
import { Branding, InstrumentRenderer, LanguageToggle } from '@opendatacapture/react-core';
import type { InstrumentSubmitHandler } from '@opendatacapture/react-core';
import type { UpdateRemoteAssignmentData } from '@opendatacapture/schemas/assignment';
import type { ActiveLanguages, Language } from '@opendatacapture/schemas/core';
import type { InstrumentBundleContainer } from '@opendatacapture/schemas/instrument';
import axios from 'axios';

import CapWidget from './components/Cap';
import Landing from './components/Landing';

import './services/axios';
import './services/i18n';

type BaseRootProps = {
  activeLanguages: ActiveLanguages;
  language: Language;
};

type AssignmentProps = {
  id: string;
  initialSeriesIndex?: number;
  target: InstrumentBundleContainer;
  token: string;
};

type AssignmentRootProps = AssignmentProps & BaseRootProps & { kind: 'assignment' };

type LandingRootProps = BaseRootProps & { kind: 'landing' };

type RootProps = AssignmentRootProps | LandingRootProps;

const Assignment = ({ id, initialSeriesIndex, target, token }: AssignmentProps) => {
  const notifications = useNotificationsStore();

  const [verified, setVerified] = useState(false);

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
    <InstrumentRenderer
      disableSummaryActions
      beforeBegin={<CapWidget onSolve={(token) => void handleSolve(token)} />}
      className="min-h-full w-full"
      disableBegin={!verified}
      initialSeriesIndex={initialSeriesIndex}
      target={target}
      onSubmit={handleSubmit}
    />
  );
};

// `language` is not read here: the entry points apply it to the translator before render, so that
// the server and the client start from the same resolved language.
export const Root = (props: RootProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current!.style.display = 'flex';
  }, []);

  return (
    <CoreProvider>
      <div className="flex h-screen flex-col" ref={ref} style={{ display: 'none' }}>
        <header className="fixed top-0 z-10 w-full bg-white/80 text-slate-700 shadow-sm backdrop-blur-lg dark:bg-slate-800/75 dark:text-slate-300">
          <div className="container flex items-center justify-between py-3 font-medium">
            <Branding className="[&>span]:hidden sm:[&>span]:block" fontSize="md" />
            <div className="flex gap-3">
              <ThemeToggle className="h-9 w-9" />
              <LanguageToggle activeLanguages={props.activeLanguages} triggerClassName="h-9 w-9" />
            </div>
          </div>
        </header>
        <main className="container flex min-h-0 max-w-3xl grow flex-col pb-16 pt-32 xl:max-w-5xl">
          {props.kind === 'assignment' ? <Assignment {...props} /> : <Landing />}
        </main>
      </div>
    </CoreProvider>
  );
};

export type { RootProps };
