import { Modal } from '@douglasneuroinformatics/ui';
import { useTranslation } from 'react-i18next';

export type EditorHelpModalProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

export const EditorHelpModal = ({ isOpen, setIsOpen }: EditorHelpModalProps) => {
  const { t } = useTranslation('core');
  return (
    <Modal showCloseButton open={isOpen} title={t('help')} onClose={() => setIsOpen(false)}>
      <p>{t('editor.keyboardShortcuts.format', { keybinding: 'Alt + F' })}</p>
    </Modal>
  );
};
