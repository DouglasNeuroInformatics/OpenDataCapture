import React from 'react';

import { Button, LegacySlider } from '@douglasneuroinformatics/libui/components';
import type { Assignment } from '@opendatacapture/schemas/assignment';
import { useTranslation } from 'react-i18next';

import { useInstrument } from '@/hooks/useInstrument';

export type AssignmentSliderProps = {
  assignment: Assignment | null;
  isOpen: boolean;
  onCancel: (assignment: Assignment) => void;
  setIsOpen: (isOpen: boolean) => void;
};

/** Component for modifying an existing assignment */
export const AssignmentSlider = ({ assignment, isOpen, onCancel, setIsOpen }: AssignmentSliderProps) => {
  const { t } = useTranslation(['core', 'datahub']);
  const instrument = useInstrument(assignment?.instrumentId ?? null);

  return (
    <LegacySlider isOpen={isOpen} setIsOpen={setIsOpen} title={instrument?.details.title}>
      {instrument && (
        <div className="flex h-full flex-col">
          <div className="flex gap-1 text-sm">
            <a
              className="overflow-hidden text-ellipsis whitespace-nowrap text-sm hover:underline"
              href={assignment!.url}
              rel="noreferrer"
              target="_blank"
            >
              {t('datahub:assignments.link')}
            </a>
          </div>
          <div className="mt-auto flex gap-2">
            <Button
              className="w-full text-sm"
              disabled={assignment?.status !== 'OUTSTANDING'}
              label={t('cancel')}
              variant="danger"
              onClick={() => onCancel(assignment!)}
            />
            <Button
              disabled
              className="w-full whitespace-nowrap text-sm"
              label={t('datahub:assignments.resendNotification')}
              variant="secondary"
            />
          </div>
        </div>
      )}
    </LegacySlider>
  );
};
