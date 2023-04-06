import { useEffect, useState } from 'react';

import { useNotificationsStore } from '@/stores/notifications-store';

export function useDownload() {
  const notifications = useNotificationsStore();
  const [data, setData] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | null>(null);

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
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        notifications.add({
          type: 'error',
          title: 'Error',
          message
        });
      });
  };
}
