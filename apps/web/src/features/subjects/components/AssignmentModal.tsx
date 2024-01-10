/* eslint-disable perfectionist/sort-objects */

import { Form, Modal } from '@douglasneuroinformatics/ui';
import { $CreateAssignmentData } from '@open-data-capture/common/assignment';
import type { CreateAssignmentData } from '@open-data-capture/common/assignment';
import { useTranslation } from 'react-i18next';

export type AssignmentModalProps = {
  instrumentOptions: Record<string, string>;
  isOpen: boolean;
  onSubmit: (data: Omit<CreateAssignmentData, 'subjectId'>) => void;
  setIsOpen: (isOpen: boolean) => void;
};

/** Component for creating a new assignment */
export const AssignmentModal = ({ instrumentOptions, isOpen, onSubmit, setIsOpen }: AssignmentModalProps) => {
  const { t } = useTranslation(['subjects', 'common']);

  return (
    <Modal open={isOpen} title="Assignment" onClose={() => setIsOpen(false)}>
      <Form<Omit<CreateAssignmentData, 'subjectId'>>
        content={{
          instrumentId: {
            kind: 'options',
            label: t('common:instrument'),
            options: instrumentOptions
          },
          expiresAt: {
            kind: 'date',
            label: t('assignments.expiresAt')
          }
        }}
        validationSchema={$CreateAssignmentData.omit({ subjectId: true })}
        onSubmit={onSubmit}
      />
    </Modal>
  );
};
