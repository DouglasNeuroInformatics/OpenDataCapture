import { useEffect, useRef } from 'react';

import { useTheme } from '@douglasneuroinformatics/libui/hooks';
import qrcode from 'qrcode';

export const QRCode = ({ url }: { url: string }) => {
  const ref = useRef<HTMLCanvasElement>(null);

  const [theme] = useTheme();

  useEffect(() => {
    qrcode.toCanvas(
      ref.current,
      url,
      {
        color: {
          dark: theme === 'dark' ? '#f1f5f9' : '#0f172a',
          light: '#0000'
        },
        margin: 2,
        scale: 6
      },
      (error) => {
        if (error) {
          console.error(error);
        }
      }
    );
  }, [theme, url]);

  return <canvas className="rounded-md border" ref={ref} />;
};
