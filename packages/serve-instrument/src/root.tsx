import React from 'react';

import { i18n } from '@douglasneuroinformatics/libui/i18n';
import { ScalarInstrumentRenderer } from '@opendatacapture/react-core';
import { decodeBase64ToUnicode } from '@opendatacapture/runtime-internal';

i18n.init({ translations: {} });

export type RootProps = {
  encodedBundle: string;
};

export const Root: React.FC<RootProps> = ({ encodedBundle }) => {
  return (
    <div className="container h-screen py-16">
      <ScalarInstrumentRenderer
        key={encodedBundle}
        target={{ bundle: decodeBase64ToUnicode(encodedBundle), id: null! }}
        onSubmit={({ data }) => {
          // eslint-disable-next-line no-alert
          alert(JSON.stringify({ _message: 'The following data will be submitted', data }, null, 2));
        }}
      />
    </div>
  );
};
