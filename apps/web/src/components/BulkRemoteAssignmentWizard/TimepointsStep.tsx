import React, { useState } from 'react';

import { toBasicISOString } from '@douglasneuroinformatics/libjs';
import { Button, Input, Select } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { PlusIcon } from 'lucide-react';

import { StepLayout } from './StepLayout';
import { TimepointTable } from './TimepointTable';

import type { DraftTimepoint, WizardStep } from './types';

type InstrumentOption = { id: string; title: string };

type TimepointsStepProps = {
  /** Prefilled expiry for a newly added timepoint, from the instance default. */
  defaultExpiresAt: string;
  instruments: InstrumentOption[];
  isLoading?: boolean;
  onBack: () => void;
  onChange: (timepoints: DraftTimepoint[]) => void;
  onConfirm: () => void;
  onStepChange: (step: WizardStep) => void;
  subjectCount: number;
  /** Held by the wizard, so returning from review does not discard the list. */
  timepoints: DraftTimepoint[];
};

/**
 * Build the list of instruments to assign and when each expires. Every timepoint applies to every
 * selected subject, so the batch is `subjects x timepoints` assignments.
 */
export const TimepointsStep = ({
  defaultExpiresAt,
  instruments,
  isLoading,
  onBack,
  onChange,
  onConfirm,
  onStepChange,
  subjectCount,
  timepoints
}: TimepointsStepProps) => {
  const { t } = useTranslation();
  const [instrumentId, setInstrumentId] = useState('');
  const [expiresAt, setExpiresAt] = useState(defaultExpiresAt);

  // An instrument already in the list cannot be added again: two live assignments for the same
  // subject and instrument is exactly the conflict the API refuses.
  const available = instruments.filter(
    (instrument) => !timepoints.some((timepoint) => timepoint.instrumentId === instrument.id)
  );

  const todayISO = toBasicISOString(new Date());

  const add = () => {
    const instrument = instruments.find(({ id }) => id === instrumentId);
    if (!instrument || !expiresAt || expiresAt <= todayISO) {
      return;
    }
    onChange([...timepoints, { expiresAt, instrumentId: instrument.id, instrumentTitle: instrument.title }]);
    setInstrumentId('');
    setExpiresAt(defaultExpiresAt);
  };

  return (
    <StepLayout
      description={t({
        en: `Each instrument is assigned to all ${subjectCount} selected subjects, with its own expiry.`,
        fr: `Chaque instrument est attribué aux ${subjectCount} sujets sélectionnés, avec sa propre date d’expiration.`
      })}
      footer={
        <React.Fragment>
          <Button type="button" variant="outline" onClick={onBack}>
            {t({ en: 'Back', fr: 'Retour' })}
          </Button>
          <Button
            data-testid="bulk-confirm-timepoints"
            disabled={timepoints.length === 0 || isLoading}
            type="button"
            onClick={onConfirm}
          >
            {t({ en: 'Review', fr: 'Réviser' })}
          </Button>
        </React.Fragment>
      }
      step="INSTRUMENTS"
      title={t({ en: 'Choose Instruments', fr: 'Choisir les instruments' })}
      onStepChange={onStepChange}
    >
      <div className="flex flex-col gap-4" data-testid="bulk-timepoints-step">
        {/* Fixed column widths, and `minmax(0, …)` on the select so a long instrument title clips
          instead of widening its column. Laid out with flex and a min-width, the row re-flowed every
          time a different instrument was chosen. */}
        <div className="grid items-end gap-3 sm:grid-cols-[minmax(0,20rem)_10rem_max-content]">
          <div className="flex min-w-0 flex-col gap-1">
            <label className="text-sm font-medium" htmlFor="bulk-instrument">
              {t({ en: 'Instrument', fr: 'Instrument' })}
            </label>
            <Select value={instrumentId} onValueChange={setInstrumentId}>
              <Select.Trigger className="w-full" data-testid="bulk-instrument-select" id="bulk-instrument">
                <span className="truncate">
                  <Select.Value placeholder={t({ en: 'Choose an Instrument', fr: 'Choisir un instrument' })} />
                </span>
              </Select.Trigger>
              <Select.Content>
                {available.map((instrument) => (
                  <Select.Item key={instrument.id} value={instrument.id}>
                    {instrument.title}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" htmlFor="bulk-expiry">
              {t({ en: 'Expires On', fr: 'Expire le' })}
            </label>
            <Input
              className="w-full"
              data-testid="bulk-expiry-input"
              id="bulk-expiry"
              min={todayISO}
              type="date"
              value={expiresAt}
              onChange={(event) => setExpiresAt(event.target.value)}
            />
          </div>
          <Button
            className="gap-2"
            data-testid="bulk-add-timepoint"
            disabled={!instrumentId || !expiresAt || expiresAt <= todayISO}
            type="button"
            variant="outline"
            onClick={add}
          >
            <PlusIcon className="h-4 w-4" />
            {t({ en: 'Add', fr: 'Ajouter' })}
          </Button>
        </div>

        <div data-testid="bulk-timepoint-list">
          {timepoints.length === 0 ? (
            <p className="text-muted-foreground text-sm italic">
              {t({ en: 'No instruments added yet.', fr: 'Aucun instrument ajouté.' })}
            </p>
          ) : (
            <TimepointTable
              timepoints={timepoints}
              onRemove={(removed) => onChange(timepoints.filter((item) => item.instrumentId !== removed.instrumentId))}
            />
          )}
        </div>
      </div>
    </StepLayout>
  );
};
