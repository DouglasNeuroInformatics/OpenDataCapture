import { useEffect, useState } from 'react';
import { useNotificationsStore } from '@douglasneuroinformatics/ui';
export function useDownload() {
  var notifications = useNotificationsStore();
  var _a = useState(null),
    data = _a[0],
    setData = _a[1];
  var _b = useState(null),
    filename = _b[0],
    setFilename = _b[1];
  useEffect(
    function () {
      if (data && filename) {
        var anchor = document.createElement('a');
        document.body.appendChild(anchor);
        var blob = new Blob([data], { type: 'text/plain' });
        var url = URL.createObjectURL(blob);
        anchor.href = url;
        anchor.download = filename;
        anchor.click();
        URL.revokeObjectURL(url);
        anchor.remove();
        setData(null);
        setFilename(null);
      }
    },
    [data, filename]
  );
  return function (filename, fetchData) {
    fetchData()
      .then(function (value) {
        setData(value);
        setFilename(filename);
      })
      .catch(function (error) {
        var message = error instanceof Error ? error.message : 'An unknown error occurred';
        notifications.addNotification({
          type: 'error',
          title: 'Error',
          message: message
        });
      });
  };
}
