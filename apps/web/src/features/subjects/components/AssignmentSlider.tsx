import { Button, Slider, useNotificationsStore } from '@douglasneuroinformatics/ui';
import type { AssignmentSummary, Language, UpdateAssignmentData } from '@open-data-capture/types';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

export type AssignmentSliderProps = {
  assignment: AssignmentSummary | null;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

/** Component for modifying an existing assignment */
export const AssignmentSlider = ({ assignment, isOpen, setIsOpen }: AssignmentSliderProps) => {
  const { i18n, t } = useTranslation(['common', 'subjects']);
  const notifications = useNotificationsStore();
  const mutation = useMutation({
    mutationFn: async (update: UpdateAssignmentData) => {
      await axios.patch(`/v1/assignments/${assignment?.id}`, update);
      notifications.addNotification({ type: 'success' });
      setIsOpen(false);
    }
  });

  const title =
    typeof assignment?.instrument.details.title === 'string'
      ? assignment.instrument.details.title
      : assignment?.instrument.details.title[i18n.resolvedLanguage as Language] ?? assignment?.instrument.name;

  return (
    <Slider isOpen={isOpen} setIsOpen={() => setIsOpen(false)} title={title}>
      <p>{assignment?.instrument.details.description}</p>
      <div className="mt-3 flex gap-2">
        <Button
          className="w-full text-sm"
          disabled={assignment?.status === 'CANCELED'}
          label={t('cancel')}
          variant="danger"
          onClick={() => void cancelAssignment()}
        />
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
