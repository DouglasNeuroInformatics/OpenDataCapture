import React from 'react';

import { Instrument } from 'common';

interface InstrumentOverviewProps {
  instrument: Instrument;
  onConfirm: () => void;
}

const InstrumentOverview = ({ instrument, onConfirm }: InstrumentOverviewProps) => {
  return (
    <div>
      <h3>Overview</h3>
      <div className="mt-3">
        <h5 className="font-semibold">Description</h5>
        <span>{instrument.description}</span>
      </div>
      <div className="mt-3">
        <h5 className="font-semibold">Instructions</h5>
        <span>{instrument.instructions}</span>
      </div>
      <div className="mt-3">
        <h5 className="font-semibold">Estimated Completion</h5>
        <span>{instrument.estimatedDuration} Minute(s)</span>
      </div>
      <button className="btn-primary mt-3" type="button" onClick={onConfirm}>
        Next
      </button>
    </div>
  );
};

export { InstrumentOverview as default, type InstrumentOverviewProps };
