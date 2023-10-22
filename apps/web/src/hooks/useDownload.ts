import { useEffect, useState } from 'react';

import { useNotificationsStore } from '@douglasneuroinformatics/ui';
import { useTranslation } from 'react-i18next';

export function useDownload() {
  const notifications = useNotificationsStore();
  const { t } = useTranslation();
  const [data, setData] = useState<null | string>(null);
  const [filename, setFilename] = useState<null | string>(null);

  useEffect(() => {
    if (data && filename) {
      const anchor = document.createElement('a');
      document.body.appendChild(anchor);
      const blob = new Blob([data], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(url);
      anchor.remove();
      setData(null);
      setFilename(null);
    }
  }, [data, filename]);

  return (filename: string, fetchData: () => Promise<string>) => {
    fetchData()
      .then((value) => {
        setData(value);
        setFilename(filename);
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : t('unknownError');
        notifications.addNotification({
          message,
          title: t('error'),
          type: 'error'
        });
      });
  };
}
