import React, { useCallback } from 'react';

export type InteractiveInstrumentContainerProps = {
  instrument: InteractiveInstrument<unknown, Language>;
};

export const InteractiveInstrumentContainer = React.memo<InteractiveInstrumentContainerProps>(
  function InteractiveInstrumentContainer({ instrument }) {
    const done = useCallback((data: unknown) => {
      // eslint-disable-next-line no-alert
      alert(JSON.stringify(data, null, 2));
    }, []);
    return instrument.content.render(done);
  }
);
