import React, { memo } from 'react';

import { Button, Dialog } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';

export type NavigationBlockerDialogProps = {
  message: string;
  onCancel?: () => void;
  onConfirm?: () => void;
  open: boolean;
};

export const NavigationBlockerDialog = memo<NavigationBlockerDialogProps>(function NavigationBlockerDialog({
  message,
  onCancel,
  onConfirm,
  open
}) {
  const { t } = useTranslation();
  return (
    <Dialog open={open}>
      <Dialog.Content data-testid="blocker-dialog" onOpenAutoFocus={(event) => event.preventDefault()}>
        <Dialog.Header>
          <Dialog.Title className="flex items-center gap-2">{t({ en: 'Warning', fr: 'Avertissement' })}</Dialog.Title>
          <Dialog.Description>{message}</Dialog.Description>
        </Dialog.Header>
        <Dialog.Footer>
          <Button className="min-w-16" type="button" variant="outline" onClick={onConfirm}>
            {t('libui.yes')}
          </Button>
          <Button className="min-w-16" type="button" variant="primary" onClick={onCancel}>
            {t('libui.no')}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
});

export type NavigationBlockerProps = {
  active: boolean;
  message: string;
};

export type NavigationBlockerComponent = React.ComponentType<NavigationBlockerProps>;
