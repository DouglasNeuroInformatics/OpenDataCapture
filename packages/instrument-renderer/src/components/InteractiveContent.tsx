import { useEffect, useRef } from 'react';

import type { Json } from '@open-data-capture/common/core';
import type { InteractiveInstrument } from '@open-data-capture/common/instrument';
import type { Promisable } from 'type-fest';

function bootstrap() {
  console.log('bootstrap');
}

export type InteractiveContentProps = {
  instrument: InteractiveInstrument;
  onSubmit: (data: Json) => Promisable<void>;
};

export const InteractiveContent = ({ instrument, onSubmit }: InteractiveContentProps) => {
  const ref = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const contentWindow: Window & { __BOOTSTRAP__?: () => void } = ref.current!.contentWindow!.window;
    contentWindow.__BOOTSTRAP__ = function () {
      console.log(window.name, this.name);
    };
  }, []);

  return (
    <iframe
      name="interactive-instrument"
      ref={ref}
      srcDoc={`
        <div id="root">
          Hello
        </div>
        <script>
          window.__BOOTSTRAP__()
        </script>`}
      title="Open Data Capture - Interactive Instrument"
    />
  );
};
