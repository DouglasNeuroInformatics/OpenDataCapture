import { Button, Slider } from '@douglasneuroinformatics/ui';
import type { AssignmentSummary, Language } from '@open-data-capture/types';
import { useTranslation } from 'react-i18next';

import { resolveFormSummary } from '@/utils/translate-instrument';

export type AssignmentSliderProps = {
  assignment: AssignmentSummary | null;
  isOpen: boolean;
  onCancel: (assignment: AssignmentSummary) => void;
  setIsOpen: (isOpen: boolean) => void;
};

/** Component for modifying an existing assignment */
export const AssignmentSlider = ({ assignment, isOpen, onCancel, setIsOpen }: AssignmentSliderProps) => {
  const { i18n, t } = useTranslation(['common', 'subjects']);
  const instrument = assignment ? resolveFormSummary(assignment.instrument, i18n.resolvedLanguage as Language) : null;

  return (
    <Slider isOpen={isOpen} setIsOpen={setIsOpen} title={instrument?.details.title}>
      {instrument && (
        <>
          <p>{instrument.details.description}</p>
          <div className="mt-3 flex gap-2">
            <Button
              className="w-full text-sm"
              disabled={assignment?.status === 'CANCELED'}
              label={t('cancel')}
              variant="danger"
              onClick={() => onCancel(assignment!)}
            />
            <Button
              disabled
              className="w-full whitespace-nowrap text-sm"
              label={t('subjects:assignmentSlider.resendNotification')}
              variant="secondary"
            />
          </div>
        </>
      )}
    </Slider>
  );
};
