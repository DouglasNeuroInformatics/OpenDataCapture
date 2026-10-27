import { useState } from 'react';

import { Button, Dialog } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { useNavigate } from '@tanstack/react-router';
import { StopCircle } from 'lucide-react';

import { useAppStore } from '@/store';

import { NavButton } from '../NavButton';

type EndSessionButtonProps = {
  className?: string;
  onEnded?: () => void;
};

export const EndSessionButton = ({ className, onEnded }: EndSessionButtonProps) => {
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const currentSession = useAppStore((store) => store.currentSession);
  const endSession = useAppStore((store) => store.endSession);
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Dialog open={isConfirmationOpen} onOpenChange={setIsConfirmationOpen}>
      <Dialog.Trigger asChild>
        <NavButton
          className={className}
          disabled={currentSession === null}
          icon={StopCircle}
          isActive={false}
          label={t('layout.navLinks.endSession')}
          url="#"
        />
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>{t('layout.endSessionModal.title')}</Dialog.Title>
          <Dialog.Description>{t('layout.endSessionModal.message')}</Dialog.Description>
        </Dialog.Header>
        <Dialog.Footer>
          <Button
            className="min-w-20"
            onClick={() => {
              endSession();
              void navigate({ ignoreBlocker: true, to: '/session/start-session' }).then(() => {
                setIsConfirmationOpen(false);
                onEnded?.();
              });
            }}
          >
            {t('core.yes')}
          </Button>
          <Button className="min-w-20" type="button" variant="outline" onClick={() => setIsConfirmationOpen(false)}>
            {t('core.no')}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
