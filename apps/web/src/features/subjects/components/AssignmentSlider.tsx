import { Button, Slider } from '@douglasneuroinformatics/ui';
import type { Assignment } from '@open-data-capture/common/assignment';
import { useTranslation } from 'react-i18next';

import { useInstrumentBundle } from '@/hooks/useInstrumentBundle';

export type AssignmentSliderProps = {
  assignment: Assignment | null;
  isOpen: boolean;
  onCancel: (assignment: Assignment) => void;
  setIsOpen: (isOpen: boolean) => void;
};

/** Component for modifying an existing assignment */
export const AssignmentSlider = ({ assignment, isOpen, onCancel, setIsOpen }: AssignmentSliderProps) => {
  const { i18n, t } = useTranslation(['core', 'subjects']);
  const instrument = useInstrumentBundle(assignment?.instrumentBundle);

  const title =
    typeof instrument?.details.title === 'string'
      ? instrument?.details.title
      : instrument?.details.title[i18n.resolvedLanguage!];

  return (
    <Slider isOpen={isOpen} setIsOpen={setIsOpen} title={title}>
      {title && (
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
