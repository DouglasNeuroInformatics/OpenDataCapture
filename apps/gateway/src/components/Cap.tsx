import React, { useCallback, useEffect, useRef } from 'react';

import { useTranslation } from '@douglasneuroinformatics/libui/hooks';

import '@cap.js/widget';

const CapWidget: React.FC<{ onSolve: (token: string) => void }> = ({ onSolve }) => {
  const { t } = useTranslation();
  const ref = useRef<HTMLElement>(null);

  const label = t({
    en: "I'm a human",
    fr: 'Je suis un humain'
  });

  const handleSolve = useCallback(
    (event: CustomEvent<{ token: string }>) => {
      const token = event.detail.token;
      onSolve(token);
    },
    [onSolve]
  );

  useEffect(() => {
    ref.current?.addEventListener('solve', handleSolve);
    return () => {
      ref.current?.removeEventListener('solve', handleSolve);
    };
  }, []);

  return (
    <cap-widget
      data-cap-api-endpoint="/api/auth/"
      data-cap-i18n-error-label={t({
        en: 'Error',
        fr: 'Erreur'
      })}
      data-cap-i18n-initial-state={t({
        en: "I'm a human",
        fr: 'Je suis un humain'
      })}
      data-cap-i18n-solved-label={label}
      id="cap"
      ref={ref}
    />
  );
};

export default CapWidget;
