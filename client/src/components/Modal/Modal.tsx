import React, { useState } from 'react';

import { Dialog } from '@headlessui/react';

interface ModalProps {
  title: string;
  description: string;
}

const Modal = ({ title, description }: ModalProps) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
      <Dialog.Panel>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Description>{description}</Dialog.Description>
        <p>
          Are you sure you want to deactivate your account? All of your data will be permanently removed. This action
          cannot be undone.
        </p>
        <button onClick={() => setIsOpen(false)}>Deactivate</button>
        <button onClick={() => setIsOpen(false)}>Cancel</button>
      </Dialog.Panel>
    </Dialog>
  );
};

export { Modal as default, type ModalProps };
