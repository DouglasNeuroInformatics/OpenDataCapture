import React from 'react';

import { Button, Input, Label, Sheet } from '@douglasneuroinformatics/libui/components';
import { CopyButton } from '@opendatacapture/react-core';
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
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <Sheet.Content className="flex h-full flex-col">
        <Sheet.Header>
          <Sheet.Title>{instrument?.details.title}</Sheet.Title>
          <Sheet.Description>{t('datahub:assignments.assignmentSliderDesc')}</Sheet.Description>
        </Sheet.Header>
        <Sheet.Body className="flex-grow">
          {instrument && (
            <div className="flex flex-col gap-3">
              <Label asChild>
                <a className="hover:underline" href={assignment!.url} rel="noreferrer" target="_blank">
                  {t('datahub:assignments.link')}
                </a>
              </Label>
              <div className="flex gap-2">
                <Input readOnly className="h-9" id="link" value={assignment!.url} />
                <CopyButton size="sm" text={assignment!.url} variant="outline" />
              </div>
            </div>
          )}
        </Sheet.Body>
        <Sheet.Footer>
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
        </Sheet.Footer>
      </Sheet.Content>
      <Sheet.Overlay />
    </Sheet>
  );
};
