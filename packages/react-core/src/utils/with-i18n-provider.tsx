import React from 'react';

import { I18nextProvider } from 'react-i18next';

import i18n, { defaultNS } from '../services/i18n';

export function withI18nProvider<T extends object>(Component: React.ComponentType<T>) {
  const Wrapper = (props: T) => {
    return (
      <I18nextProvider defaultNS={defaultNS} i18n={i18n}>
        <Component {...props} />
      </I18nextProvider>
    );
  };
  return Wrapper;
}
