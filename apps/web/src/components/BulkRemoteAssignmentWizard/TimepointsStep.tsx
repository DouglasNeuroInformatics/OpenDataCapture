import React, { useState } from 'react';

import { Badge, Button, Input, Select } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { TrashIcon } from 'lucide-react';

import { StepLayout } from './StepLayout';

import type { DraftTimepoint, WizardStep } from './types';

type InstrumentOption = { id: string; title: string };

type TimepointsStepProps = {
  /** Prefilled expiry for a newly added timepoint, from the instance default. */
  defaultExpiresAt: string;
  instruments: InstrumentOption[];
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

  const add = () => {
    const instrument = instruments.find(({ id }) => id === instrumentId);
    if (!instrument || !expiresAt) {
      return;
    }
    onChange([...timepoints, { expiresAt, instrumentId: instrument.id, instrumentTitle: instrument.title }]);
    setInstrumentId('');
    setExpiresAt(defaultExpiresAt);
  };

  return (
    <StepLayout
      aside={
        <span className="text-sm font-medium" data-testid="bulk-assignment-total">
          {t({
            en: `${subjectCount * timepoints.length} assignments`,
            fr: `${subjectCount * timepoints.length} tâches`
          })}
        </span>
      }
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
            disabled={timepoints.length === 0}
            type="button"
            onClick={onConfirm}
          >
            {t({ en: 'Review', fr: 'Réviser' })}
          </Button>
        </React.Fragment>
      }
      step="INSTRUMENTS"
      title={t({ en: 'Choose instruments', fr: 'Choisir les instruments' })}
      onStepChange={onStepChange}
    >
      <div className="flex flex-col gap-4" data-testid="bulk-timepoints-step">
        {/* Fixed column widths, and `minmax(0, …)` on the select so a long instrument title clips
          instead of widening its column. Laid out with flex and a min-width, the row re-flowed every
          time a different instrument was chosen. */}
        <div className="grid items-end gap-3 sm:grid-cols-[minmax(0,20rem)_10rem_auto]">
          <div className="flex min-w-0 flex-col gap-1">
            <label className="text-sm font-medium" htmlFor="bulk-instrument">
              {t({ en: 'Instrument', fr: 'Instrument' })}
            </label>
            <Select value={instrumentId} onValueChange={setInstrumentId}>
              <Select.Trigger className="w-full" data-testid="bulk-instrument-select" id="bulk-instrument">
                <span className="truncate">
                  <Select.Value placeholder={t({ en: 'Choose an instrument', fr: 'Choisir un instrument' })} />
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
              {t({ en: 'Expires on', fr: 'Expire le' })}
            </label>
            <Input
              className="w-full"
              data-testid="bulk-expiry-input"
              id="bulk-expiry"
              type="date"
              value={expiresAt}
              onChange={(event) => setExpiresAt(event.target.value)}
            />
          </div>
          <Button data-testid="bulk-add-timepoint" disabled={!instrumentId || !expiresAt} type="button" onClick={add}>
            {t({ en: 'Add', fr: 'Ajouter' })}
          </Button>
        </div>

        <div className="flex flex-col gap-2" data-testid="bulk-timepoint-list">
          {timepoints.length === 0 ? (
            <p className="text-muted-foreground text-sm italic">
              {t({ en: 'No instruments added yet.', fr: 'Aucun instrument ajouté.' })}
            </p>
          ) : (
            timepoints.map((timepoint) => (
              <div
                className="flex items-center justify-between gap-3 rounded-md border px-3 py-2"
                key={timepoint.instrumentId}
              >
                <span className="truncate text-sm" title={timepoint.instrumentTitle}>
                  {timepoint.instrumentTitle}
                </span>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant="secondary">{timepoint.expiresAt}</Badge>
                  <button
                    aria-label={t({ en: 'Remove instrument', fr: "Retirer l'instrument" })}
                    className="text-muted-foreground hover:text-destructive p-1"
                    type="button"
                    onClick={() => onChange(timepoints.filter((item) => item.instrumentId !== timepoint.instrumentId))}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </StepLayout>
  );
};
