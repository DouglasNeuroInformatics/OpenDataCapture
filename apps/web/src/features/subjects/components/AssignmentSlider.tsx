import { Button, Slider } from '@douglasneuroinformatics/ui';
import type { Assignment } from '@open-data-capture/types';
import { useTranslation } from 'react-i18next';

export type AssignmentSliderProps = {
  assignment: Assignment | null;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

/** Component for modifying an existing assignment */
export const AssignmentSlider = ({ assignment, isOpen, setIsOpen }: AssignmentSliderProps) => {
  const { t } = useTranslation(['common', 'subjects']);
  return (
    <Slider isOpen={isOpen} setIsOpen={() => setIsOpen(false)} title={assignment?.instrument.details.title}>
      <p>{assignment?.instrument.details.description}</p>
      <div className="mt-3 flex gap-2">
        <Button className="w-full text-sm" label={t('cancel')} variant="danger" />
        <Button
          disabled
          className="w-full whitespace-nowrap text-sm"
          label={t('subjects:assignmentSlider.resendNotification')}
          variant="secondary"
        />
      </div>
    </Slider>
  );
};
