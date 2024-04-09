import React from 'react';

import { Button, Dialog } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from 'react-i18next';

export type EditorHelpModalProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

export const EditorHelpModal = ({ isOpen, setIsOpen }: EditorHelpModalProps) => {
  const { t } = useTranslation('core');
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        <Button variant="outline">Edit Profile</Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>{t('help')}</Dialog.Title>
        </Dialog.Header>
        <div>
          <p>{t('editor.keyboardShortcuts.format', { keybinding: 'Alt + F' })}</p>
        </div>
      </Dialog.Content>
    </Dialog>
  );
};
