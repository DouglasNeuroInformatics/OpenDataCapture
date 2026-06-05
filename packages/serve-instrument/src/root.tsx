import React, { useEffect, useState } from 'react';

import { i18n } from '@douglasneuroinformatics/libui/i18n';
import { ScalarInstrumentRenderer } from '@opendatacapture/react-core';
import { decodeBase64ToUnicode } from '@opendatacapture/runtime-internal';

i18n.init({ translations: {} });

const LanguageSwitcher: React.FC = () => {
  const [lang, setLang] = useState<'en' | 'fr'>(i18n.resolvedLanguage as 'en' | 'fr');
  useEffect(() => {
    const handler = (l: 'en' | 'fr') => setLang(l);
    i18n.addEventListener('languageChange', handler);
    return () => {
      i18n.removeEventListener('languageChange', handler);
    };
  }, []);
  return (
    <div className="flex gap-2">
      {(['en', 'fr'] as const).map((l) => (
        <button
          className={`text-sm uppercase ${lang === l ? 'font-bold underline' : 'text-gray-500 hover:text-gray-900'}`}
          key={l}
          onClick={() => i18n.changeLanguage(l)}
        >
          {l}
        </button>
      ))}
    </div>
  );
};

type InstrumentEntry = {
  name: string;
  type: 'forms' | 'interactive';
};

export type RootProps =
  | { encodedBundle: string; page: 'single' }
  | { encodedBundle: string; instrumentName: string; instrumentType: string; page: 'instrument' }
  | { instruments: InstrumentEntry[]; page: 'index' };

const IndexPage: React.FC<{ instruments: InstrumentEntry[] }> = ({ instruments }) => {
  const forms = instruments.filter((i) => i.type === 'forms');
  const interactive = instruments.filter((i) => i.type === 'interactive');

  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Instruments</h1>
        <LanguageSwitcher />
      </div>
      {forms.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">Forms</h2>
          <ul className="space-y-2">
            {forms.map((inst) => (
              <li key={inst.name}>
                <a
                  className="text-blue-600 underline hover:text-blue-800"
                  href={`/forms/${encodeURIComponent(inst.name)}`}
                >
                  {inst.name}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
      {interactive.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">Interactive</h2>
          <ul className="space-y-2">
            {interactive.map((inst) => (
              <li key={inst.name}>
                <a
                  className="text-blue-600 underline hover:text-blue-800"
                  href={`/interactive/${encodeURIComponent(inst.name)}`}
                >
                  {inst.name}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export const Root: React.FC<RootProps> = (props) => {
  if (props.page === 'single') {
    return (
      <div className="container h-screen py-16">
        <ScalarInstrumentRenderer
          key={props.encodedBundle}
          target={{ bundle: decodeBase64ToUnicode(props.encodedBundle), id: null! }}
          onSubmit={({ data }) => {
            // eslint-disable-next-line no-alert
            alert(JSON.stringify({ _message: 'The following data will be submitted', data }, null, 2));
          }}
        />
      </div>
    );
  }

  if (props.page === 'index') {
    return <IndexPage instruments={props.instruments} />;
  }

  return (
    <div className="container h-screen py-8">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <a className="text-sm text-blue-600 underline hover:text-blue-800" href="/">
            &larr; Back to list
          </a>
          <h1 className="mt-2 text-lg font-semibold">
            {props.instrumentType}/{props.instrumentName}
          </h1>
        </div>
        <LanguageSwitcher />
      </div>
      <ScalarInstrumentRenderer
        key={props.encodedBundle}
        target={{ bundle: decodeBase64ToUnicode(props.encodedBundle), id: null! }}
        onSubmit={({ data }) => {
          // eslint-disable-next-line no-alert
          alert(JSON.stringify({ _message: 'The following data will be submitted', data }, null, 2));
        }}
      />
    </div>
  );
};

export type { InstrumentEntry };
