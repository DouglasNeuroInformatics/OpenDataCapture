import { Button, Slider } from '@douglasneuroinformatics/ui';
import type { AssignmentSummary } from '@open-data-capture/common/assignment';
import type { Language } from '@open-data-capture/common/core';
import { translateFormSummary } from '@open-data-capture/react-core/utils/translate-instrument';
import { useTranslation } from 'react-i18next';

export type AssignmentSliderProps = {
  assignment: AssignmentSummary | null;
  isOpen: boolean;
  onCancel: (assignment: AssignmentSummary) => void;
  setIsOpen: (isOpen: boolean) => void;
};

/** Component for modifying an existing assignment */
export const AssignmentSlider = ({ assignment, isOpen, onCancel, setIsOpen }: AssignmentSliderProps) => {
  const { i18n, t } = useTranslation(['common', 'subjects']);
  const instrument = assignment ? translateFormSummary(assignment.instrument, i18n.resolvedLanguage as Language) : null;

  return (
    <Slider isOpen={isOpen} setIsOpen={setIsOpen} title={instrument?.details.title}>
      {instrument && (
        <div className="flex h-full flex-col">
          <div className="flex gap-1 text-sm">
            <a
              className="overflow-hidden text-ellipsis whitespace-nowrap text-sm hover:underline"
              href={assignment!.url}
              rel="noreferrer"
              target="_blank"
            >
              {t('subjects:assignments.link')}
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
              label={t('subjects:assignments.resendNotification')}
              variant="secondary"
            />
          </div>
        </div>
      )}
    </Slider>
  );
};
