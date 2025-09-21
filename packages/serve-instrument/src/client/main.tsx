import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { i18n } from '@douglasneuroinformatics/libui/i18n';
import { ScalarInstrumentRenderer } from '@opendatacapture/react-core';

import '@opendatacapture/react-core/globals.css';

const container = document.getElementById('root')!;
const initialBundle = container.getAttribute('data-initial-bundle')!;
const root = createRoot(container);

i18n.init({ translations: {} });

const App = () => {
  const [encodedBundle, setEncodedBundle] = useState(initialBundle);

  useEffect(() => {
    import.meta.hot!.on('update-bundle', (data: { encodedBundle: string }) => {
      setEncodedBundle(data.encodedBundle);
    });
  }, []);

  return (
    <div className="container h-screen py-16">
      <ScalarInstrumentRenderer
        key={encodedBundle}
        target={{ bundle: atob(encodedBundle), id: null! }}
        onSubmit={({ data }) => {
          // eslint-disable-next-line no-alert
          alert(JSON.stringify({ _message: 'The following data will be submitted', data }, null, 2));
        }}
      />
    </div>
  );
};

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
