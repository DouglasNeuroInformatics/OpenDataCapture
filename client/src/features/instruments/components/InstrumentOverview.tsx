import React from 'react';

import { InstrumentInterface } from 'common';

import { Button } from '@/components/core';

export interface InstrumentOverviewProps {
  instrument: InstrumentInterface;
  onConfirm: () => void;
}

export const InstrumentOverview = ({ instrument, onConfirm }: InstrumentOverviewProps) => {
  return (
    <div>
      <h3 className="mt-8 mb-5 font-semibold">Overview</h3>
      <div className="mt-3">
        <h5 className="font-semibold">Description</h5>
        <span>{instrument.details.description}</span>
      </div>
      <div className="mt-3">
        <h5 className="font-semibold">Instructions</h5>
        <span>{instrument.details.instructions}</span>
      </div>
      <div className="mt-3">
        <h5 className="font-semibold">Estimated Completion</h5>
        <span>{instrument.details.estimatedDuration} Minute(s)</span>
      </div>
      <Button className="mt-3" type="button" onClick={onConfirm}>
        Next
      </Button>
    </div>
  );
};
