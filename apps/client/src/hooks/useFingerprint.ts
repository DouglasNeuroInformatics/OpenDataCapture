import { useEffect, useState } from 'react';

import { Fingerprint } from '@douglasneuroinformatics/common';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

export const useFingerprint = () => {
  const [fingerprint, setFingerprint] = useState<Fingerprint | null>(null);

  useEffect(() => {
    FingerprintJS.load()
      .then((fp) => fp.get())
      .then(({ visitorId, components }) => {
        setFingerprint({
          visitorId,
          language: navigator.language,
          screenResolution: components.screenResolution.value
        });
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return fingerprint;
};
