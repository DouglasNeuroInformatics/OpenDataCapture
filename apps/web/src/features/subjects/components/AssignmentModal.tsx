import { Modal } from '@douglasneuroinformatics/ui';

export type AssignmentModalProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

export const AssignmentModal = ({ isOpen, setIsOpen }: AssignmentModalProps) => {
  return (
    <Modal open={isOpen} title="Assignment" onClose={() => setIsOpen(false)}>
      Test
    </Modal>
  );
};
