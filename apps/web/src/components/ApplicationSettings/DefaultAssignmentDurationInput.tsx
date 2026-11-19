import { useCallback, useEffect, useRef, useState } from 'react';
import type React from 'react';

import { Input } from '@douglasneuroinformatics/libui/components';
import { DEFAULT_ASSIGNMENT_DURATION_DAYS } from '@opendatacapture/schemas/assignment';
import { MAX_ASSIGNMENT_DURATION_DAYS } from '@opendatacapture/schemas/setup';

import { useSetupStateQuery } from '@/hooks/useSetupStateQuery';
import { parseDurationDays } from '@/utils/assignment-duration';

import type { AutosaveSetupState } from './types';

const DURATION_AUTOSAVE_DELAY = 700;

type DefaultAssignmentDurationInputProps = {
  autosave: AutosaveSetupState;
};

export const DefaultAssignmentDurationInput = ({ autosave }: DefaultAssignmentDurationInputProps) => {
  const setupStateQuery = useSetupStateQuery();

  // The input holds its own draft while the admin types. The saved draft is committed after a brief pause,
  // on blur, and on unmount — so navigating away (e.g. clicking a sidebar link) still persists the value.
  // It is resynced whenever the server value changes underneath (a save invalidates and refetches).
  const savedDurationDays = setupStateQuery.data.defaultAssignmentDurationDays ?? DEFAULT_ASSIGNMENT_DURATION_DAYS;
  const [durationDays, setDurationDays] = useState(String(savedDurationDays));
  const [syncedDurationDays, setSyncedDurationDays] = useState(savedDurationDays);
  if (syncedDurationDays !== savedDurationDays) {
    setSyncedDurationDays(savedDurationDays);
    setDurationDays(String(savedDurationDays));
  }

  const durationDebounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const durationDraftRef = useRef(durationDays);
  durationDraftRef.current = durationDays;
  const savedDurationRef = useRef(savedDurationDays);
  savedDurationRef.current = savedDurationDays;

  const saveDurationIfChanged = useCallback(() => {
    const parsed = parseDurationDays(durationDraftRef.current);
    if (parsed !== null && parsed !== savedDurationRef.current) {
      autosave({ defaultAssignmentDurationDays: parsed });
    }
    return parsed;
  }, [autosave]);

  const handleDurationBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    clearTimeout(durationDebounceRef.current);
    const parsed = parseDurationDays(event.target.value);
    if (parsed !== null && parsed !== savedDurationRef.current) {
      setDurationDays(String(parsed));
      autosave({ defaultAssignmentDurationDays: parsed });
    } else if (parsed === null) {
      setDurationDays(String(savedDurationRef.current));
    }
  };

  useEffect(() => {
    return () => {
      clearTimeout(durationDebounceRef.current);
      saveDurationIfChanged();
    };
  }, [saveDurationIfChanged]);

  return (
    <Input
      className="w-22.5 shrink-0"
      data-testid="default-assignment-duration-input"
      inputMode="numeric"
      max={MAX_ASSIGNMENT_DURATION_DAYS}
      min={1}
      type="number"
      value={durationDays}
      onBlur={handleDurationBlur}
      onChange={(event) => {
        setDurationDays(event.target.value);
        clearTimeout(durationDebounceRef.current);
        durationDebounceRef.current = setTimeout(saveDurationIfChanged, DURATION_AUTOSAVE_DELAY);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.currentTarget.blur();
        }
      }}
    />
  );
};
